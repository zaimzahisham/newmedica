from pydantic import BaseModel
from app.models.voucher import VoucherScope, DiscountType

class VoucherCreate(BaseModel):
    code: str
    scope: VoucherScope
    discount_type: DiscountType
    amount: float
    is_active: bool = True

class VoucherUpdate(BaseModel):
    code: str | None = None
    scope: VoucherScope | None = None
    discount_type: DiscountType | None = None
    amount: float | None = None
    is_active: bool | None = None
