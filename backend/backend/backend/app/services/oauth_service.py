import logging
from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User, UserStatus
from datetime import datetime, timedelta
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlmodel import Session, select
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class OAuthService:
    """Service for handling OAuth operations"""

    @staticmethod
    async def verify_google_token(token: str) -> Dict[str, Any]:
        """
        Verify Google OAuth token and return user info

        Args:
            token: Google ID token from frontend

        Returns:
            Dictionary with user info (email, name, picture, google_id)
        """
        try:
            # Verify the token signature and expiration
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # Verify the token is for our app
            if idinfo["aud"] != settings.GOOGLE_CLIENT_ID:
                raise ValueError("Token audience mismatch")

            return {
                "google_id": idinfo["sub"],
                "email": idinfo.get("email"),
                "first_name": idinfo.get("given_name", ""),
                "last_name": idinfo.get("family_name", ""),
                "picture": idinfo.get("picture"),
                "email_verified": idinfo.get("email_verified", False),
            }

        except Exception as e:
            logger.error(f"Google token verification failed: {str(e)}")
            raise ValueError(f"Invalid token: {str(e)}")

    @staticmethod
    async def get_or_create_user(
            user_info: Dict[str, Any], session: Session
    ) -> tuple[User, bool]:
        """
        Get existing user or create new one from Google OAuth info

        Args:
            user_info: User info from verify_google_token
            session: Database session

        Returns:
            Tuple of (User object, is_new_user: bool)
        """
        # Check if user exists by google_id
        statement = select(User).where(User.google_id == user_info["google_id"])
        existing_user = session.exec(statement).first()

        if existing_user:
            # Update last login
            existing_user.last_login = datetime.utcnow()
            existing_user.email_verified = user_info.get("email_verified", False)
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
            return existing_user, False

        # Check if email already exists (migration case)
        statement = select(User).where(User.email == user_info["email"])
        user_by_email = session.exec(statement).first()

        if user_by_email:
            # Link Google account to existing email
            user_by_email.google_id = user_info["google_id"]
            user_by_email.oauth_provider = "google"
            user_by_email.email_verified = user_info.get("email_verified", False)
            user_by_email.last_login = datetime.utcnow()
            session.add(user_by_email)
            session.commit()
            session.refresh(user_by_email)
            return user_by_email, False

        # Create new user
        new_user = User(
            email=user_info["email"],
            first_name=user_info.get("first_name", ""),
            last_name=user_info.get("last_name", ""),
            google_id=user_info["google_id"],
            oauth_provider="google",
            email_verified=user_info.get("email_verified", False),
            hashed_password=None,  # OAuth users don't have passwords
            status=UserStatus.ACTIVE,
            is_active=True,
            last_login=datetime.utcnow(),
            avatar_url=user_info.get("picture"),
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return new_user, True

    @staticmethod
    async def create_tokens(user: User, session: Session = None) -> Dict[str, str]:
        """
        Create access and refresh tokens for user

        Args:
            user: User object
            session: Database session (optional)

        Returns:
            Dictionary with access_token and token_type
        """
        access_token_expires = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user.id),
            "email": user.email,
        }
