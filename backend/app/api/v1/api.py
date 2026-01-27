from app.api.v1.endpoints import auth, users
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
