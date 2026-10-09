from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import String, DateTime, ForeignKey, JSON, Text, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.core.config import get_settings
from app.db.database import Base


def now():
    return datetime.now(timezone.utc)


def uid():
    return str(uuid4())


class Memory(Base):
    __tablename__ = "memories"
    __table_args__ = (
        CheckConstraint("confidence >= 0 AND confidence <= 1"),
        CheckConstraint("importance >= 0 AND importance <= 1"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    content: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String)
    importance: Mapped[float]
    confidence: Mapped[float]
    temporality: Mapped[str] = mapped_column(String)
    source_type: Mapped[str] = mapped_column(String)
    sensitivity: Mapped[str] = mapped_column(String, default="personal")
    status: Mapped[str] = mapped_column(String, default="active", index=True)
    embedding: Mapped[list] = mapped_column(Vector(get_settings().embedding_dimensions).with_variant(JSON(), "sqlite"))
    evidence_count: Mapped[int] = mapped_column(default=0)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    last_confirmed: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    supersedes_id: Mapped[str | None] = mapped_column(ForeignKey("memories.id"))
    conflict_id: Mapped[str | None] = mapped_column(ForeignKey("memories.id"))


class MemoryEvidence(Base):
    __tablename__ = "memory_evidence"
    __table_args__ = (UniqueConstraint("memory_id", "message_id"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    memory_id: Mapped[str] = mapped_column(ForeignKey("memories.id"), index=True)
    message_id: Mapped[str] = mapped_column(ForeignKey("messages.id"))
    # Snapshot preserves evidence even when a later export changes the message.
    text: Mapped[str] = mapped_column(Text)


class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String)
    markdown: Mapped[str] = mapped_column(Text)
    memory_ids: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
