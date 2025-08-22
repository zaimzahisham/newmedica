
from sqlmodel.ext.asyncio.session import AsyncSession
from passlib.context import CryptContext
import uuid
from typing import Optional

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import verify_password
from app.repositories.user_repository import UserRepository

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class UserService:
    def __init__(self, db_session: AsyncSession):
        self.repo = UserRepository(db_session)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        return await self.repo.get_by_email(email)

    async def create_user(self, user_in: UserCreate) -> User:
        user_type = await self.repo.get_user_type_by_name(user_in.userType)
        if not user_type:
            # In a real app, you might raise a specific exception
            raise ValueError(f"User type '{user_in.userType}' not found.")

        hashed_password = self.get_password_hash(user_in.password)
        
        user_data = {
            "email": user_in.email,
            "password_hash": hashed_password,
            "user_type_id": user_type.id,
            "extra_fields": user_in.extra_fields
        }
        
        return await self.repo.create(user_data)

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user
