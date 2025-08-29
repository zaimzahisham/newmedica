from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from uuid import UUID
from typing import List

from app.core.security import get_current_admin_user
from app.db.session import get_session
from app.models import ShippingConfig, User, Voucher
from app.schemas.shipping_config import ShippingConfigRead, ShippingConfigUpdate
from app.schemas.admin_voucher import VoucherCreate, VoucherUpdate
from app.services.admin_service import AdminVoucherService

router = APIRouter()


@router.get("/test-security", response_model=dict)
async def test_security(current_user: User = Depends(get_current_admin_user)):
    """
    A dummy endpoint to test admin security.
    """
    return {"message": "Admin access granted"}


@router.get("/shipping-config", response_model=ShippingConfigRead)
async def get_shipping_config(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
):
    result = await session.execute(select(ShippingConfig).where(ShippingConfig.is_active == True))
    cfg = result.scalar_one_or_none()
    if not cfg:
        cfg = ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True)
        session.add(cfg)
        await session.commit()
        await session.refresh(cfg)
    return cfg


@router.put("/shipping-config", response_model=ShippingConfigRead)
async def update_shipping_config(
    payload: ShippingConfigUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
):
    result = await session.execute(select(ShippingConfig).where(ShippingConfig.is_active == True))
    cfg = result.scalar_one_or_none()
    if not cfg:
        cfg = ShippingConfig(is_active=True)
        session.add(cfg)

    cfg.base_fee_first_item = payload.base_fee_first_item
    cfg.additional_fee_per_item = payload.additional_fee_per_item
    cfg.is_active = payload.is_active
    session.add(cfg)
    await session.commit()
    await session.refresh(cfg)
    return cfg

# --- Voucher Management ---

@router.post("/vouchers", response_model=Voucher, status_code=status.HTTP_201_CREATED)
async def create_voucher(
    voucher_data: VoucherCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
):
    service = AdminVoucherService(session)
    return await service.create_voucher(voucher_data)

@router.get("/vouchers", response_model=List[Voucher])
async def get_all_vouchers(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
):
    service = AdminVoucherService(session)
    return await service.get_all_vouchers()

@router.put("/vouchers/{voucher_id}", response_model=Voucher)
async def update_voucher(
    voucher_id: UUID,
    voucher_data: VoucherUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
):
    service = AdminVoucherService(session)
    updated_voucher = await service.update_voucher(voucher_id, voucher_data)
    if not updated_voucher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voucher not found")
    return updated_voucher

@router.delete("/vouchers/{voucher_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voucher(
    voucher_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
):
    service = AdminVoucherService(session)
    success = await service.delete_voucher(voucher_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voucher not found")
    return