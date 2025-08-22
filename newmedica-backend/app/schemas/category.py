from pydantic import BaseModel
import uuid

class CategoryBase(BaseModel):
    name: str
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: uuid.UUID

    class Config:
        orm_mode = True
