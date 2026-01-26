from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str
    user_id: str
    email: str


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # user_id


class GoogleTokenRequest(BaseModel):
    """Google OAuth token request"""
    token: str  # Google ID token from frontend


class GoogleLoginResponse(BaseModel):
    """Google login response"""
    access_token: str
    token_type: str
    user_id: str
    email: str
    first_name: str
    last_name: str
    is_new_user: bool
    avatar_url: Optional[str] = None
