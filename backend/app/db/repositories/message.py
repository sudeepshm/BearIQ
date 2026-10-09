from app.models.message import Message
from app.services.validator import InvalidArchive


def store(db, messages):
    for message in messages:
        # Preserve original evidence; IDs are stable and scoped to conversation/user.
        existing = db.get(Message, message["id"])
        if existing is None:
            db.add(Message(**message))
        elif existing.content != message["content"] or existing.role != message["role"]:
            raise InvalidArchive("A source message ID was reused with changed content; original evidence is preserved")
    db.flush()
