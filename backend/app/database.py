import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _database_url() -> str:
    settings = get_settings()
    os.makedirs(settings.database_dir, exist_ok=True)
    db_path = os.path.join(settings.database_dir, "blueyonderboys.db")
    return f"sqlite:///{db_path}"


engine = create_engine(
    _database_url(),
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
