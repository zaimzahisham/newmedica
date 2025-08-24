
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.controllers.cart_controller import CartController
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate

router = APIRouter()

@router.get("/", response_model=CartRead)
async def get_cart(
    *, 
    session: AsyncSession = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    """    
    Get the current user's cart.
    """
    cart_controller = CartController(session)
    return await cart_controller.get_cart(user_id=current_user.id)


@router.post("/items", status_code=201)
async def add_item_to_cart(
    *, 
    session: AsyncSession = Depends(get_session), 
    current_user: User = Depends(get_current_user),
    item: CartItemCreate
):
    """    
    Add an item to the current user's cart.
    """
    cart_controller = CartController(session)
    return await cart_controller.add_item_to_cart(user_id=current_user.id, item=item)

@router.put("/items/{item_id}", response_model=CartRead)
async def update_cart_item_quantity(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    item_id: UUID,
    item: CartItemUpdate,
):
    """
    Update the quantity of an item in the current user's cart.
    """
    cart_controller = CartController(session)
    return await cart_controller.update_item_quantity(
        user_id=current_user.id, item_id=item_id, item=item
    )

@router.delete("/items/{item_id}", response_model=CartRead)
async def delete_cart_item(
    *,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    item_id: UUID,
):
    """
    Delete an item from the current user's cart.
    """
    cart_controller = CartController(session)
    return await cart_controller.delete_item_from_cart(
        user_id=current_user.id, item_id=item_id
    )
