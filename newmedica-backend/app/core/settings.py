from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str

    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Stripe Settings
    stripe_publishable_key: str = Field(
        ..., alias="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    stripe_secret_key: str
    stripe_webhook_secret: str

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()  # type: ignore