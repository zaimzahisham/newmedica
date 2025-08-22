from fastapi import Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import get_current_user
from app.models.user import User
from app.models.user_type import UserType
from app.db.session import get_session

async def get_current_admin_user(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> User:
    user_type = await session.get(UserType, current_user.user_type_id)
    if not user_type or user_type.name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user
