import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

TEST_DB_PATH = ROOT_DIR / "tests" / "test_api.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH.as_posix()}"

import pytest  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _fresh_test_database():
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
    from app.db.init_db import init_db

    init_db()
    yield
    from app.db.session import engine

    engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
