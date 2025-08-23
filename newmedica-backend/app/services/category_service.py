from typing import List

from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate


class CategoryService:
    def __init__(self, db_session: AsyncSession):
        self.repo = CategoryRepository(db_session)

    async def create_category(self, category: CategoryCreate) -> Category:
        return await self.repo.create_category(category)

    async def get_all_categories(self) -> List[Category]:
        return await self.repo.get_all_categories()
