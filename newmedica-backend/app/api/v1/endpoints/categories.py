from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.schemas.category import CategoryCreate, CategoryRead
from app.services.category_service import CategoryService
from app.api.v1.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=CategoryRead, status_code=201)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = CategoryService(db)
    category = await service.create_category(category_in)
    return category

@router.get("", response_model=List[CategoryRead])
async def get_all_categories(
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = CategoryService(db)
    categories = await service.get_all_categories()
    return categories