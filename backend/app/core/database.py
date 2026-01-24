"""
Database connection and session management
Synchronous for development, async-ready for production
"""

import logging
import os
from app.core.config import settings
from sqlalchemy.pool import StaticPool
from sqlmodel import create_engine, Session, SQLModel

logger = logging.getLogger(__name__)


def get_engine():
    """Create database engine with proper configuration"""

    if "sqlite" in settings.DATABASE_URL or "sqlite" in os.getenv("DATABASE_URL", ""):
        # SQLite for local development - use sync driver
        engine = create_engine(
            "sqlite:///./sophub.db",  # Sync SQLite driver
            echo=False,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,  # Important for SQLite
        )
        logger.info("Using SQLite for local development")
    else:
        # PostgreSQL for production
        engine = create_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_pre_ping=True,
        )
        logger.info("Using PostgreSQL for production")

    return engine


# Create engine instance
engine = get_engine()


def get_session():
    """
    Get database session for dependency injection

    Yields:
        SQLModel Session
    """
    with Session(engine) as session:
        yield session


def init_db():
    """
    Initialize database - create all tables

    This is a SYNCHRONOUS function - safe to call from sync code
    """
    try:
        logger.info("Creating database tables...")

        # Create all tables
        SQLModel.metadata.create_all(engine)

        logger.info("✅ All database tables created successfully")

        # List created tables
        logger.info("Tables created:")
        for table_name in SQLModel.metadata.tables.keys():
            logger.info(f"  ✓ {table_name}")

        return True

    except Exception as e:
        logger.error(f"❌ Database initialization error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
