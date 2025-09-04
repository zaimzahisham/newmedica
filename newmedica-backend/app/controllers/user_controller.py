
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import UserUpdate, PasswordChange
from app.services.user_service import UserService

class UserController:
    def __init__(self, session: AsyncSession):
        self.service = UserService(session)

    async def update_user_profile(self, user: User, user_in: UserUpdate) -> User:
        return await self.service.update_user(user, user_in)

    async def change_password(self, user: User, password_in: PasswordChange):
        await self.service.change_password(user, password_in)
        return {"message": "Password updated successfully"}
