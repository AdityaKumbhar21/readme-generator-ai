from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator, Field
import os

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    API_PREFIX: str = "/api"
    DEBUG: bool = False

    DATABASE_URL: str = None

    ALLOWED_ORIGINS: str = ""

    GITHUB_TOKEN: str
    WEBHOOK_SECRET: str

    SECRET_KEY: str = Field(..., description="Secret key for JWT token signing. MUST be a strong, random string.")
    ALGORITHM: str = "HS256"  # Default algorithm for JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Default token expiration time in minutes

    GEMINI_API_KEY: str

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()