from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.db.session import get_session
from app.models import User, VoucherProductLink
from app.schemas.voucher import VoucherResponse
from app.services.pricing_service import PricingService
from app.core.security import get_current_user

router = APIRouter()

@router.get("/products/{product_id}/vouchers", response_model=List[VoucherResponse])
async def get_product_vouchers(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    pricing_service = PricingService(session)
    all_applicable_vouchers = await pricing_service._get_applicable_vouchers(current_user)

    product_vouchers: List[VoucherResponse] = []

    for voucher in all_applicable_vouchers:
        is_applicable_to_product = False
        if voucher.scope == "global":
            is_applicable_to_product = True
        elif voucher.scope == "user_type" and voucher.target_user_type_id == current_user.user_type_id:
            is_applicable_to_product = True
        elif voucher.scope == "product_list":
            # Check if the voucher is linked to this specific product
            link_exists = await session.execute(
                select(VoucherProductLink).where(
                    VoucherProductLink.voucher_id == voucher.id,
                    VoucherProductLink.product_id == product_id
                )
            )
            if link_exists.scalar_one_or_none():
                is_applicable_to_product = True
        
        if is_applicable_to_product:
            product_vouchers.append(VoucherResponse(
                id=voucher.id,
                code=voucher.code,
                discount_type=voucher.discount_type,
                amount=voucher.amount,
                min_quantity=voucher.min_quantity,
                per_unit=voucher.per_unit
            ))
    
    return product_vouchers
