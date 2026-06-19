from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/turkana_music")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "turkana-music-hub-secret-key-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ADMIN_URL: str = os.getenv("ADMIN_URL", "http://localhost:5174")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    UPLOAD_DIR: str = "uploads"
    MAX_AUDIO_SIZE: int = 50 * 1024 * 1024
    MAX_IMAGE_SIZE: int = 5 * 1024 * 1024
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()