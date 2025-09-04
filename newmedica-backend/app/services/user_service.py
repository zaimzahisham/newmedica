from typing import Optional
from fastapi import HTTPException

from passlib.context import CryptContext
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.voucher_repository import VoucherRepository
from app.schemas.user import UserCreate, UserUpdate, PasswordChange

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class UserService:
    def __init__(self, db_session: AsyncSession):
        self.repo = UserRepository(db_session)
        self.voucher_repo = VoucherRepository(db_session)

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
            "extra_fields": user_in.extra_fields,
        }

        new_user = await self.repo.create(user_data)

        # Auto-assign voucher for Agent or Healthcare users
        if user_type.name in ["Agent", "Healthcare"]:
            default_voucher = await self.voucher_repo.get_default_voucher_for_user_type(
                user_type.id
            )
            if default_voucher:
                await self.voucher_repo.assign_voucher_to_user(
                    new_user.id, default_voucher.id
                )

        return new_user

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    async def update_user(self, user: User, user_in: UserUpdate) -> User:
        update_data = user_in.model_dump(exclude_unset=True)

        # All fields in UserUpdate are intended for the extra_fields JSONB column.
        # We merge them with the existing extra_fields.
        if update_data:
            if user.extra_fields:
                # Update existing extra_fields with new data
                merged_extra_fields = user.extra_fields.copy()
                merged_extra_fields.update(update_data)
                db_update_data = {"extra_fields": merged_extra_fields}
            else:
                # If no extra_fields exist, create them
                db_update_data = {"extra_fields": update_data}
            
            return await self.repo.update(user, db_update_data)

        return user # Return the user as is if there's no data to update

    async def change_password(self, user: User, password_in: PasswordChange):
        if not verify_password(password_in.old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect old password")

        if verify_password(password_in.new_password, user.password_hash):
            raise HTTPException(status_code=400, detail="New password must be different from the old password")

        new_password_hash = self.get_password_hash(password_in.new_password)
        await self.repo.update(user, {"password_hash": new_password_hash})
