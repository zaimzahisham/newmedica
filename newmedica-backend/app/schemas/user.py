import uuid
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, model_validator

from .utils import to_camel


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    userType: str  # This will be the name like 'Basic', 'Agent', etc.
    extra_fields: Optional[Dict[str, Any]] = {}

    @model_validator(mode='before')
    @classmethod
    def validate_extra_fields(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data # Let Pydantic handle the error

        user_type = data.get('userType')
        extra_fields = data.get('extra_fields', {})

        if user_type == 'Agent':
            if not extra_fields.get('companyName'):
                raise ValueError('companyName is required for Agent users')

        elif user_type == 'Healthcare':
            if not extra_fields.get('department'):
                raise ValueError('department is required for Healthcare users')

        return data


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

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    gender: Optional[str] = None
    dateOfBirth: Optional[str] = None
    hpNo: Optional[str] = None
    icNo: Optional[str] = None
    hospitalName: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    companyName: Optional[str] = None
    companyAddress: Optional[str] = None
    coRegNo: Optional[str] = None
    coEmailAddress: Optional[str] = None # Allow empty string
    tinNo: Optional[str] = None
    picEinvoice: Optional[str] = None
    picEinvoiceEmail: Optional[str] = None # Allow empty string
    picEinvoiceTelNo: Optional[str] = None