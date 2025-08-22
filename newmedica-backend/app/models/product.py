from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .category import Category
    from .product_media import ProductMedia

class Product(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(index=True)
    description: str
    price: float
    stock: int

    category_id: uuid.UUID = Field(foreign_key="category.id")
    category: "Category" = Relationship(back_populates="products")

    media: List["ProductMedia"] = Relationship(
        back_populates="product", 
        sa_relationship_kwargs={"order_by": "ProductMedia.display_order"}
    )
