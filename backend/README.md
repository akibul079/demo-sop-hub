# SOP Hub Backend

FastAPI backend for SOP Hub.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

By default, this uses SQLite (`sophub.db`). The database is auto-initialized on startup.
To use PostgreSQL, update `DATABASE_URL` in `.env` or `app/core/config.py`.

## First Login

Since the DB starts empty, you need to create a user first via the API or CLI.
Use `POST /api/v1/users/` to create your first admin/user.
