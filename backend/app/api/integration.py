from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import current_user
from app.db.database import get_db
from app.db.repositories.conversation import ensure_user
from app.integrations.gemini import get_provider
from app.schemas.query import Query, SkillRequest
from app.services.memory_query import query_memories
from app.services.context_builder import build_context
from app.services.skill_generator import generate
from app.services.pipeline import lock_user
from app.models.memory import Skill

router = APIRouter()


@router.post("/context")
def context(
    request: Query, user_id: str = Depends(current_user), db: Session = Depends(get_db), provider=Depends(get_provider)
):
    return build_context(query_memories(db, user_id, request, provider))


@router.post("/skills/generate", status_code=201)
def skill(
    request: SkillRequest,
    user_id: str = Depends(current_user),
    db: Session = Depends(get_db),
    provider=Depends(get_provider),
):
    lock_user(db, user_id)
    ensure_user(db, user_id)
    memories = query_memories(db, user_id, request, provider)
    result = generate(db, user_id, request.title, memories)
    return {"id": result.id, "markdown": result.markdown, "memory_ids": result.memory_ids}


@router.get("/skills")
def skills(
    limit: int = QueryParam(50, ge=1, le=100),
    offset: int = QueryParam(0, ge=0),
    user_id: str = Depends(current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(Skill)
        .where(Skill.user_id == user_id)
        .order_by(Skill.created_at.desc(), Skill.id)
        .limit(limit)
        .offset(offset)
    )
    return {
        "skills": [{"id": s.id, "title": s.title, "markdown": s.markdown, "memory_ids": s.memory_ids} for s in rows]
    }
