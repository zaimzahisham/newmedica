import uuid

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CategoryBase(BaseModel):
    name: str
    description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel)
