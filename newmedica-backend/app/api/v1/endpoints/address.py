from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models import User
from app.schemas.address import AddressCreate, AddressRead, AddressUpdate
from app.services.address_service import AddressService
from app.api.v1.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[AddressRead])
async def get_addresses(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> List[AddressRead]:
    service = AddressService(session)
    addresses = await service.get_all_addresses_for_user(current_user)
    return [AddressRead.model_validate(addr) for addr in addresses]

@router.post("/", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(address_in: AddressCreate, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> AddressRead:
    service = AddressService(session)
    address = await service.create_address_for_user(address_in, current_user)
    return AddressRead.model_validate(address)

@router.get("/{address_id}", response_model=AddressRead)
async def get_address(address_id: uuid.UUID, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> AddressRead:
    service = AddressService(session)
    address = await service.get_address_by_id_for_user(address_id, current_user)
    return AddressRead.model_validate(address)

@router.put("/{address_id}", response_model=AddressRead)
async def update_address(address_id: uuid.UUID, address_in: AddressUpdate, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> AddressRead:
    service = AddressService(session)
    address = await service.update_address_for_user(address_id, address_in, current_user)
    return AddressRead.model_validate(address)

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(address_id: uuid.UUID, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    service = AddressService(session)
    await service.delete_address_for_user(address_id, current_user)
    return

@router.post("/{address_id}/set-primary", response_model=AddressRead)
async def set_primary_address(address_id: uuid.UUID, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)) -> AddressRead:
    service = AddressService(session)
    address = await service.set_primary_address_for_user(address_id, current_user)
    return AddressRead.model_validate(address)