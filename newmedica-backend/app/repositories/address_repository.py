from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Address
from app.schemas.address import AddressUpdate

class AddressRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_address_by_id(self, address_id: UUID) -> Address | None:
        return await self.session.get(Address, address_id)

    async def get_addresses_by_user_id(self, user_id: UUID) -> list[Address]:
        result = await self.session.execute(
            select(Address).where(Address.user_id == user_id)
        )
        return result.scalars().all()

    async def create_address(self, address_create, user_id: UUID) -> Address:
        address_dict = address_create.model_dump()
        address_dict["user_id"] = user_id
        new_address = Address(**address_dict)
        self.session.add(new_address)
        await self.session.commit()
        await self.session.refresh(new_address)
        return new_address

    async def update_address(self, address_id: UUID, address_update: AddressUpdate) -> Address | None:
        address = await self.get_address_by_id(address_id)
        if address:
            update_data = address_update.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(address, key, value)
            await self.session.commit()
            await self.session.refresh(address)
        return address

    async def delete_address(self, address_id: UUID) -> None:
        address = await self.get_address_by_id(address_id)
        if address:
            await self.session.delete(address)
            await self.session.commit()

    async def set_primary_address(self, user_id: UUID, address_id: UUID) -> Address | None:
        current_primary_list = await self.session.execute(
            select(Address).where(Address.user_id == user_id, Address.is_primary == True)
        )
        current_primary = current_primary_list.scalar_one_or_none()

        if current_primary and current_primary.id != address_id:
            current_primary.is_primary = False
            self.session.add(current_primary)

        new_primary = await self.get_address_by_id(address_id)
        if new_primary:
            new_primary.is_primary = True
            self.session.add(new_primary)
            await self.session.commit()
            await self.session.refresh(new_primary)
        return new_primary

    async def get_primary_for_user(self, user_id: UUID) -> Address | None:
        result = await self.session.execute(
            select(Address).where(Address.user_id == user_id, Address.is_primary == True)
        )
        return result.scalar_one_or_none()