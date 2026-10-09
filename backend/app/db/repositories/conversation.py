from app.models.conversation import Conversation, User


def ensure_user(db, user_id):
    if db.get(User, user_id) is None:
        db.add(User(id=user_id))
        db.flush()


def store(db, conversation):
    fields = {k: v for k, v in conversation.items() if k != "messages"}
    db.merge(Conversation(**fields))
    db.flush()
