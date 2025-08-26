from typing import List, Optional
import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.address_repository import AddressRepository
from app.schemas.address import AddressCreate, AddressUpdate
from app.models import Address, User

class AddressService:
    def __init__(self, session: AsyncSession):
        self.repo = AddressRepository(session)

    async def get_all_addresses_for_user(self, user: User) -> List[Address]:
        return await self.repo.get_addresses_by_user_id(user.id)

    async def get_address_by_id_for_user(self, address_id: uuid.UUID, user: User) -> Address:
        address = await self.repo.get_address_by_id(address_id)
        if not address or address.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
        return address

    async def create_address_for_user(self, address_create: AddressCreate, user: User) -> Address:
        # If this is the first address, make it primary
        existing_addresses = await self.get_all_addresses_for_user(user)
        if not existing_addresses:
            address_create.is_primary = True
        
        new_address = await self.repo.create_address(address_create, user.id)
        
        # If the new address is set as primary, unset the old one
        if new_address.is_primary:
            await self.repo.set_primary_address(user.id, new_address.id)
            
        return new_address

    async def update_address_for_user(self, address_id: uuid.UUID, address_update: AddressUpdate, user: User) -> Address:
        address = await self.get_address_by_id_for_user(address_id, user)
        updated_address = await self.repo.update_address(address.id, address_update)
        if not updated_address:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found after update attempt")
        return updated_address

    async def delete_address_for_user(self, address_id: uuid.UUID, user: User):
        address = await self.get_address_by_id_for_user(address_id, user)
        # You might want to add logic here to prevent deleting the last address, or reassigning primary status
        await self.repo.delete_address(address.id)

    async def set_primary_address_for_user(self, address_id: uuid.UUID, user: User) -> Address:
        address = await self.get_address_by_id_for_user(address_id, user)
        primary_address = await self.repo.set_primary_address(user.id, address.id)
        if not primary_address:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not set primary address")
        return primary_address
