import uuid
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from .utils import to_camel


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    userType: str  # This will be the name like 'Basic', 'Agent', etc.
    extra_fields: Optional[Dict[str, Any]] = {}


class UserRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )

    id: uuid.UUID
    email: EmailStr


class UserReadWithDetails(UserRead):
    user_type: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    ic_no: Optional[str] = None
    hp_no: Optional[str] = None
    hospital_name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    co_reg_no: Optional[str] = None
    co_email_address: Optional[str] = None
    tin_no: Optional[str] = None
    pic_einvoice: Optional[str] = None
    pic_einvoice_email: Optional[str] = None
    pic_einvoice_tel_no: Optional[str] = None
