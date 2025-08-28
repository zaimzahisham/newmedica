import uuid
from typing import List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class OrderItemRead(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: float
    snapshot_name: str | None
    snapshot_price: float | None
    snapshot_media_url: str | None
    line_subtotal: float
    discount_amount: float
    line_total: float

    model_config = ConfigDict(from_attributes=True)

class OrderRead(BaseModel):
    id: uuid.UUID
    payment_status: str
    created_at: datetime
    # Amounts
    subtotal_amount: float
    discount_amount: float
    shipping_amount: float
    total_amount: float
    currency: str
    # Details
    shipping_address: dict | None
    billing_address: dict | None
    remark: str | None
    items: List[OrderItemRead]

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    contact_email: str | None = None
    payment_method: str | None = None
    remark: str | None = None
    shipping_address: dict | None = None
    billing_address: dict | None = None
    clear_cart: bool | None = None
