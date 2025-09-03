import uuid
import stripe
from sqlmodel.ext.asyncio.session import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.repositories.cart_repository import CartRepository
from app.models.order import Order, OrderItem
from app.models.product import Product
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.services.pricing_service import PricingService
from app.core.config import settings
from fastapi import HTTPException, status

class OrderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repository = OrderRepository(session)
        self.cart_repository = CartRepository(session)
        stripe.api_key = settings.STRIPE_SECRET_KEY

    async def create_order_from_cart(self, user_id: uuid.UUID, clear_cart: bool = True) -> Order:
        cart = await self.cart_repository.get_cart_by_user_id(user_id)
        
        # Always create a new order from the cart
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

    def _create_stripe_session_for_order(self, order: Order) -> dict:
        line_items = []
        for item in order.items:
            line_items.append(
                {
                    "price_data": {
                        "currency": order.currency or "myr",
                        "product_data": {
                            "name": item.snapshot_name,
                        },
                        "unit_amount": int(item.unit_price * 100), # Stripe expects amount in cents
                    },
                    "quantity": item.quantity,
                }
            )
        
        # Add shipping as a line item
        if order.shipping_amount > 0:
            line_items.append(
                {
                    "price_data": {
                        "currency": order.currency or "myr",
                        "product_data": {
                            "name": "Shipping",
                        },
                        "unit_amount": int(order.shipping_amount * 100),
                    },
                    "quantity": 1,
                }
            )

        # Add discount as a coupon
        if order.discount_amount > 0:
            coupon = stripe.Coupon.create(
                name=f"D-{order.id}",
                amount_off=int(order.discount_amount * 100),
                currency=order.currency or "myr",
                duration="once",
            )
            discounts = [{"coupon": coupon.id}]
        else:
            discounts = []

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card", "fpx"],
            line_items=line_items,
            discounts=discounts,
            mode="payment",
            success_url=f"{settings.server_host}/orders/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.server_host}/orders/cancel",
            client_reference_id=str(order.id),
        )
        return checkout_session

    async def verify_payment_status(self, stripe_session_id: str, user_id: uuid.UUID) -> Order:
        try:
            checkout_session = stripe.checkout.Session.retrieve(stripe_session_id)
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe API Error: {e.user_message}")

        if not checkout_session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stripe session not found.")

        if checkout_session.payment_status != "paid":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment not successful.")

        client_reference_id = checkout_session.client_reference_id
        if not client_reference_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client reference ID not found in Stripe session.")

        order_id = uuid.UUID(client_reference_id)
        order = await self.get_order_by_id(order_id)

        if not order or order.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found or does not belong to user.")

        if order.payment_status == "paid":
            return order # Already paid, no need to update

        updated_order = await self.mark_order_paid(order_id)
        if not updated_order:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update order status.")
        return updated_order

    async def retry_payment_for_order(self, order_id: uuid.UUID, user_id: uuid.UUID) -> dict:
        order = await self.get_order_by_id(order_id)

        if not order or order.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        if order.payment_status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order has already been paid.",
            )

        session = self._create_stripe_session_for_order(order)
        return session

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
