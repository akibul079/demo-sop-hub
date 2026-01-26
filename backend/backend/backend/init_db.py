"""
Database initialization script - PRODUCTION READY
Run this ONCE before starting the backend

Usage:
    python init_db.py

This script:
1. Creates all database tables
2. Sets up the database schema
3. Prepares the system for backend operation
"""

import logging
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import init_db
from app.core.config import settings


def main():
    """Main initialization function"""
    print("=" * 70)
    print(" " * 15 + "SOP HUB - DATABASE INITIALIZATION")
    print("=" * 70)
    print()

    print(f"📍 Database Type: SQLite (Local Development)")
    print(f"📁 Database File: sophub.db")
    print(f"📁 Project: {settings.PROJECT_NAME}")
    print()

    print("🔄 Initializing database...")
    print("-" * 70)
    print()

    # Initialize database
    success = init_db()

    print()
    print("-" * 70)

    if success:
        print()
        print("=" * 70)
        print(" " * 20 + "✅ SUCCESS!")
        print("=" * 70)
        print()
        print("📝 Database ready with tables:")
        print("   ✓ users")
        print("   ✓ workspaces")
        print("   ✓ folders")
        print("   ✓ sops")
        print()
        print("🚀 Next steps:")
        print("   1. Start the backend server:")
        print("      uvicorn app.main:app --reload")
        print()
        print("   2. Access API documentation:")
        print("      http://localhost:8000/docs")
        print()
        print("=" * 70)
        print()
        return 0
    else:
        print()
        print("=" * 70)
        print(" " * 15 + "❌ DATABASE INITIALIZATION FAILED")
        print("=" * 70)
        print()
        print("⚠️  Troubleshooting:")
        print("   1. Check if port 8000 is available")
        print("   2. Verify Python 3.8+ is installed")
        print("   3. Run: pip install -r requirements.txt")
        print("   4. Check disk space availability")
        print()
        print("💡 For help:")
        print("   Review the error messages above")
        print()
        print("=" * 70)
        print()
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
