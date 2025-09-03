from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.controllers.order_controller import OrderController
from app.schemas.order import OrderRead, OrderCreate
from app.schemas.payment import PaymentResponse
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.models.order import Order
from app.models.order import OrderItem
from app.models.product import Product

router = APIRouter()

@router.post("", response_model=OrderRead, status_code=201)
async def create_order_from_cart(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    payload: OrderCreate | None = None,
):
    """
    Create an order from the current user's cart.
    """
    order_controller = OrderController(session)
    order = await order_controller.create_order_from_cart(user_id=current_user.id, clear_cart=True)
    # Persist optional fields if provided (best-effort)
    if payload:
        if payload.shipping_address is not None:
            order.shipping_address = payload.shipping_address
        if payload.billing_address is not None:
            order.billing_address = payload.billing_address
        # If billing address is not provided, use the shipping address
        elif payload.shipping_address is not None:
            order.billing_address = payload.shipping_address
        if payload.remark is not None:
            order.remark = payload.remark
        if payload.payment_method is not None:
            order.payment_method = payload.payment_method
        await session.commit()
    # Re-fetch with eager-loaded items for response serialization
    result = await session.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .options(
                selectinload(Product.category),
                selectinload(Product.media),
            )
        )
    )
    return result.scalar_one()


@router.get("", response_model=list[OrderRead])
async def get_orders(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get a list of the current user's orders.
    """
    order_controller = OrderController(session)
    return await order_controller.get_orders(user_id=current_user.id)


@router.get("/{order_id}", response_model=OrderRead)
async def get_order_by_id(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    order_id: UUID,
):
    """
    Get a single order by its ID.
    """
    order_controller = OrderController(session)
    order = await order_controller.get_order_by_id(order_id=order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.get("/verify-payment/{stripe_session_id}", response_model=OrderRead)
async def verify_payment_status(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    stripe_session_id: str,
):
    """
    Verifies Stripe payment session and updates order status.
    """
    order_controller = OrderController(session)
    order = await order_controller.verify_payment_status(stripe_session_id=stripe_session_id, user_id=current_user.id)
    return order


@router.post("/{order_id}/retry-payment", response_model=PaymentResponse)
async def retry_payment_for_order(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    order_id: UUID,
):
    """
    Creates a new Stripe Checkout session for an existing pending order.
    """
    order_controller = OrderController(session)
    payment_info = await order_controller.retry_payment_for_order(order_id=order_id, user_id=current_user.id)
    return PaymentResponse(payment_url=payment_info["url"])


@router.post("/{order_id}/mark-paid", response_model=OrderRead)
async def mark_order_paid(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    order_id: UUID,
):
    """
    Mark an order as paid (MVP helper when webhooks are not used).
    """
    order_controller = OrderController(session)
    order = await order_controller.get_order_by_id(order_id=order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Use service to mark paid
    service = order_controller.order_service
    updated = await service.mark_order_paid(order_id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to update payment status")
    return updated
