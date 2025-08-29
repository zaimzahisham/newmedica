import uuid
from typing import List

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.schemas.product import ProductRead


class CartItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemRead(CartItemBase):
    id: uuid.UUID
    product: ProductRead
    price: float

    model_config = ConfigDict(from_attributes=True)


class CartRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    items: List[CartItemRead] = []
    subtotal: float = 0.0
    discount: float = 0.0
    shipping: float = 0.0
    total: float = 0.0

    model_config = ConfigDict(from_attributes=True)
