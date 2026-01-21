
from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid
from app.models.user import UserRole, UserStatus

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.MEMBER
    status: UserStatus = UserStatus.PENDING
    is_active: bool = True
    job_title: Optional[str] = None

class UserCreate(UserBase):
    password: str
    workspace_id: Optional[uuid.UUID] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserRead(UserBase):
    id: uuid.UUID
    workspace_id: Optional[uuid.UUID]
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True
