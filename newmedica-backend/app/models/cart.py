import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, DateTime

if TYPE_CHECKING:
    from .user import User
    from .product import Product

class Cart(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", unique=True, index=True)
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False), default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )

    user: "User" = Relationship()
    items: List["CartItem"] = Relationship(back_populates="cart", sa_relationship_kwargs={"lazy": "joined"})

class CartItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    cart_id: uuid.UUID = Field(foreign_key="cart.id")
    product_id: uuid.UUID = Field(foreign_key="product.id")
    quantity: int
    created_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False), default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )

    cart: "Cart" = Relationship(back_populates="items")
    product: "Product" = Relationship(sa_relationship_kwargs={"lazy": "joined"})

    @property
    def price(self) -> float:
        return self.product.price