import uuid
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    MEMBER = "MEMBER"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    DEACTIVATED = "DEACTIVATED"
    SUSPENDED = "SUSPENDED"


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    first_name: str
    last_name: str
    is_active: bool = True
    role: UserRole = Field(default=UserRole.MEMBER)
    status: UserStatus = Field(default=UserStatus.PENDING)
    job_title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    avatar_url: Optional[str] = None
    workspace_id: Optional[uuid.UUID] = Field(default=None, foreign_key="workspaces.id")
    manager_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")


class User(UserBase, table=True):
    __tablename__ = "users"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: Optional[str] = None  # Optional for OAuth users
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_active_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    login_count: int = Field(default=0)

    # OAuth fields
    email_verified: bool = Field(default=False)
    oauth_provider: Optional[str] = None  # "google", "github", etc.
    google_id: Optional[str] = Field(default=None, unique=True, index=True)

    # Relationships (Optional for now, but good to have placeholders)
    # workspace: Optional[Workspace] = Relationship()
