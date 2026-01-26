"""
Security and authentication module
Handles JWT tokens, password hashing, and user authentication
Production-ready implementation
"""

import logging
from app.core.config import settings
from app.core.database import get_session
from app.models.user import User
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status, Header
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlmodel import Session, select
from typing import Any, Union, Optional

logger = logging.getLogger(__name__)

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


# ==================== PASSWORD FUNCTIONS ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against hashed password

    Args:
        plain_password: Plain text password from user
        hashed_password: Hashed password from database

    Returns:
        bool: True if password matches
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a plain text password using bcrypt

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


# ==================== TOKEN FUNCTIONS ====================

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token

    Args:
        subject: Subject to encode (usually user_id)
        expires_delta: Custom expiration time delta

    Returns:
        Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Decode and verify JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"Token decode error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ==================== DEPENDENCY FUNCTIONS ====================

def get_token_from_header(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract bearer token from Authorization header

    This is a dependency that extracts the token from the Authorization header.

    Args:
        authorization: Authorization header value (automatically injected by FastAPI)

    Returns:
        Token string

    Raises:
        HTTPException: If token is missing or invalid format
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Parse "Bearer <token>"
    parts = authorization.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Use: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return parts[1]


async def get_current_user(
        token: str = Depends(get_token_from_header),
        session: Session = Depends(get_session),
) -> User:
    """
    Get current authenticated user from JWT token

    This dependency:
    1. Extracts the token from Authorization header
    2. Decodes and verifies the JWT token
    3. Fetches the user from the database
    4. Verifies the user is active
    5. Updates last_active_at timestamp

    Args:
        token: JWT token from Authorization header
        session: Database session

    Returns:
        User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        # Decode token
        payload = decode_token(token)
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Find user in database
        statement = select(User).where(User.id == user_id)
        user = session.exec(statement).first()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last active time
        user.last_active_at = datetime.utcnow()
        session.add(user)
        session.commit()
        session.refresh(user)

        logger.info(f"User {user.id} authenticated successfully")
        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
