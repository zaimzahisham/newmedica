from typing import List

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate


class CategoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_category(self, category: CategoryCreate) -> Category:
        db_category = Category.model_validate(category)
        self.session.add(db_category)
        await self.session.commit()
        await self.session.refresh(db_category)
        return db_category

    async def get_all_categories(self) -> List[Category]:
        result = await self.session.execute(select(Category))
        return result.scalars().all()  # type: ignore
