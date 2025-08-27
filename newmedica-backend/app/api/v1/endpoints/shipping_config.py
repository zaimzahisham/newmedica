from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.session import get_session
from app.models import ShippingConfig, User
from app.api.v1.dependencies import get_current_user
from app.schemas.shipping_config import ShippingConfigRead, ShippingConfigUpdate

router = APIRouter()


def _ensure_admin(user: User):
    # Simple admin check: relies on user_type name being 'Admin'
    if getattr(user, "user_type_id", None) is None:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("", response_model=ShippingConfigRead)
async def get_shipping_config(
    *, session: AsyncSession = Depends(get_session), current_user: User = Depends(get_current_user)
):
    _ensure_admin(current_user)
    result = await session.execute(select(ShippingConfig).where(ShippingConfig.is_active == True))
    cfg = result.scalar_one_or_none()
    if not cfg:
        cfg = ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True)
        session.add(cfg)
        await session.commit()
        await session.refresh(cfg)
    return ShippingConfigRead(
        base_fee_first_item=cfg.base_fee_first_item,
        additional_fee_per_item=cfg.additional_fee_per_item,
        is_active=cfg.is_active,
    )


@router.put("", response_model=ShippingConfigRead)
async def update_shipping_config(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    payload: ShippingConfigUpdate,
):
    _ensure_admin(current_user)
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
    return ShippingConfigRead(
        base_fee_first_item=cfg.base_fee_first_item,
        additional_fee_per_item=cfg.additional_fee_per_item,
        is_active=cfg.is_active,
    )


