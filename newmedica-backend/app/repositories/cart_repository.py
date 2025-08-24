from uuid import UUID
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.cart import CartItemCreate
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.category import Category

class CartRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_cart_by_user_id(self, user_id: UUID) -> Cart | None:
        result = await self.session.execute(
            select(Cart).where(Cart.user_id == user_id).options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.category),
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.media)
            )
        )
        return result.scalar_one_or_none()

    async def create_cart_for_user(self, user_id: UUID) -> Cart:
        cart = Cart(user_id=user_id)
        self.session.add(cart)
        await self.session.commit()
        await self.session.refresh(cart)
        return cart

    async def get_or_create_cart_by_user_id(self, user_id: UUID) -> Cart:
        cart = await self.get_cart_by_user_id(user_id)
        if not cart:
            cart = await self.create_cart_for_user(user_id)
        return cart

    async def add_item_to_cart(self, user_id: UUID, item: CartItemCreate) -> CartItem:
        cart = await self.get_or_create_cart_by_user_id(user_id)
        
        # Check if item already exists
        existing_item = next((i for i in cart.items if i.product_id == item.product_id), None)
        
        if existing_item:
            existing_item.quantity += item.quantity
            self.session.add(existing_item)
            await self.session.commit()
            await self.session.refresh(existing_item)
            return existing_item
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=item.product_id,
                quantity=item.quantity,
            )
            self.session.add(new_item)
            await self.session.commit()
            await self.session.refresh(new_item)
            return new_item

    async def update_cart_item_quantity(self, user_id: UUID, item_id: UUID, quantity: int) -> Cart:
        cart = await self.get_or_create_cart_by_user_id(user_id)
        
        item_to_update = next((i for i in cart.items if i.id == item_id), None)
        
        if item_to_update:
            item_to_update.quantity = quantity
            self.session.add(item_to_update)
            await self.session.commit()
            await self.session.refresh(cart)
            
        return cart

    async def remove_item_from_cart(self, user_id: UUID, item_id: UUID) -> Cart:
        cart = await self.get_or_create_cart_by_user_id(user_id)
        
        item_to_remove = next((i for i in cart.items if i.id == item_id), None)
        
        if item_to_remove:
            await self.session.delete(item_to_remove)
            await self.session.commit()
            await self.session.refresh(cart)
            
        return cart