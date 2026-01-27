"""
SOP Hub Backend - Startup Script
Clean structure after folder restructure
"""
import os
import sys
from pathlib import Path

# Get backend directory
backend_root = Path(__file__).parent.resolve()
os.chdir(backend_root)
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

os.environ["PYTHONPATH"] = str(backend_root)

if __name__ == "__main__":
    import uvicorn

    print("""
    ╔════════════════════════════════════════════════╗
    ║    SOP Hub Backend - Phase 5 Testing           ║
    ║    Clean Folder Structure ✅                   ║
    ╚════════════════════════════════════════════════╝
    """)

    try:
        # NEW: Import from app (at backend/app/)
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
        )

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nExpected structure: backend/app/main.py")
        sys.exit(1)
