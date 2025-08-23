from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.v1.dependencies import get_current_admin_user
from app.db.session import get_session
from app.models.user import User
from app.services.media_service import MediaService

router = APIRouter()


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: UUID,
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user),
):
    service = MediaService(db)
    await service.delete_media(media_id)
    return
