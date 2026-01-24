"""
Database initialization script
Run this before starting the backend for the first time
"""

import asyncio
from sqlmodel import SQLModel, create_engine, Session

from app.core.config import settings
from app.core.database import engine
from app.models.folder import Folder
from app.models.sop import SOP
from app.models.user import User
from app.models.workspace import Workspace

# Import all models to ensure they're registered
__all__ = [User, Workspace, Folder, SOP]


def init_db():
    """Initialize database with all tables"""
    print("Creating database tables...")

    # Create all tables
    SQLModel.metadata.create_all(engine)

    print("✅ Database tables created successfully!")
    print(f"Database URL: {settings.DATABASE_URL}")


if __name__ == "__main__":
    init_db()
