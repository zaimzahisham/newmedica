from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from uuid import UUID
from typing import List, Optional

from app.models.voucher import Voucher
from app.repositories.base_repository import BaseRepository
from app.schemas.admin_voucher import VoucherCreate, VoucherUpdate

class AdminVoucherService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.voucher_repo = BaseRepository(session, Voucher)

    async def create_voucher(self, voucher_data: VoucherCreate) -> Voucher:
        new_voucher = Voucher.model_validate(voucher_data)
        return await self.voucher_repo.create(new_voucher)

    async def get_all_vouchers(self) -> List[Voucher]:
        return await self.voucher_repo.get_all()

    async def get_voucher_by_id(self, voucher_id: UUID) -> Optional[Voucher]:
        return await self.voucher_repo.get_by_id(voucher_id)

    async def update_voucher(self, voucher_id: UUID, voucher_data: VoucherUpdate) -> Optional[Voucher]:
        return await self.voucher_repo.update(voucher_id, voucher_data.model_dump(exclude_unset=True))

    async def delete_voucher(self, voucher_id: UUID) -> bool:
        return await self.voucher_repo.delete(voucher_id)
