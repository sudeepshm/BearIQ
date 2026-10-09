import os
import subprocess
import sys
from sqlalchemy import create_engine, inspect


def test_database_initializer_creates_schema(tmp_path):
    database = tmp_path / "initialized.db"
    env = {**os.environ, "DATABASE_URL": f"sqlite:///{database}"}
    subprocess.run([sys.executable, "-m", "app.db.database"], env=env, check=True)
    engine = create_engine(env["DATABASE_URL"])
    assert {"users", "conversations", "messages", "memories", "memory_evidence", "skills"} <= set(
        inspect(engine).get_table_names()
    )
    engine.dispose()
