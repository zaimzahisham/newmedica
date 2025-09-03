import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.order_service import OrderService

class OrderController:
    def __init__(self, session: AsyncSession):
        self.order_service = OrderService(session)

    async def create_order_from_cart(self, user_id: uuid.UUID, clear_cart: bool = True):
        return await self.order_service.create_order_from_cart(user_id, clear_cart=clear_cart)

    async def get_orders(self, user_id: uuid.UUID):
        return await self.order_service.get_orders_by_user_id(user_id)

    async def get_order_by_id(self, order_id: uuid.UUID):
        return await self.order_service.get_order_by_id(order_id)

    async def verify_payment_status(self, stripe_session_id: str, user_id: uuid.UUID):
        return await self.order_service.verify_payment_status(stripe_session_id=stripe_session_id, user_id=user_id)

    async def retry_payment_for_order(self, order_id: uuid.UUID, user_id: uuid.UUID):
        return await self.order_service.retry_payment_for_order(order_id=order_id, user_id=user_id)

    async def mark_order_paid(self, order_id: uuid.UUID):
        return await self.order_service.mark_order_paid(order_id)
