import uuid
import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User
    from .product import Product


class UserVoucher(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    voucher_id: uuid.UUID = Field(foreign_key="voucher.id", primary_key=True)
    is_used: bool = Field(default=False)
    used_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            onupdate=lambda: datetime.now(timezone.utc),
        ),
    )

class VoucherProductLink(SQLModel, table=True):
    voucher_id: uuid.UUID = Field(foreign_key="voucher.id", primary_key=True)
    product_id: uuid.UUID = Field(foreign_key="product.id", primary_key=True)

class VoucherScope(str, enum.Enum):
    GLOBAL = "global"
    USER_TYPE = "user_type"
    USER = "user"
    PRODUCT_LIST = "product_list"

class DiscountType(str, enum.Enum):
    FIXED = "fixed"
    PERCENT = "percent"

class Voucher(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    code: str = Field(
        sa_column=Column(String, unique=True, index=True, nullable=False)
    )

    # discount
    discount_type: DiscountType = Field(default=DiscountType.FIXED, description="fixed|percent")
    amount: float

    # scope: global|user_type|user|product_list
    scope: VoucherScope = Field(default=VoucherScope.PRODUCT_LIST)
    target_user_type_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="usertype.id"
    )
    target_user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")

    # rules
    min_quantity: int = Field(
        default=0, description="Minimum quantity of matched products to activate"
    )
    per_unit: bool = Field(
        default=False, description="Apply amount per matched unit instead of per order"
    )

    is_active: bool = Field(default=True)
    valid_from: Optional[datetime] = Field(default=None)
    valid_to: Optional[datetime] = Field(default=None)

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            onupdate=lambda: datetime.now(timezone.utc),
        ),
    )

    users: List["User"] = Relationship(back_populates="vouchers", link_model=UserVoucher)
    products: List["Product"] = Relationship(link_model=VoucherProductLink)