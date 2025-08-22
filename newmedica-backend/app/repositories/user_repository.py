
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional
import uuid

from app.models.user import User
from app.models.user_type import UserType

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_type_by_name(self, name: str) -> Optional[UserType]:
        result = await self.session.execute(select(UserType).where(UserType.name == name))
        return result.scalar_one_or_none()

    async def create(self, user_data: dict) -> User:
        db_user = User(**user_data)
        self.session.add(db_user)
        await self.session.commit()
        await self.session.refresh(db_user)
        return db_user
