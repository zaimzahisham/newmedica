from pydantic import BaseModel, Field


class ShippingConfigRead(BaseModel):
    base_fee_first_item: float
    additional_fee_per_item: float
    is_active: bool


class ShippingConfigUpdate(BaseModel):
    base_fee_first_item: float = Field(..., ge=0)
    additional_fee_per_item: float = Field(..., ge=0)
    is_active: bool = True


