
from sqlmodel import SQLModel, Field, JSON, Column
from typing import Optional, Dict, Any
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    user_type_id: uuid.UUID = Field(foreign_key="usertype.id")
    extra_fields: Optional[Dict[str, Any]] = Field(default={}, sa_column=Column(JSON))
