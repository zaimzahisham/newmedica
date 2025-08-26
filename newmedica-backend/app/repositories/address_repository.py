from typing import List, Optional
import uuid
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Address
from app.schemas.address import AddressCreate, AddressUpdate

class AddressRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_addresses_by_user_id(self, user_id: uuid.UUID) -> List[Address]:
        result = await self.session.execute(select(Address).where(Address.user_id == user_id))
        return result.scalars().all()

    async def get_address_by_id(self, address_id: uuid.UUID) -> Optional[Address]:
        return await self.session.get(Address, address_id)

    async def create_address(self, address_create: AddressCreate, user_id: uuid.UUID) -> Address:
        new_address = Address(**address_create.dict(), user_id=user_id)
        self.session.add(new_address)
        await self.session.commit()
        await self.session.refresh(new_address)
        return new_address

    async def update_address(self, address_id: uuid.UUID, address_update: AddressUpdate) -> Optional[Address]:
        address = await self.get_address_by_id(address_id)
        if address:
            for key, value in address_update.dict(exclude_unset=True).items():
                setattr(address, key, value)
            await self.session.commit()
            await self.session.refresh(address)
        return address

    async def delete_address(self, address_id: uuid.UUID) -> bool:
        address = await self.get_address_by_id(address_id)
        if address:
            await self.session.delete(address)
            await self.session.commit()
            return True
        return False

    async def set_primary_address(self, user_id: uuid.UUID, address_id: uuid.UUID) -> Optional[Address]:
        # First, unset any existing primary address for the user
        current_primary_result = await self.session.execute(
            select(Address).where(Address.user_id == user_id, Address.is_primary == True)
        )
        current_primary = current_primary_result.scalar_one_or_none()
        if current_primary:
            current_primary.is_primary = False
            self.session.add(current_primary)

        # Now, set the new primary address
        new_primary = await self.get_address_by_id(address_id)
        if new_primary and new_primary.user_id == user_id:
            new_primary.is_primary = True
            self.session.add(new_primary)
            await self.session.commit()
            await self.session.refresh(new_primary)
            return new_primary
        return None
