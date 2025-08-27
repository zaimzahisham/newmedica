import uuid
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.order import Order, OrderItem
from app.models.cart import Cart
from app.models.product import Product

class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_order_from_cart(self, user_id: uuid.UUID, cart: Cart) -> Order:
        total_amount = sum(item.product.price * item.quantity for item in cart.items)
        order = Order(user_id=user_id, total_amount=total_amount)
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)

        for item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.product.price,
            )
            self.session.add(order_item)

        await self.session.commit()
        
        # Eagerly load items and nested product relationships for response schemas
        result = await self.session.execute(
            select(Order)
            .where(Order.id == order.id)
            .options(
                selectinload(Order.items)
                .selectinload(OrderItem.product)
                .selectinload(Product.category),
                selectinload(Order.items)
                .selectinload(OrderItem.product)
                .selectinload(Product.media),
            )
        )
        return result.scalar_one()

    async def get_orders_by_user_id(self, user_id: uuid.UUID) -> list[Order]:
        result = await self.session.execute(
            select(Order).where(Order.user_id == user_id).options(
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.media)
            )
        )
        return result.scalars().all()

    async def get_order_by_id(self, order_id: uuid.UUID) -> Order | None:
        result = await self.session.execute(
            select(Order).where(Order.id == order_id).options(
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.media)
            )
        )
        return result.scalar_one_or_none()

    async def get_pending_order_by_user_id(self, user_id: uuid.UUID) -> Order | None:
        result = await self.session.execute(
            select(Order).where(Order.user_id == user_id, Order.payment_status == "pending")
        )
        return result.scalars().first()

    async def update_payment_status(self, order_id: uuid.UUID, status: str) -> Order | None:
        order = await self.session.get(Order, order_id)
        if not order:
            return None
        order.payment_status = status
        self.session.add(order)
        await self.session.commit()
        await self.session.refresh(order)
        return order