from fastapi import APIRouter, Depends, HTTPException, Query as QueryParam
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import current_user
from app.core.config import get_settings
from app.db.database import get_db
from app.db.repositories.conversation import ensure_user
from app.db.repositories.memory import owned, serialize
from app.models.memory import Memory, MemoryEvidence, Skill, now
from app.models.message import Message
from app.models.conversation import Conversation
from app.schemas.memory import MemoryInput, Review
from app.schemas.query import Query
from app.integrations.gemini import get_provider
from app.services.memory_query import query_memories
from app.services.pipeline import lock_user
from app.services.deduplicator import store_candidate
from app.services.classifier import Classifier

router = APIRouter()


def invalidate_skills(db, user_id, memory_id):
    for skill in db.scalars(select(Skill).where(Skill.user_id == user_id)):
        if memory_id in skill.memory_ids:
            db.delete(skill)


@router.get("/memories")
def list_memories(
    status: str = QueryParam("active", pattern="^(active|pending|superseded|rejected|deleted)$"),
    limit: int = QueryParam(50, ge=1, le=100),
    offset: int = QueryParam(0, ge=0),
    user_id: str = Depends(current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(Memory)
        .where(Memory.user_id == user_id, Memory.status == status)
        .order_by(Memory.created_at.desc(), Memory.id)
        .limit(limit)
        .offset(offset)
    )
    return {"memories": [serialize(m) for m in rows]}


@router.post("/memories/query")
def query(
    request: Query, user_id: str = Depends(current_user), db: Session = Depends(get_db), provider=Depends(get_provider)
):
    return {"memories": query_memories(db, user_id, request, provider)}


@router.post("/memories", status_code=201)
def create(
    request: MemoryInput,
    user_id: str = Depends(current_user),
    db: Session = Depends(get_db),
    provider=Depends(get_provider),
):
    if request.temporality not in ("permanent", "long_term", "ongoing"):
        raise HTTPException(422, "Only durable memories can be stored")
    lock_user(db, user_id)
    ensure_user(db, user_id)
    request.source_type, request.confidence = "explicit", 1.0
    embedding = provider.embed(request.content)
    request.type = Classifier(provider).classify(request.content, embedding)
    outcome, memory = store_candidate(db, user_id, request, embedding, [], get_settings(), provider)
    if outcome == "rejected":
        raise HTTPException(409, "Previously rejected or deleted memory; use review to restore it")
    memory.last_confirmed = now()
    return serialize(memory)


@router.get("/memories/{memory_id}")
def detail(memory_id: str, user_id: str = Depends(current_user), db: Session = Depends(get_db)):
    memory = owned(db, user_id, memory_id)
    rows = db.execute(
        select(MemoryEvidence, Message, Conversation)
        .join(Message, Message.id == MemoryEvidence.message_id)
        .join(Conversation, Conversation.id == Message.conversation_id)
        .where(MemoryEvidence.memory_id == memory.id, Conversation.user_id == user_id)
    ).all()
    return {
        **serialize(memory),
        "evidence": [
            {
                "message_id": msg.id,
                "source_message_id": msg.source_id,
                "conversation_id": conv.id,
                "source_conversation_id": conv.source_id,
                "platform": conv.platform,
                "text": evidence.text,
                "timestamp": msg.timestamp,
            }
            for evidence, msg, conv in rows
        ],
    }


@router.patch("/memories/{memory_id}")
def review(memory_id: str, request: Review, user_id: str = Depends(current_user), db: Session = Depends(get_db)):
    lock_user(db, user_id)
    memory = owned(db, user_id, memory_id)
    if request.action == "reject":
        memory.status = "rejected"
    elif request.action == "edit":
        if not request.content or not request.content.strip():
            raise HTTPException(422, "content is required for edit")
        provider = get_provider()
        # Edits create a new version, retaining the original memory and its evidence.
        embedding = provider.embed(request.content)
        replacement = Memory(
            user_id=user_id,
            content=request.content,
            type=Classifier(provider).classify(request.content, embedding),
            importance=memory.importance,
            confidence=1.0,
            temporality=memory.temporality,
            source_type="explicit",
            sensitivity=memory.sensitivity,
            status="active",
            embedding=embedding,
            last_seen=now(),
            last_confirmed=now(),
            supersedes_id=memory.id,
        )
        memory.status = "superseded"
        invalidate_skills(db, user_id, memory.id)
        db.add(replacement)
        db.flush()
        return serialize(replacement)
    else:
        if memory.status == "superseded":
            raise HTTPException(409, "Edit a superseded memory to create a new version")
        if memory.conflict_id and memory.status != "active":
            previous = owned(db, user_id, memory.conflict_id)
            if previous.status != "active":
                raise HTTPException(
                    409, "Conflicting memory changed; edit this memory after reviewing the current version"
                )
            previous.status = "superseded"
            memory.supersedes_id = previous.id
            invalidate_skills(db, user_id, previous.id)
        memory.status, memory.confidence, memory.last_confirmed = "active", 1.0, now()
    invalidate_skills(db, user_id, memory.id)
    db.flush()
    return serialize(memory)


@router.delete("/memories/{memory_id}", status_code=204)
def delete(memory_id: str, user_id: str = Depends(current_user), db: Session = Depends(get_db)):
    lock_user(db, user_id)
    owned(db, user_id, memory_id).status = "deleted"
    invalidate_skills(db, user_id, memory_id)
