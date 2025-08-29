from typing import Generic, Type, TypeVar, List, Optional
from uuid import UUID
from pydantic import BaseModel
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import AsyncSession

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model: Type[ModelType]):
        self.session = session
        self.model = model

    async def create(self, obj_in: ModelType) -> ModelType:
        self.session.add(obj_in)
        await self.session.commit()
        await self.session.refresh(obj_in)
        return obj_in

    async def get_by_id(self, id: UUID) -> Optional[ModelType]:
        result = await self.session.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_all(self) -> List[ModelType]:
        result = await self.session.execute(select(self.model))
        return result.scalars().all()

    async def update(self, id: UUID, obj_in: dict) -> Optional[ModelType]:
        db_obj = await self.get_by_id(id)
        if db_obj:
            for key, value in obj_in.items():
                setattr(db_obj, key, value)
            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, id: UUID) -> bool:
        db_obj = await self.get_by_id(id)
        if db_obj:
            await self.session.delete(db_obj)
            await self.session.commit()
            return True
        return False
