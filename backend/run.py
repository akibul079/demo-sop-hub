"""
SOP Hub Backend - Startup Script
"""
import os
import sys
from pathlib import Path


def main():
    backend_root = Path(__file__).parent.resolve()
    os.chdir(backend_root)
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))
    os.environ["PYTHONPATH"] = str(backend_root)

    import uvicorn

    print(
        """
╔════════════════════════════════════════════════╗
║ SOP Hub Backend                                ║
║ Running: http://0.0.0.0:8000                   ║
╚════════════════════════════════════════════════╝
"""
    )

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    main()
