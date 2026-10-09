from app.models.memory import now
from app.db.repositories.memory import nearest, serialize
from app.services.deduplicator import as_utc


def query_memories(db, user_id, request, provider):
    embedding = provider.embed(request.query, query=True)
    ranked = []
    for similarity, memory in nearest(
        db, user_id, embedding, limit=request.limit * 4, include_sensitive=request.include_sensitive
    ):
        if similarity < 0.25:
            continue
        days = max(0, (now() - as_utc(memory.last_seen)).total_seconds() / 86400)
        score = 0.7 * similarity + 0.2 * memory.confidence + 0.1 / (1 + days / 90)
        ranked.append({**serialize(memory), "score": score})
    return sorted(ranked, key=lambda m: m["score"], reverse=True)[: request.limit]
