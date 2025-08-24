import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from app.repositories.order_repository import OrderRepository
from app.repositories.cart_repository import CartRepository
from app.models.order import Order

class OrderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repository = OrderRepository(session)
        self.cart_repository = CartRepository(session)

    async def create_order_from_cart(self, user_id: uuid.UUID) -> Order:
        cart = await self.cart_repository.get_cart_by_user_id(user_id)
        if not cart or not cart.items:
            raise ValueError("Cart is empty")

        order = await self.order_repository.create_order_from_cart(user_id, cart)

        # Clear the cart
        for item in cart.items:
            await self.session.delete(item)
        await self.session.commit()

        return order

    async def get_orders_by_user_id(self, user_id: uuid.UUID) -> list[Order]:
        return await self.order_repository.get_orders_by_user_id(user_id)

    async def get_order_by_id(self, order_id: uuid.UUID) -> Order | None:
        return await self.order_repository.get_order_by_id(order_id)
