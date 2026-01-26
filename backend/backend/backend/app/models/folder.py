
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
import uuid

class FolderBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    color: Optional[str] = "#808080"
    is_open: bool = False
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="folders.id")
    workspace_id: Optional[uuid.UUID] = Field(default=None, foreign_key="workspaces.id")

class Folder(FolderBase, table=True):
    __tablename__ = "folders"
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
