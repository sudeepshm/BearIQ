from sqlalchemy import select, func
from app.models.memory import Memory, MemoryEvidence
from app.models.conversation import Conversation
from app.models.message import Message
from conftest import upload, export


def test_import_query_context_skill_and_evidence(setup):
    client, _, _ = setup
    response = upload(client)
    assert response.status_code == 200, response.text
    assert response.json()["created"] == 1
    row = client.get("/api/memories").json()["memories"][0]
    assert row["type"] == "technical_preference"
    evidence = client.get(f"/api/memories/{row['id']}").json()["evidence"]
    assert evidence[0]["text"] == "I prefer Python"
    assert evidence[0]["source_message_id"] == "m1"
    query = client.post("/api/memories/query", json={"query": "backend"}).json()
    assert query["memories"][0]["id"] == row["id"]
    context = client.post("/api/context", json={"query": "backend"}).json()
    assert context["memories"]["technical_preference"][0]["content"] == row["content"]
    skill = client.post("/api/skills/generate", json={"query": "backend"})
    assert skill.status_code == 201
    assert row["id"] in skill.json()["markdown"]
    assert len(client.get("/api/skills").json()["skills"]) == 1


def test_reimport_is_evidence_idempotent(setup):
    client, _, engine = setup
    assert upload(client).status_code == 200
    before = client.get("/api/memories").json()["memories"][0]
    response = upload(client)
    assert response.json()["merged"] == 1
    after = client.get("/api/memories").json()["memories"][0]
    assert before["evidence_count"] == after["evidence_count"] == 1
    assert before["confidence"] == after["confidence"]
    with engine.connect() as conn:
        for table in (Memory, MemoryEvidence, Message, Conversation):
            assert conn.scalar(select(func.count()).select_from(table)) == 1


def test_new_support_adds_evidence(setup):
    client, _, _ = setup
    upload(client)
    response = upload(client, export("Python is my preference", "c2", "m2"))
    assert response.json()["merged"] == 1
    row = client.get("/api/memories").json()["memories"][0]
    assert row["evidence_count"] == 2
    assert row["confidence"] > 0.8


def test_conflicts_wait_for_review_and_keep_history(setup):
    client, _, _ = setup
    upload(client)
    old = client.get("/api/memories").json()["memories"][0]
    response = upload(client, export("I now prefer JavaScript instead of Python", "c2", "m2"))
    assert response.json()["pending"] == 1
    pending = client.get("/api/memories?status=pending").json()["memories"][0]
    assert pending["conflict_id"] == old["id"]
    result = client.patch(f"/api/memories/{pending['id']}", json={"action": "accept"})
    assert result.status_code == 200
    assert result.json()["supersedes_id"] == old["id"]
    old_detail = client.get(f"/api/memories/{old['id']}").json()
    assert old_detail["status"] == "superseded" and old_detail["evidence"]
    assert len(client.get("/api/memories").json()["memories"]) == 1


def test_isolation_and_forged_user_id(setup):
    client, _, _ = setup
    upload(client)
    row = client.get("/api/memories").json()["memories"][0]
    client.headers["Authorization"] = "Bearer bob-token"
    assert client.get("/api/memories").json()["memories"] == []
    assert client.post("/api/memories/query", json={"query": "backend"}).json()["memories"] == []
    assert client.get(f"/api/memories/{row['id']}").status_code == 404
    assert client.delete(f"/api/memories/{row['id']}").status_code == 404
    assert client.patch(f"/api/memories/{row['id']}", json={"action": "accept"}).status_code == 404
    assert client.post("/api/memories/query", json={"query": "backend", "user_id": "alice"}).status_code == 422
    assert upload(client).json()["created"] == 1
    assert client.get("/api/memories").json()["memories"][0]["id"] != row["id"]


def test_failure_rolls_back_entire_import(setup):
    client, provider, engine = setup
    provider.fail = True
    assert upload(client).status_code == 502
    with engine.connect() as conn:
        assert conn.scalar(select(func.count()).select_from(Conversation)) == 0
        assert conn.scalar(select(func.count()).select_from(Message)) == 0


def test_fabricated_evidence_rejected(setup):
    client, provider, _ = setup
    provider.mode = "forged"
    assert upload(client).json()["rejected"] == 1
    assert client.get("/api/memories").json()["memories"] == []


def test_inferred_and_sensitive_require_review(setup):
    client, provider, _ = setup
    provider.mode = "sensitive"
    assert upload(client).json()["pending"] == 1
    row = client.get("/api/memories?status=pending").json()["memories"][0]
    client.patch(f"/api/memories/{row['id']}", json={"action": "accept"})
    assert client.post("/api/memories/query", json={"query": "backend"}).json()["memories"] == []
    assert (
        len(client.post("/api/memories/query", json={"query": "backend", "include_sensitive": True}).json()["memories"])
        == 1
    )


def test_edit_versions_and_invalidates_skills(setup):
    client, _, _ = setup
    upload(client)
    row = client.get("/api/memories").json()["memories"][0]
    client.post("/api/skills/generate", json={"query": "backend"})
    response = client.patch(f"/api/memories/{row['id']}", json={"action": "edit", "content": "User prefers JavaScript"})
    assert response.status_code == 200, response.text
    assert response.json()["supersedes_id"] == row["id"]
    assert response.json()["id"] != row["id"]
    assert client.get("/api/skills").json()["skills"] == []
    assert client.get(f"/api/memories/{row['id']}").json()["status"] == "superseded"


def test_delete_excludes_query_and_prevents_reimport(setup):
    client, _, _ = setup
    upload(client)
    row = client.get("/api/memories").json()["memories"][0]
    assert client.delete(f"/api/memories/{row['id']}").status_code == 204
    assert client.post("/api/memories/query", json={"query": "backend"}).json()["memories"] == []
    assert upload(client).json()["rejected"] == 1


def test_auth_required(setup):
    client, _, _ = setup
    client.headers.pop("Authorization")
    assert client.get("/health").status_code == 200
    assert client.get("/api/memories").status_code == 401


def test_manual_memory(setup):
    client, _, _ = setup
    response = client.post("/api/memories", json={"content": "User prefers Python"})
    assert response.status_code == 201, response.text
    assert response.json()["last_confirmed"]
    assert response.json()["evidence_count"] == 0


def test_changed_source_message_cannot_corrupt_evidence(setup):
    client, _, _ = setup
    upload(client)
    response = upload(client, export("I prefer JavaScript"))
    assert response.status_code == 422
    row = client.get("/api/memories").json()["memories"][0]
    assert client.get(f"/api/memories/{row['id']}").json()["evidence"][0]["text"] == "I prefer Python"


def test_inferred_candidate_is_not_active(setup):
    client, provider, _ = setup
    provider.mode = "inferred"
    assert upload(client).json()["pending"] == 1
    assert client.get("/api/memories").json()["memories"] == []
    row = client.get("/api/memories?status=pending").json()["memories"][0]
    assert row["confidence"] <= 0.75
