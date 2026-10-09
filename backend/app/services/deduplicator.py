from sqlalchemy import select
from app.models.memory import Memory, MemoryEvidence, now
from app.db.repositories.memory import nearest
from app.schemas.memory import Relation
from app.services.confidence import initial, supported

RELATION_PROMPT = """Compare two user memories. Return same only when they express the same fact.
Return contradiction only when they cannot both hold in the same context. Liking two languages
is not automatically contradictory. Negation, changed preferences and exclusive replacements
may contradict. Otherwise return different. Never treat vector similarity alone as equivalence."""


def store_candidate(db, user_id, candidate, embedding, evidence, settings, provider):
    matches = nearest(
        db, user_id, embedding, ("active", "pending", "deleted", "rejected", "superseded"), include_sensitive=True
    )
    conflict = None
    for similarity, existing in matches:
        if similarity < settings.similarity_threshold:
            continue
        exact = existing.content.casefold().strip() == candidate.content.casefold().strip()
        relation = (
            "same"
            if exact
            else provider.structured(
                RELATION_PROMPT, {"existing": existing.content, "candidate": candidate.content}, Relation
            ).relation
        )
        if relation == "same":
            if existing.status in ("deleted", "rejected", "superseded"):
                return "rejected", existing
            count = add_evidence(db, existing, evidence)
            existing.confidence = supported(existing.confidence, count)
            existing.evidence_count += count
            seen = [e.timestamp for e in evidence if e.timestamp]
            if seen:
                existing.last_seen = max([as_utc(existing.last_seen)] + [as_utc(t) for t in seen])
            return "merged", existing
        if relation == "contradiction" and existing.status == "active":
            conflict = existing
    # Contradictions/inferred/sensitive candidates require review rather than an LLM overwriting history.
    status = (
        "pending"
        if conflict or candidate.source_type == "inferred" or candidate.sensitivity == "sensitive"
        else "active"
    )
    memory = Memory(
        user_id=user_id,
        **candidate.model_dump(exclude={"message_ids"}),
        embedding=embedding,
        status=status,
        conflict_id=conflict.id if conflict else None,
    )
    memory.confidence = initial(candidate)
    memory.last_seen = max((as_utc(e.timestamp) for e in evidence if e.timestamp), default=now())
    db.add(memory)
    db.flush()
    memory.evidence_count = add_evidence(db, memory, evidence)
    db.flush()
    return ("pending" if status == "pending" else "created"), memory


def as_utc(value):
    from datetime import timezone

    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def add_evidence(db, memory, messages):
    existing = set(db.scalars(select(MemoryEvidence.message_id).where(MemoryEvidence.memory_id == memory.id)))
    count = 0
    for msg in messages:
        if msg.id not in existing:
            db.add(MemoryEvidence(memory_id=memory.id, message_id=msg.id, text=msg.content))
            existing.add(msg.id)
            count += 1
    db.flush()
    return count
