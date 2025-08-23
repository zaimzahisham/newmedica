import uuid

from pydantic import BaseModel


# Base Media Schema
class ProductMediaBase(BaseModel):
    media_type: str
    url: str
    display_order: int


class ProductMediaCreate(ProductMediaBase):
    pass


class ProductMediaRead(ProductMediaBase):
    id: uuid.UUID

    class Config:
        orm_mode = True
