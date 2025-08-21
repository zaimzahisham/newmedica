
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Dict, Any, Optional
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    userType: str # This will be the name like 'Basic', 'Agent', etc.
    extra_fields: Optional[Dict[str, Any]] = {}

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
