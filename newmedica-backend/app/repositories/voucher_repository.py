from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Voucher, UserVoucher

class VoucherRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_default_voucher_for_user_type(self, user_type_id: UUID) -> Voucher | None:
        result = await self.session.execute(
            select(Voucher).where(
                Voucher.scope == "user_type",
                Voucher.target_user_type_id == user_type_id,
                Voucher.is_active == True,
            )
        )
        return result.scalars().first()

    async def assign_voucher_to_user(self, user_id: UUID, voucher_id: UUID) -> None:
        user_voucher = UserVoucher(user_id=user_id, voucher_id=voucher_id)
        self.session.add(user_voucher)
        await self.session.commit()

    async def get_vouchers_for_user(self, user_id: UUID) -> list[Voucher]:
        result = await self.session.execute(
            select(Voucher)
            .join(UserVoucher)
            .where(UserVoucher.user_id == user_id)
        )
        return result.scalars().all()
    
    async def get_by_code(self, code: str) -> Voucher | None:
        result = await self.session.execute(select(Voucher).where(Voucher.code == code))
        return result.scalars().first()