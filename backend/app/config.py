import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    admin_username: str = "admin"
    admin_password: str = ""
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    database_dir: str = os.environ.get("DATABASE_DIR", "/app/database")

    @property
    def uploads_dir(self) -> str:
        return os.path.join(self.database_dir, "uploads")


@lru_cache
def get_settings() -> Settings:
    return Settings()
