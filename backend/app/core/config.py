from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "SOP Hub Backend"
    API_V1_STR: str = "/api/v1"

    # Put SECRET_KEY in .env in real deployments
    SECRET_KEY: str = "changethis_secret_key_for_jwt_tokens"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # CORS: allow comma-separated string in env
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]):
        if v is None:
            return []
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            if s.startswith("["):
                # Let pydantic parse JSON-like lists
                return v
            return [i.strip() for i in s.split(",") if i.strip()]
        return v

    # Default local DB (Phase later: switch to Supabase Postgres via .env)
    DATABASE_URL: str = "sqlite+aiosqlite:///./sophub.db"


settings = Settings()
