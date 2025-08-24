import uuid
from typing import List

from pydantic import BaseModel, ConfigDict, Field

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
    productId: uuid.UUID = Field(alias="product_id")
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)


class CartRead(BaseModel):
    id: uuid.UUID
    userId: uuid.UUID = Field(alias="user_id")
    items: List[CartItemRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
