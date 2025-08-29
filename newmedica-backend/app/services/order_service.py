import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.repositories.cart_repository import CartRepository
from app.models.order import Order, OrderItem
from app.models.product import Product
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.services.pricing_service import PricingService

class OrderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repository = OrderRepository(session)
        self.cart_repository = CartRepository(session)

    async def create_order_from_cart(self, user_id: uuid.UUID, clear_cart: bool = True) -> Order:
        cart = await self.cart_repository.get_cart_by_user_id(user_id)
        # Check for an existing pending order first
        existing_pending_order = await self.order_repository.get_pending_order_by_user_id(user_id)
        if existing_pending_order:
            # If a pending order exists, we'll work with that one instead of creating a new one.
            # This prevents creating duplicate orders if the user abandons and retries checkout.
            order = existing_pending_order
        else:
            # If no pending order, create a new one
            if not cart or not cart.items:
                raise ValueError("Cart is empty")
            order = await self.order_repository.create_order_from_cart(user_id, cart)

        # Compute totals using pricing service (includes vouchers + shipping)
        pricing = PricingService(self.session)
        totals = await pricing.compute_totals(user_id)

        # Overwrite total_amount with computed total (backward compatible)
        order.total_amount = float(totals.get("total", order.total_amount))
        order.applied_voucher_code = totals.get("applied_voucher_code") # Assign applied voucher code
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)

        # Populate snapshot fields and amounts breakdown without triggering lazy loads on order.items
        result_items = await self.session.execute(
            select(OrderItem).where(OrderItem.order_id == order.id).options(selectinload(OrderItem.product).selectinload(Product.media))
        )
        order_items = list(result_items.scalars().all())
        subtotal = 0.0
        for item in order_items:
            product = await self.session.get(Product, item.product_id)
            if product:
                item.snapshot_name = product.name
                item.snapshot_price = product.price
                # Pick first media url if available
                if getattr(product, "media", None):
                    try:
                        first_media = sorted(product.media, key=lambda m: m.display_order)[0]
                        item.snapshot_media_url = first_media.url
                    except Exception:
                        item.snapshot_media_url = None
            line_subtotal = (item.unit_price or (product.price if product else 0.0)) * item.quantity
            item.line_subtotal = line_subtotal
            subtotal += line_subtotal

        total_discount = float(totals.get("discount", 0.0))
        if subtotal > 0:
            for item in order_items:
                item_discount = (item.line_subtotal / subtotal) * total_discount
                item.discount_amount = item_discount
                item.line_total = item.line_subtotal - item_discount
        else:
            for item in order_items:
                item.discount_amount = 0.0
                item.line_total = item.line_subtotal

        order.subtotal_amount = subtotal
        order.shipping_amount = float(totals.get("shipping", 0.0))
        order.discount_amount = total_discount
        order.currency = order.currency or "MYR"
        self.session.add(order)
        for it in order_items:
            self.session.add(it)
        await self.session.commit()

        # Clear the cart only if requested (e.g., non-Stripe flows)
        if clear_cart:
            for item in cart.items:
                await self.session.delete(item)
            await self.session.commit()

        # Re-fetch eagerly-loaded order for response serialization
        result = await self.session.execute(
            select(Order)
            .where(Order.id == order.id)
            .options(
                selectinload(Order.items),
            )
        )
        return result.scalar_one()

    async def get_orders_by_user_id(self, user_id: uuid.UUID) -> list[Order]:
        return await self.order_repository.get_orders_by_user_id(user_id)

    async def get_order_by_id(self, order_id: uuid.UUID) -> Order | None:
        return await self.order_repository.get_order_by_id(order_id)

    async def mark_order_paid(self, order_id: uuid.UUID) -> Order | None:
        # Update status first
        updated = await self.order_repository.update_payment_status(order_id, status="paid")
        if not updated:
            return None
        # Best-effort clear of user's cart upon successful payment
        try:
            if getattr(updated, "user_id", None):
                cart = await self.cart_repository.get_cart_by_user_id(updated.user_id)
                if cart and cart.items:
                    for item in cart.items:
                        await self.session.delete(item)
                    await self.session.commit()
        except Exception:
            # Do not block payment marking on cart clear issues
            pass
        return updated
