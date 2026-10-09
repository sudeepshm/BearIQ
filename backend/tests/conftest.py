import hashlib
import io
import json
import os
import zipfile
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from app.core.config import get_settings
from app.db.database import Base, get_db
from app.integrations.gemini import get_provider
from app.main import app
from app.schemas.memory import Extraction, Candidate, Classification, Relation


class FakeProvider:
    fail = False
    mode = "normal"

    def embed(self, text, query=False):
        return [1.0] + [0.0] * 767

    def structured(self, instruction, data, schema):
        from app.integrations.gemini import ProviderError

        if self.fail:
            raise ProviderError("Test failure")
        if schema is Classification:
            return Classification(type="fact")
        if schema is Relation:
            # Deterministic fixture simulates Gemini relation judgments, not semantic accuracy.
            a, b = data["existing"], data["candidate"]
            relation = "contradiction" if ("JavaScript" in a) != ("JavaScript" in b) else "same"
            return Relation(relation=relation)
        if schema is Extraction:
            candidates = []
            for msg in data:
                if msg["role"] != "user":
                    continue
                content = "User prefers JavaScript" if "JavaScript" in msg["content"] else "User prefers Python"
                candidates.append(
                    Candidate(
                        content=content,
                        message_ids=["invented" if self.mode == "forged" else msg["id"]],
                        source_type="inferred" if self.mode == "inferred" else "explicit",
                        sensitivity="sensitive" if self.mode == "sensitive" else "personal",
                    )
                )
            return Extraction(candidates=candidates)
        raise AssertionError(schema)


@pytest.fixture
def setup(monkeypatch):
    monkeypatch.setenv(
        "API_KEY_HASHES",
        json.dumps(
            {hashlib.sha256(t.encode()).hexdigest(): u for t, u in [("alice-token", "alice"), ("bob-token", "bob")]}
        ),
    )
    get_settings.cache_clear()
    url = os.environ.get("TEST_DATABASE_URL")
    engine = (
        create_engine(url)
        if url
        else create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    )
    if url:
        from sqlalchemy import text

        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    # TEST_DATABASE_URL must reference a disposable test database.
    Base.metadata.create_all(engine)

    def database():
        with Session(engine, expire_on_commit=False) as db:
            try:
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise

    provider = FakeProvider()
    app.dependency_overrides[get_db] = database
    app.dependency_overrides[get_provider] = lambda: provider
    monkeypatch.setattr("app.api.memories.get_provider", lambda: provider)
    with TestClient(app) as client:
        client.headers["Authorization"] = "Bearer alice-token"
        yield client, provider, engine
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()
    get_settings.cache_clear()


def export(text="I prefer Python", source="c1", mid="m1"):
    return [
        {
            "id": source,
            "title": "Preferences",
            "create_time": 1700000000,
            "current_node": mid,
            "mapping": {
                mid: {
                    "parent": None,
                    "message": {
                        "id": mid,
                        "author": {"role": "user"},
                        "content": {"parts": [text]},
                        "create_time": 1700000000,
                    },
                }
            },
        }
    ]


def archive(payload=None, name="conversations.json"):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w") as z:
        z.writestr(name, json.dumps(export() if payload is None else payload))
    return stream.getvalue()


def upload(client, payload=None):
    return client.post("/api/upload", files={"file": ("export.zip", archive(payload), "application/zip")})
