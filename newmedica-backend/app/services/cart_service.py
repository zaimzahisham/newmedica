from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from app.repositories.cart_repository import CartRepository
from app.schemas.cart import CartItemCreate
from app.services.pricing_service import PricingService

class CartService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = CartRepository(session)

    async def get_cart_by_user_id(self, user_id: UUID):
        cart = await self.repository.get_cart_by_user_id(user_id)
        if cart:
            pricing_service = PricingService(self.session)
            totals = await pricing_service.compute_totals(user_id)
            cart.subtotal = totals["subtotal"]
            cart.discount = totals["discount"]
            cart.shipping = totals["shipping"]
            cart.total = totals["total"]
            cart.applied_voucher_code = totals["applied_voucher_code"]
        return cart

    async def get_or_create_cart_by_user_id(self, user_id: UUID):
        return await self.repository.get_or_create_cart_by_user_id(user_id)

    async def add_item_to_cart(self, user_id: UUID, item: CartItemCreate):
        return await self.repository.add_item_to_cart(user_id, item)

    async def update_cart_item_quantity(self, user_id: UUID, item_id: UUID, quantity: int):
        return await self.repository.update_cart_item_quantity(user_id, item_id, quantity)

    async def remove_item_from_cart(self, user_id: UUID, item_id: UUID):
        return await self.repository.remove_item_from_cart(user_id, item_id)