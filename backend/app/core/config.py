from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union


class Settings(BaseSettings):
    # Project Settings
    PROJECT_NAME: str = "SOP Hub Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "changethis_secret_key_for_jwt_tokens"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///.sophub.db"

    # Google OAuth Settings (COMPLETE)
    GOOGLE_CLIENT_ID: str = "457807005853-8g6hol2rjbqjqaudfh9sd71du61drlt.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = ""  # Set in environment

    # Supabase Settings
    SUPABASE_URL: str = "https://odfnlpmskdkrcanyuipb.supabase.co"
    SUPABASE_ANON_KEY: str = "sb_publishable_WJreEfGWivoxXwV41LKfw_K6HWlEj35"
    SUPABASE_SERVICE_KEY: str = ""  # Set in environment

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    # Email Settings (for SendGrid or similar)
    SENDGRID_API_KEY: str = ""  # Set in environment
    FROM_EMAIL: str = "noreply@sophub.com"

    # JWT Settings
    JWT_ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
