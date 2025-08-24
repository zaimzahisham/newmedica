import uuid
from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: uuid.UUID
