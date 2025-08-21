
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import UserService

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=201)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_session)
):
    user_service = UserService(db)
    # Check if user type exists
    user_type = await user_service.get_user_type_by_name(user_in.userType)
    if not user_type:
        raise HTTPException(status_code=400, detail=f"User type '{user_in.userType}' not found.")

    # Check if user already exists
    db_user = await user_service.get_user_by_email(user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = await user_service.create_user(user_in, user_type.id)
    return user
