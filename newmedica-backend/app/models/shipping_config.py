from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class ShippingConfig(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    base_fee_first_item: float = Field(default=6.0)
    additional_fee_per_item: float = Field(default=2.0)
    is_active: bool = Field(default=True)
    rules: str | None = Field(default=None, description="Reserved for future JSON rules")
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )


