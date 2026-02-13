from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Any

router = APIRouter()


@router.post("/access-token", response_model=Token)
async def login_access_token(
        session: AsyncSession = Depends(deps.get_session),
        form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    # OAuth2PasswordRequestForm uses `username` field; we treat it as email.
    result = await session.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(str(user.id), expires_delta=access_token_expires),
        token_type="bearer",
    )
