
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
import uuid

class WorkspaceBase(SQLModel):
    name: str = Field(index=True)
    slug: Optional[str] = Field(default=None, unique=True, index=True)
    logo_url: Optional[str] = None
    size: Optional[str] = None

class Workspace(WorkspaceBase, table=True):
    __tablename__ = "workspaces"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
