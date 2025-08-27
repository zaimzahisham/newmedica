from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.controllers.order_controller import OrderController
from app.schemas.order import OrderRead
from fastapi import HTTPException, status

router = APIRouter()

@router.post("", response_model=OrderRead, status_code=201)
async def create_order_from_cart(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Create an order from the current user's cart.
    """
    order_controller = OrderController(session)
    return await order_controller.create_order_from_cart(user_id=current_user.id)


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
    return await order_controller.get_order_by_id(order_id=order_id)


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
