from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .product import Product

class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(unique=True, index=True)
    description: str | None = None

    products: List["Product"] = Relationship(back_populates="category")
