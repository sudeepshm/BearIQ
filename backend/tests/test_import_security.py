import io
import zipfile
import pytest
from app.core.config import Settings
from app.services.validator import read_export, InvalidArchive
from app.services.parser.chatgpt import parse_export
from app.services.chunker import chunks
from conftest import archive, export


@pytest.mark.parametrize(
    "name", ["../conversations.json", "/conversations.json", "C:/conversations.json", "..\\conversations.json"]
)
def test_traversal(name):
    with pytest.raises(InvalidArchive):
        read_export(archive(name=name), Settings())


@pytest.mark.parametrize("data", [b"not a zip", archive(payload={}), archive(payload=[]), archive(name="wrong.json")])
def test_invalid_structure(data):
    with pytest.raises(InvalidArchive):
        read_export(data, Settings())


def test_zip_bomb():
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("conversations.json", "0" * 1000000)
    with pytest.raises(InvalidArchive, match="compression"):
        read_export(stream.getvalue(), Settings())


def test_size_limit():
    with pytest.raises(InvalidArchive, match="size"):
        read_export(archive(), Settings(max_upload_bytes=10))


def test_selected_branch_and_system_noise():
    raw = export()[0]
    raw["mapping"]["m1"]["parent"] = "root"
    raw["mapping"]["root"] = {
        "parent": None,
        "message": {"author": {"role": "system"}, "content": {"parts": ["noise"]}},
    }
    raw["mapping"]["alternative"] = {
        "parent": "root",
        "message": {"id": "other", "author": {"role": "user"}, "content": {"parts": ["discarded"]}},
    }
    parsed = parse_export([raw], "alice")[0]
    assert len(parsed["messages"]) == 1
    assert parsed["messages"][0]["source_id"] == "m1"
    assert parsed["id"] != parse_export([raw], "bob")[0]["id"]


def test_cycle():
    raw = export()
    raw[0]["mapping"]["m1"]["parent"] = "m1"
    with pytest.raises(InvalidArchive):
        parse_export(raw, "alice")


def test_chunks_preserve_order_and_bound_huge_message():
    messages = [{"id": str(i), "content": "x" * 1800, "position": i} for i in range(5)]
    settings = Settings(chunk_messages=3, chunk_overlap=1, chunk_characters=2000)
    result = list(chunks(messages, settings))
    assert all(sum(len(m["content"]) for m in chunk) <= 2000 for chunk in result)
    assert {m["id"] for chunk in result for m in chunk} == {str(i) for i in range(5)}
    result = list(chunks([{"id": "huge", "content": "y" * 7000}], settings))
    assert len(result) == 4
    assert all(m["id"] == "huge" for chunk in result for m in chunk)


def test_http_limit_without_trusting_content_length(setup, monkeypatch):
    client, _, _ = setup
    from app.core.config import get_settings

    monkeypatch.setenv("MAX_UPLOAD_BYTES", "100")
    get_settings.cache_clear()
    assert client.post("/api/upload", content=b"x" * (1024 * 1024 + 101)).status_code == 413
