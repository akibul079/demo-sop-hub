
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field
from sqlalchemy import JSON, Column
import uuid

class SOPStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"

class DifficultyLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class SOPBase(SQLModel):
    title: str = Field(index=True)
    short_description: Optional[str] = None
    content: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    step_count: int = 0
    status: SOPStatus = Field(default=SOPStatus.DRAFT, index=True)
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.BEGINNER)
    version: int = 1
    estimated_time: Optional[int] = None
    cover_image_url: Optional[str] = None
    
    workspace_id: Optional[uuid.UUID] = Field(default=None, foreign_key="workspaces.id")
    created_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    
    rejection_reason: Optional[str] = None
    active_approval_request_id: Optional[uuid.UUID] = None # Handling circular dep manually or ignoring FK for now

class SOP(SOPBase, table=True):
    __tablename__ = "sops"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    
    deleted_at: Optional[datetime] = None
    deleted_by_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    delete_reason: Optional[str] = None
    permanent_delete_at: Optional[datetime] = None
    
    pdf_status: Optional[str] = None
    pdf_url: Optional[str] = None
