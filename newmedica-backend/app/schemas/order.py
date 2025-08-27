import uuid
from typing import List
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductRead

class OrderItemRead(BaseModel):
    id: uuid.UUID
    product: ProductRead
    quantity: int
    unit_price: float

    model_config = ConfigDict(from_attributes=True)

class OrderRead(BaseModel):
    id: uuid.UUID
    total_amount: float
    payment_status: str
    items: List[OrderItemRead]

    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    contact_email: str | None = None
    payment_method: str | None = None
    remark: str | None = None
    shipping_address: dict | None = None
    billing_address: dict | None = None
    clear_cart: bool | None = None
