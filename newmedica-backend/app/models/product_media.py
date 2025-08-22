from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .product import Product

class ProductMedia(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    product_id: uuid.UUID = Field(foreign_key="product.id")
    
    media_type: str # 'image' or 'video'
    url: str
    display_order: int = Field(default=0)

    product: "Product" = Relationship(back_populates="media")
