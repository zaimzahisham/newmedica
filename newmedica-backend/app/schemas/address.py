from pydantic import BaseModel, ConfigDict
import uuid
from typing import Optional

class AddressBase(BaseModel):
    first_name: str
    last_name: str
    phone: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    postcode: str
    country: str
    is_primary: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address1: Optional[str] = None
    address2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    is_primary: Optional[bool] = None

class AddressRead(AddressBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)