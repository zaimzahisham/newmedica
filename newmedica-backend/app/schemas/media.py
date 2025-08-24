import uuid

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


# Base Media Schema
class ProductMediaBase(BaseModel):
    alt_text: str = Field(alias="alt_text")
    url: str
    display_order: int = Field(alias="display_order")


class ProductMediaCreate(BaseModel):
    alt_text: str
    url: str
    display_order: int

    model_config = ConfigDict(alias_generator=to_camel)


class ProductMediaRead(ProductMediaBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel)
