
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/newmedica"
    # Add other settings here as needed

    class Config:
        env_file = ".env"

settings = Settings()
