import uuid
from datetime import datetime, timezone
from app.db.database import get_db, initialize
from app.models.conversation import User, Conversation
from app.models.message import Message
from app.models.memory import Memory, MemoryEvidence, Skill

def seed():
    initialize()
    user_id = "usr_sudeep_01"
    now_utc = datetime.now(timezone.utc)
    dummy_embedding = [0.1] * 768

    with next(get_db()) as db:
        if db.get(User, user_id) is None:
            db.add(User(id=user_id))

        # Sample conversation
        conv_id = "conv_seed_101"
        if db.get(Conversation, conv_id) is None:
            db.add(
                Conversation(
                    id=conv_id,
                    user_id=user_id,
                    source_id="chatgpt_export_001",
                    platform="chatgpt",
                    title="Backend Framework Architecture Discussion",
                    created_at=now_utc,
                )
            )

        # Sample message
        msg_id = "msg_seed_201"
        if db.get(Message, msg_id) is None:
            db.add(
                Message(
                    id=msg_id,
                    conversation_id=conv_id,
                    source_id="msg_src_201",
                    role="user",
                    content="For my backend projects, I prefer Python and FastAPI with strict Pydantic schemas over NodeJS.",
                    position=0,
                    timestamp=now_utc,
                )
            )

        # Sample Memory 1
        mem1_id = "mem_01hqz8123"
        if db.get(Memory, mem1_id) is None:
            db.add(
                Memory(
                    id=mem1_id,
                    user_id=user_id,
                    content="User prefers Python with FastAPI and strict Pydantic schemas over NodeJS for backend systems.",
                    type="technical_preference",
                    importance=0.9,
                    confidence=0.98,
                    temporality="permanent",
                    source_type="explicit",
                    sensitivity="personal",
                    status="active",
                    embedding=dummy_embedding,
                    evidence_count=1,
                    last_seen=now_utc,
                    last_confirmed=now_utc,
                    created_at=now_utc,
                )
            )
            db.flush()
            db.add(
                MemoryEvidence(
                    memory_id=mem1_id,
                    message_id=msg_id,
                    text="For my backend projects, I prefer Python and FastAPI with strict Pydantic schemas over NodeJS.",
                )
            )

        # Sample Memory 2
        mem2_id = "mem_02hqz9456"
        if db.get(Memory, mem2_id) is None:
            db.add(
                Memory(
                    id=mem2_id,
                    user_id=user_id,
                    content="User builds Next.js applications using TypeScript, Tailwind CSS, and App Router with modular directory architectures.",
                    type="technical_preference",
                    importance=0.85,
                    confidence=0.95,
                    temporality="permanent",
                    source_type="explicit",
                    sensitivity="personal",
                    status="active",
                    embedding=dummy_embedding,
                    evidence_count=0,
                    last_seen=now_utc,
                    last_confirmed=now_utc,
                    created_at=now_utc,
                )
            )

        # Sample Memory 3
        mem3_id = "mem_03hqza789"
        if db.get(Memory, mem3_id) is None:
            db.add(
                Memory(
                    id=mem3_id,
                    user_id=user_id,
                    content="Working on BearIQ: a portable long-term memory system that lets users carry and sell their personal AI expertise layer.",
                    type="project",
                    importance=0.95,
                    confidence=0.99,
                    temporality="ongoing",
                    source_type="explicit",
                    sensitivity="personal",
                    status="active",
                    embedding=dummy_embedding,
                    evidence_count=0,
                    last_seen=now_utc,
                    last_confirmed=now_utc,
                    created_at=now_utc,
                )
            )

        # Sample Skill
        skill_id = "skill_python_arch"
        if db.get(Skill, skill_id) is None:
            db.add(
                Skill(
                    id=skill_id,
                    user_id=user_id,
                    title="Python Backend Architecture Specialist",
                    markdown="""# Python Backend Architecture Specialist

## Context & Principles
- **Framework**: FastAPI with async route execution and Pydantic v2 schemas.
- **Data Layer**: Clean repository pattern decoupling ORM models from HTTP controllers.
- **Safety**: Strict request validation, bounded body stream reading, and HMAC authentication tokens.

## Coding Style
- Write type-annotated, idiomatic Python 3.12+.
- Avoid excessive framework bloat; use direct SQL queries or minimal SQLAlchemy 2.0 select statements.
- Handle database transactions cleanly with dependency-injected sessions.""",
                    memory_ids=[mem1_id],
                )
            )

        db.commit()
    print("Database successfully seeded for usr_sudeep_01")

if __name__ == "__main__":
    seed()
