from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.cart_service import CartService
from app.schemas.cart import CartItemCreate, CartItemUpdate

class CartController:
    def __init__(self, session: AsyncSession):
        self.service = CartService(session)

    async def get_cart(self, user_id: UUID):
        return await self.service.get_or_create_cart_by_user_id(user_id)

    async def add_item_to_cart(self, user_id: UUID, item: CartItemCreate):
        return await self.service.add_item_to_cart(user_id, item)

    async def update_item_quantity(self, user_id: UUID, item_id: UUID, item: CartItemUpdate):
        return await self.service.update_cart_item_quantity(user_id, item_id, item.quantity)

    async def delete_item_from_cart(self, user_id: UUID, item_id: UUID):
        return await self.service.remove_item_from_cart(user_id, item_id)