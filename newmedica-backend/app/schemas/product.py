import uuid
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.schemas.category import CategoryRead
from app.schemas.media import ProductMediaRead


# Base Product Schema
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int

class ProductCreate(ProductBase):
    category_id: uuid.UUID





class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[uuid.UUID] = None


class ProductRead(ProductBase):
    id: uuid.UUID
    category: CategoryRead
    media: List[ProductMediaRead] = []

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel)
    category: CategoryRead = Field(..., alias="category")
    media: List[ProductMediaRead] = Field(default_factory=list, alias="media")
