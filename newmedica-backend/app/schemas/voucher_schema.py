
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# This schema will represent the data for a voucher when read by a user.
class UserVoucherRead(BaseModel):
    id: UUID
    code: str
    description: Optional[str] = None
    discount_type: str
    amount: float # Corrected field name to match the model
    scope: str
    min_quantity: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
