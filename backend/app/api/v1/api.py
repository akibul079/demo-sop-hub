from app.api.v1.endpoints import auth, users, oauth
from fastapi import APIRouter

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/login", tags=["login"])
api_router.include_router(oauth.router, prefix="/auth", tags=["oauth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
