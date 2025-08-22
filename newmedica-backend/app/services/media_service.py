from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID
import os

from app.repositories.media_repository import MediaRepository

class MediaService:
    def __init__(self, db_session: AsyncSession):
        self.repo = MediaRepository(db_session)

    async def delete_media(self, media_id: UUID):
        media = await self.repo.get_media_by_id(media_id)
        if media:
            # Attempt to delete the file from storage
            try:
                # The URL starts with a /, so we strip it
                file_path = media.url.lstrip('/')
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                # Log this error, but don't block the DB operation
                print(f"Error deleting file {media.url}: {e}")
            
            await self.repo.delete_media(media)
