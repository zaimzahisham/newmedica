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

    @computed_field
    @property
    def total_price(self) -> float:
        return sum(item.price * item.quantity for item in self.items)

    model_config = ConfigDict(from_attributes=True)
