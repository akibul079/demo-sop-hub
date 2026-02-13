from app.api import deps
from app.core import security
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Any

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
        *,
        session: AsyncSession = Depends(deps.get_session),
        user_in: UserCreate,
) -> Any:
    result = await session.execute(select(User).where(User.email == user_in.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    db_user = User(
        email=user_in.email,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role=user_in.role,
        status=user_in.status,
        is_active=user_in.is_active,
        job_title=user_in.job_title,
        workspace_id=user_in.workspace_id,
        hashed_password=security.get_password_hash(user_in.password),
    )

    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    return db_user


@router.get("/me", response_model=UserRead)
async def read_user_me(
        current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user
