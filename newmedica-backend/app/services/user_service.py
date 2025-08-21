
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from passlib.context import CryptContext
import uuid

from app.models.user import User
from app.models.user_type import UserType
from app.schemas.user import UserCreate

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class UserService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_type_by_name(self, name: str) -> UserType | None:
        result = await self.db.execute(select(UserType).where(UserType.name == name))
        return result.scalar_one_or_none()

    async def create_user(self, user_in: UserCreate, user_type_id: uuid.UUID) -> User:
        hashed_password = self.get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            password_hash=hashed_password,
            user_type_id=user_type_id,
            extra_fields=user_in.extra_fields
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
