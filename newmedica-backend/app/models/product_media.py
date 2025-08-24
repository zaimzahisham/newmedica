import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .product import Product


class ProductMedia(SQLModel, table=True):
    __tablename__ = "productmedia"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    product_id: uuid.UUID = Field(foreign_key="product.id")

    url: str
    alt_text: str
    display_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    product: "Product" = Relationship(back_populates="media")
