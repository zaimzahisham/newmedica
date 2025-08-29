from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import joinedload

from app.db.session import get_session
from app.models import User, Voucher, VoucherProductLink # Import Voucher
from app.schemas.voucher import VoucherResponse
from app.services.pricing_service import PricingService # Keep if needed elsewhere, but not directly used in this function
from app.core.security import get_current_user

router = APIRouter()

@router.get("/products/{product_id}/vouchers", response_model=List[VoucherResponse])
async def get_product_vouchers(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Fetch all vouchers that are active and generally applicable to the user based on scope
    # Eagerly load product_links for efficient filtering
    query = select(Voucher).options(joinedload(Voucher.products)).where(
        (Voucher.is_active == True) &
        (
            (Voucher.scope == "global") |
            (
                (Voucher.scope == "user_type") &
                (Voucher.target_user_type_id == current_user.user_type_id)
            ) |
            # Include product_list scoped vouchers that are linked to this specific product
            (
                (Voucher.scope == "product_list") &
                (Voucher.products.any(VoucherProductLink.product_id == product_id))
            )
        )
    )
    result = await session.execute(query)
    all_potential_vouchers = result.scalars().unique().all()

    product_vouchers: List[VoucherResponse] = []

    for voucher in all_potential_vouchers:
        # Determine if the voucher is applicable to the current product
        is_applicable_to_current_product = False

        if voucher.products:
            # If the voucher has product links, it must be linked to the current product_id
            for link in voucher.products:
                if link.id == product_id: # Changed link.product_id to link.id as link is a Product object
                    is_applicable_to_current_product = True
                    break
        else:
            # If the voucher has no product links, it applies generally (global/user_type)
            # and was already filtered by scope in the initial query
            is_applicable_to_current_product = True
        
        if is_applicable_to_current_product:
            product_vouchers.append(VoucherResponse(
                id=voucher.id,
                code=voucher.code,
                discount_type=voucher.discount_type,
                amount=voucher.amount,
                min_quantity=voucher.min_quantity,
                per_unit=voucher.per_unit
            ))
    
    return product_vouchers