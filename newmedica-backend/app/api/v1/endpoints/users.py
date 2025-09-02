from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.user_type import UserType
from app.schemas.user import UserReadWithDetails, UserUpdate
from app.schemas.voucher_schema import UserVoucherRead
from app.repositories.voucher_repository import VoucherRepository
from app.controllers.user_controller import UserController

router = APIRouter()


@router.get("/me", response_model=UserReadWithDetails)
async def read_users_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Get current user.
    """
    user_type_result = await session.execute(
        select(UserType).where(UserType.id == current_user.user_type_id)
    )
    user_type = user_type_result.scalar_one_or_none()

    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "user_type": user_type.name if user_type else "Unknown",
        **(current_user.extra_fields or {}),
    }

    return UserReadWithDetails.model_validate(response_data)

@router.patch("/me", response_model=UserReadWithDetails)
async def update_user_me(
    *, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
    user_in: UserUpdate,
):
    """
    Update own user.
    """
    user_controller = UserController(session)
    user = await user_controller.update_user_profile(user=current_user, user_in=user_in)
    user_type_result = await session.execute(
        select(UserType).where(UserType.id == user.user_type_id)
    )
    user_type = user_type_result.scalar_one_or_none()

    response_data = {
        "id": user.id,
        "email": user.email,
        "user_type": user_type.name if user_type else "Unknown",
        **(user.extra_fields or {}),
    }
    return UserReadWithDetails.model_validate(response_data)

@router.get("/me/vouchers", response_model=List[UserVoucherRead])
async def get_my_vouchers(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all vouchers for the current user.
    """
    voucher_repo = VoucherRepository(session)
    vouchers = await voucher_repo.get_vouchers_for_user(user_id=current_user.id)
    return vouchers
