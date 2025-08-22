from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

from app.models.product_media import ProductMedia

class MediaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_media_by_id(self, media_id: UUID) -> ProductMedia | None:
        return await self.session.get(ProductMedia, media_id)

    async def delete_media(self, media: ProductMedia):
        await self.session.delete(media)
        await self.session.commit()
