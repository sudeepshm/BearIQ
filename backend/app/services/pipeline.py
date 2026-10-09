from sqlalchemy import text
from app.db.repositories.conversation import ensure_user, store as store_conversation
from app.db.repositories.message import store as store_messages
from app.models.message import Message
from app.services.parser.chatgpt import parse_export
from app.services.chunker import chunks
from app.services.classifier import Classifier
from app.services.extractor import extract
from app.services.deduplicator import store_candidate
from app.services.confidence import initial
from app.services.validator import InvalidArchive


def lock_user(db, user_id):
    if db.bind.dialect.name == "postgresql":
        import hashlib

        key = int.from_bytes(hashlib.sha256(user_id.encode()).digest()[:8], "big", signed=True)
        db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": key})


def ingest(payload, user_id, db, provider, settings):
    conversations = parse_export(payload, user_id)
    work = [(c, chunk) for c in conversations for chunk in chunks(c["messages"], settings)]
    if len(work) > settings.max_chunks:
        raise InvalidArchive("Export exceeds processing budget; split the export into smaller imports")
    lock_user(db, user_id)
    ensure_user(db, user_id)
    stats = dict(conversations=len(conversations), messages=0, candidates=0, created=0, merged=0, rejected=0, pending=0)
    for c in conversations:
        store_conversation(db, c)
        store_messages(db, c["messages"])
        stats["messages"] += len(c["messages"])
    classifier = Classifier(provider)
    for conversation, chunk in work:
        valid = {m["id"]: m for m in chunk if m["role"] == "user"}
        for candidate in extract(chunk, provider):
            stats["candidates"] += 1
            if (
                candidate.temporality not in ("permanent", "long_term", "ongoing")
                or initial(candidate) < settings.minimum_confidence
                or candidate.importance < 0.3
                or not all(mid in valid for mid in candidate.message_ids)
            ):
                stats["rejected"] += 1
                continue
            embedding = provider.embed(candidate.content)
            candidate.type = classifier.classify(candidate.content, embedding)
            evidence = [db.get(Message, mid) for mid in set(candidate.message_ids)]
            outcome, _ = store_candidate(db, user_id, candidate, embedding, evidence, settings, provider)
            stats[outcome] += 1
    return stats
