import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List

from sqlmodel import Field, Relationship, SQLModel, Column, JSON
from sqlalchemy import Column as SAColumn, DateTime


class Order(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    # Amounts
    subtotal_amount: float = Field(default=0.0)
    discount_amount: float = Field(default=0.0)
    shipping_amount: float = Field(default=0.0)
    total_amount: float
    currency: str = Field(default="MYR")
    # Payment
    payment_status: str = Field(default="pending")
    payment_method: str | None = None
    payment_intent_id: str | None = None
    # Addresses & remark
    shipping_address: dict | None = Field(default=None, sa_column=Column(JSON))
    billing_address: dict | None = Field(default=None, sa_column=Column(JSON))
    remark: str | None = None
    created_at: datetime = Field(sa_column=SAColumn(DateTime(timezone=True), nullable=False), default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=SAColumn(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )

    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    order_id: uuid.UUID = Field(foreign_key="order.id")
    product_id: uuid.UUID = Field(foreign_key="product.id")
    quantity: int
    unit_price: float
    # Snapshots and line totals
    snapshot_name: str | None = None
    snapshot_price: float | None = None
    snapshot_media_url: str | None = None
    line_subtotal: float = Field(default=0.0)
    discount_amount: float = Field(default=0.0)
    line_total: float = Field(default=0.0)
    created_at: datetime = Field(sa_column=SAColumn(DateTime(timezone=True), nullable=False), default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=SAColumn(DateTime(timezone=True), nullable=False, onupdate=lambda: datetime.now(timezone.utc)),
    )

    order: "Order" = Relationship(back_populates="items")
    product: "Product" = Relationship()
