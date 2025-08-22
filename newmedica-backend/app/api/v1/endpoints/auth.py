
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.schemas.user import UserCreate, UserRead
from app.schemas.token import Token
from app.services.user_service import UserService
from app.core.security import create_access_token

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=201)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_session)
):
    user_service = UserService(db)
    
    db_user = await user_service.get_user_by_email(user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        user = await user_service.create_user(user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session)
):
    user_service = UserService(db)
    user = await user_service.authenticate(email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}
