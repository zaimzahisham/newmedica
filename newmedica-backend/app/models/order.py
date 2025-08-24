import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlmodel import Field, Relationship, SQLModel


class Order(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    total_amount: float
    payment_status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    order_id: uuid.UUID = Field(foreign_key="order.id")
    product_id: uuid.UUID = Field(foreign_key="product.id")
    quantity: int
    unit_price: float

    order: "Order" = Relationship(back_populates="items")
    product: "Product" = Relationship()
