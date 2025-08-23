import os
import shutil
from typing import List, Optional
from uuid import UUID

from fastapi import UploadFile
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.product import Product
from app.models.product_media import ProductMedia
from app.repositories.product_repository import ProductRepository
from app.schemas.media import ProductMediaCreate
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db_session: AsyncSession):
        self.repo = ProductRepository(db_session)

    async def create_product(self, product: ProductCreate) -> Product:
        return await self.repo.create_product(product)

    async def get_all_products(
        self,
        category_name: Optional[str] = None,
        search_term: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
    ) -> List[Product]:
        return await self.repo.get_all_products(
            category_name=category_name,
            search_term=search_term,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_product_by_id(self, product_id: UUID) -> Product | None:
        return await self.repo.get_product_by_id(product_id)

    async def update_product(
        self, product_id: UUID, product_update: ProductUpdate
    ) -> Product | None:
        return await self.repo.update_product(product_id, product_update)

    async def delete_product(self, product_id: UUID) -> bool:
        return await self.repo.delete_product(product_id)

    async def add_media_to_product(
        self, product_id: UUID, file: UploadFile, media_type: str, display_order: int
    ) -> ProductMedia:
        # Define the path to save the file
        upload_dir = "media_uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_location = os.path.join(upload_dir, file.filename)  # type: ignore

        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)

        media_create = ProductMediaCreate(
            media_type=media_type, url=f"/{file_location}", display_order=display_order
        )

        return await self.repo.add_media_to_product(product_id, media_create)

    async def update_media_order(self, product_id: UUID, media_ids: List[UUID]):
        return await self.repo.update_media_order_for_product(product_id, media_ids)
