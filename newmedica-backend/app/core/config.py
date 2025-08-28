from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Newmedica API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Stripe Settings
    stripe_publishable_key: str = Field(
        ..., alias="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    stripe_secret_key: str
    stripe_webhook_secret: str

    # model_config is a dictionary for pydantic v2 BaseSettings
    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()