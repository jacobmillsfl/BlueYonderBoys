import os
import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_test_dir = tempfile.mkdtemp(prefix="byb_pytest_")
os.environ["DATABASE_DIR"] = _test_dir
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "test-password"
os.environ["JWT_SECRET"] = "test-jwt-secret"

from app.config import get_settings

get_settings.cache_clear()

import app.database as database

_settings = get_settings()
_db_file = Path(_settings.database_dir) / "blueyonderboys.db"
_test_engine = create_engine(
    f"sqlite:///{_db_file}",
    connect_args={"check_same_thread": False},
)
database.engine = _test_engine
database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)

from app.database import Base, SessionLocal
from app.main import app
from app.migrate import migrate_schema
from app.seed import seed_database
from fastapi.testclient import TestClient


def _reset_database() -> None:
    database.engine.dispose()
    if _db_file.exists():
        _db_file.unlink()
    Base.metadata.create_all(bind=_test_engine)
    migrate_schema(_test_engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@pytest.fixture(autouse=True)
def fresh_database():
    _reset_database()
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "test-password"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
