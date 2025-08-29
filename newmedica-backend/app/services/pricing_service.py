import uuid
from typing import Dict, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.models import Cart, CartItem, Product, User, UserType, Voucher, VoucherProductLink, ShippingConfig


class PricingService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _get_active_shipping_config(self) -> ShippingConfig:
        result = await self.session.execute(select(ShippingConfig).where(ShippingConfig.is_active == True))
        cfg = result.scalar_one_or_none()
        if not cfg:
            # Legacy/default behavior for tests or when not configured: no shipping fee
            return ShippingConfig(base_fee_first_item=0.0, additional_fee_per_item=0.0, is_active=True)
        return cfg

    async def _get_cart_items(self, user_id: uuid.UUID) -> List[CartItem]:
        result = await self.session.execute(
            select(CartItem)
            .join(Cart, CartItem.cart_id == Cart.id)
            .options(selectinload(CartItem.product))
            .where(Cart.user_id == user_id)
        )
        return list(result.scalars().all())

    async def _get_applicable_vouchers(self, user: User) -> List[Voucher]:
        # Fetch vouchers active for user's user_type
        result = await self.session.execute(
            select(Voucher).where(Voucher.is_active == True)
        )
        vouchers = result.scalars().all()
        applicable = []
        for v in vouchers:
            if v.scope in ("global", "product_list") and (v.target_user_type_id is None or v.target_user_type_id == user.user_type_id):
                applicable.append(v)
            elif v.scope == "user_type" and v.target_user_type_id == user.user_type_id:
                applicable.append(v)
            elif v.scope == "user" and v.target_user_id == user.id:
                applicable.append(v)
        return applicable

    async def compute_totals(self, user_id: uuid.UUID) -> Dict[str, float]:
        # Load user, cart, vouchers, shipping config
        user = await self.session.get(User, user_id)
        if not user:
            return {"subtotal": 0.0, "discount": 0.0, "shipping": 0.0, "total": 0.0, "applied_voucher_code": None}

        items = await self._get_cart_items(user_id)
        if not items:
            return {"subtotal": 0.0, "discount": 0.0, "shipping": 0.0, "total": 0.0, "applied_voucher_code": None}

        subtotal = 0.0
        product_qty: Dict[uuid.UUID, int] = {}
        for ci in items:
            product = ci.product or await self.session.get(Product, ci.product_id)
            if not product:
                continue
            line = product.price * ci.quantity
            subtotal += line
            product_qty[product.id] = product_qty.get(product.id, 0) + ci.quantity

        # vouchers
        discount = 0.0
        applied_voucher_code = None
        applicable = await self._get_applicable_vouchers(user)
        for v in applicable:
            # gather products linked to voucher
            result = await self.session.execute(select(VoucherProductLink).where(VoucherProductLink.voucher_id == v.id))
            links = result.scalars().all()
            
            # If voucher is user_type and has no specific products, it applies to the whole cart
            if v.scope == 'user_type' and not links:
                if subtotal >= (v.min_quantity or 0):
                    if v.discount_type == "fixed":
                        discount += v.amount
                        applied_voucher_code = v.code
                    elif v.discount_type == "percent":
                        discount += (v.amount / 100.0) * subtotal
                        applied_voucher_code = v.code
                continue

            matched_qty = 0
            for ln in links:
                matched_qty += product_qty.get(ln.product_id, 0)
            if matched_qty <= 0:
                continue
            if matched_qty < (v.min_quantity or 0):
                continue
            if v.discount_type == "fixed":
                if v.per_unit:
                    discount += v.amount * matched_qty
                    applied_voucher_code = v.code
                else:
                    discount += v.amount
                    applied_voucher_code = v.code
            elif v.discount_type == "percent":
                # percent applies on subtotal of matched items; approximate by subtotal proportionally
                # For simplicity now, apply percent on overall subtotal; can refine later
                discount += (v.amount / 100.0) * subtotal
                applied_voucher_code = v.code

        # shipping
        cfg = await self._get_active_shipping_config()
        total_qty = sum(product_qty.values())
        if total_qty <= 0:
            shipping = 0.0
        else:
            shipping = cfg.base_fee_first_item + max(0, total_qty - 1) * cfg.additional_fee_per_item

        total = max(0.0, subtotal - discount + shipping)
        return {"subtotal": subtotal, "discount": discount, "shipping": shipping, "total": total, "applied_voucher_code": applied_voucher_code}


