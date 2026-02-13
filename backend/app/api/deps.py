from app.core import security
from app.core.config import settings
from app.core.database import get_session as _get_session
from app.models.user import User
from app.schemas.token import TokenPayload
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import AsyncGenerator
from uuid import UUID

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async for session in _get_session():
        yield session


async def get_current_user(
        session: AsyncSession = Depends(get_session),
        token: str = Depends(reusable_oauth2),
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_data = TokenPayload(**payload)
        if not token_data.sub:
            raise ValueError("Missing subject")
        user_id = UUID(token_data.sub)
    except (JWTError, ValidationError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    return user
