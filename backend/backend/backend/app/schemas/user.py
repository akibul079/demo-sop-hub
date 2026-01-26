from app.models.user import UserRole, UserStatus
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    first_name: str
    last_name: str


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str
    new_password: str
    confirm_password: str


class ChangePasswordResponse(BaseModel):
    """Change password response"""
    message: str
    email: str


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    email: str
    first_name: str
    last_name: str
    is_active: bool
    role: UserRole
    status: UserStatus
    phone: Optional[str] = None
    timezone: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    email_verified: bool
    oauth_provider: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """User list response"""
    total: int
    users: list[UserResponse]
