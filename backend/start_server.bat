@echo off
echo ╔════════════════════════════════════════════════╗
echo ║    SOP Hub Backend - Starting Server           ║
echo ╚════════════════════════════════════════════════╝
echo.

cd /d "%~dp0backend"
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

pause
