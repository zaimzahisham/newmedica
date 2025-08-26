import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, DateTime

if TYPE_CHECKING:
    from .user import User

class Address(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    
    first_name: str
    last_name: str
    phone: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    postcode: str
    country: str
    is_primary: bool = Field(default=False)

    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False), default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )

    user: "User" = Relationship(back_populates="addresses")
