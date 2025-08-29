from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.cart_service import CartService
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead
from app.services.pricing_service import PricingService
from app.schemas.product import ProductRead
from app.schemas.category import CategoryRead

class CartController:
    def __init__(self, session: AsyncSession):
        self.service = CartService(session)
        self.pricing_service = PricingService(session)

    async def get_cart(self, user_id: UUID) -> CartRead:
        cart = await self.service.get_or_create_cart_by_user_id(user_id)
        totals = await self.pricing_service.compute_totals(user_id)

        # Manually populate CartRead from Cart object and computed totals
        cart_read = CartRead(
            id=cart.id,
            user_id=cart.user_id,
            items=[
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "product": ProductRead.model_validate(item.product) if item.product else None, # Ensure product is loaded
                    "price": item.product.price if item.product else 0.0 # Use product price for item price
                } for item in cart.items
            ],
            subtotal=totals["subtotal"],
            discount=totals["discount"],
            shipping=totals["shipping"],
            total=totals["total"],
        )
        return cart_read

    async def add_item_to_cart(self, user_id: UUID, item: CartItemCreate):
        return await self.service.add_item_to_cart(user_id, item)

    async def update_item_quantity(self, user_id: UUID, item_id: UUID, item: CartItemUpdate):
        return await self.service.update_cart_item_quantity(user_id, item_id, item.quantity)

    async def delete_item_from_cart(self, user_id: UUID, item_id: UUID):
        return await self.service.remove_item_from_cart(user_id, item_id)