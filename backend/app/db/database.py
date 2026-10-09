from functools import lru_cache
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache
def engine():
    return create_engine(get_settings().database_url, pool_pre_ping=True)


def get_db():
    with sessionmaker(bind=engine(), expire_on_commit=False)() as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise


def initialize():
    import app.models.memory  # noqa: F401
    import app.models.conversation  # noqa: F401
    import app.models.message  # noqa: F401

    with engine().begin() as conn:
        if conn.dialect.name == "postgresql":
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.create_all(conn)


if __name__ == "__main__":
    # Resolve the canonical module so models and initializer share one metadata registry.
    from app.db.database import initialize as initialize_schema

    initialize_schema()
