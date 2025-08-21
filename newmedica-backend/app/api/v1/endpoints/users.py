
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserReadWithDetails
from app.db.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.user_type import UserType

router = APIRouter()

@router.get("/me", response_model=UserReadWithDetails)
async def read_users_me(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    """
    Get current user.
    """
    user_type_result = await session.execute(select(UserType).where(UserType.id == current_user.user_type_id))
    user_type = user_type_result.scalar_one_or_none()

    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "user_type": user_type.name if user_type else "Unknown",
        **(current_user.extra_fields or {})
    }
    
    return UserReadWithDetails.model_validate(response_data)
