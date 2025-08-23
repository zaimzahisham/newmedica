from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List, Optional
from uuid import UUID

from app.models.product import Product
from app.models.product_media import ProductMedia
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.media import ProductMediaCreate
from app.models.category import Category
from sqlalchemy.orm import selectinload

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_product(self, product: ProductCreate) -> Product:
        db_product = Product.model_validate(product)
        self.session.add(db_product)
        await self.session.commit()
        await self.session.refresh(db_product)
        return db_product

    async def get_all_products(
        self,
        category_name: Optional[str] = None,
        search_term: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "asc"
    ) -> List[Product]:
        query = select(Product).options(selectinload(Product.category), selectinload(Product.media))

        if category_name:
            search_name = category_name.replace('-', ' ')
            query = query.join(Product.category).where(Category.name.ilike(f"%{search_name}%"))
        
        if search_term:
            query = query.where(Product.name.ilike(f"%{search_term}%"))

        if sort_by:
            sort_map = {
                "alphabetical": "name",
                "price": "price",
                "date": "updated_at"
            }
            
            sort_field_key, *sort_direction_parts = sort_by.split('-')
            sort_field = sort_map.get(sort_field_key)
            
            if sort_field:
                column = getattr(Product, sort_field, None)
                if column:
                    direction = "desc" if "desc" in sort_direction_parts else "asc"
                    
                    # Special handling for date sorting direction from frontend
                    if sort_field_key == 'date':
                        direction = "desc" if "new-to-old" in sort_by else "asc"

                    if direction == "desc":
                        query = query.order_by(column.desc())
                    else:
                        query = query.order_by(column.asc())

        result = await self.session.execute(query)
        return result.scalars().unique().all()

    async def get_product_by_id(self, product_id: UUID) -> Product | None:
        result = await self.session.execute(
            select(Product)
            .where(Product.id == product_id)
            .options(selectinload(Product.category), selectinload(Product.media))
        )
        return result.scalar_one_or_none()

    async def update_product(self, product_id: UUID, product_update: ProductUpdate) -> Product | None:
        db_product = await self.get_product_by_id(product_id)
        if not db_product:
            return None
        
        update_data = product_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
            
        self.session.add(db_product)
        await self.session.commit()
        await self.session.refresh(db_product)
        return db_product

    async def delete_product(self, product_id: UUID) -> bool:
        db_product = await self.get_product_by_id(product_id)
        if not db_product:
            return False
        
        await self.session.delete(db_product)
        await self.session.commit()
        return True

    async def add_media_to_product(self, product_id: UUID, media: ProductMediaCreate) -> ProductMedia:
        db_media = ProductMedia.model_validate(media, update={"product_id": product_id})
        self.session.add(db_media)
        await self.session.commit()
        await self.session.refresh(db_media)
        return db_media

    async def update_media_order_for_product(self, product_id: UUID, media_ids: List[UUID]):
        for index, media_id in enumerate(media_ids):
            media_item = await self.session.get(ProductMedia, media_id)
            if media_item and media_item.product_id == product_id:
                media_item.display_order = index
                self.session.add(media_item)
        await self.session.commit()
