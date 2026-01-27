"""
Startup script for SOP Hub Backend
Handles all path issues and starts the server correctly
Works with the nested backend/backend structure
"""

import os
import sys
from pathlib import Path

# Get absolute paths
backend_root = Path(__file__).parent.absolute()
backend_app = backend_root / "backend"

print(f"""
╔════════════════════════════════════════════════════════════╗
║         SOP Hub Backend - Starting Server                  ║
║                                                            ║
║  Backend Root: {backend_root}
║  App Directory: {backend_app}
╚════════════════════════════════════════════════════════════╝
""")

# Change working directory to backend root
os.chdir(backend_root)

# Add backend directory to Python path (where 'backend' package is)
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

# Also add parent to path
if str(backend_root.parent) not in sys.path:
    sys.path.insert(0, str(backend_root.parent))

# Print debug info
print(f"Python Path:")
for i, path in enumerate(sys.path[:3]):
    print(f"  {i}: {path}")
print()

# Now run uvicorn
if __name__ == "__main__":
    import uvicorn

    try:
        print("Starting Uvicorn server...")
        print("-" * 60)
        uvicorn.run(
            "backend.app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the 'backend' directory")
        print("2. Check that 'backend/backend/app/main.py' exists")
        print("3. Verify all imports in main.py are correct")
