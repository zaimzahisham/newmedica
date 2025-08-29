from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlmodel import Field, SQLModel

class VoucherBase(SQLModel):
    code: str
    discount_type: str
    amount: float
    min_quantity: int
    per_unit: bool

class VoucherCreate(VoucherBase):
    scope: str
    target_user_type_id: Optional[UUID] = None
    target_user_id: Optional[UUID] = None
    is_active: bool = True
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None

class VoucherUpdate(VoucherBase):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    amount: Optional[float] = None
    min_quantity: Optional[int] = None
    per_unit: Optional[bool] = None
    scope: Optional[str] = None
    target_user_type_id: Optional[UUID] = None
    target_user_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None

class VoucherRead(VoucherBase):
    id: UUID
    scope: str
    target_user_type_id: Optional[UUID] = None
    target_user_id: Optional[UUID] = None
    is_active: bool
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class VoucherResponse(VoucherBase):
    id: UUID
