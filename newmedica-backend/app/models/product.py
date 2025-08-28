import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from sqlmodel import Field, Relationship, SQLModel
from .voucher import VoucherProductLink
from sqlalchemy import Column, DateTime

if TYPE_CHECKING:
    from .category import Category
    from .product_media import ProductMedia
    from .voucher import Voucher


class Product(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str = Field(index=True)
    description: str
    price: float
    stock: int
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False), default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )

    category_id: uuid.UUID = Field(foreign_key="category.id")
    category: "Category" = Relationship(back_populates="products")

    media: List["ProductMedia"] = Relationship(
        back_populates="product",
        sa_relationship_kwargs={"order_by": "ProductMedia.display_order"},
    )
    vouchers: List["Voucher"] = Relationship(link_model=VoucherProductLink)