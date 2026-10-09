from sqlalchemy import select
from fastapi import HTTPException
from app.models.memory import Memory
from app.integrations.embeddings import cosine


def owned(db, user_id, memory_id):
    memory = db.scalar(select(Memory).where(Memory.id == memory_id, Memory.user_id == user_id))
    if memory is None:
        raise HTTPException(404, "Memory not found")
    return memory


def nearest(db, user_id, embedding, statuses=("active",), limit=20, include_sensitive=False):
    query = select(Memory).where(Memory.user_id == user_id, Memory.status.in_(statuses))
    if not include_sensitive:
        query = query.where(Memory.sensitivity != "sensitive")
    if db.bind.dialect.name == "postgresql":
        query = query.order_by(Memory.embedding.cosine_distance(embedding)).limit(limit)
        rows = db.scalars(query).all()
    else:  # SQLite is supported only for isolated unit tests.
        rows = db.scalars(query).all()
    return sorted(((cosine(embedding, m.embedding), m) for m in rows), key=lambda x: x[0], reverse=True)[:limit]


def serialize(memory):
    return {
        k: getattr(memory, k)
        for k in (
            "id",
            "content",
            "type",
            "importance",
            "confidence",
            "temporality",
            "source_type",
            "sensitivity",
            "status",
            "evidence_count",
            "last_seen",
            "last_confirmed",
            "created_at",
            "updated_at",
            "supersedes_id",
            "conflict_id",
        )
    }
