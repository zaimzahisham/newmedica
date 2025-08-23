from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .product import Product

class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(unique=True, index=True)
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, sa_column_kwargs={"onupdate": datetime.utcnow})

    products: List["Product"] = Relationship(back_populates="category")
