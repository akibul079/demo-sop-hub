import logging
from app.core.database import get_session
from app.schemas.token import GoogleTokenRequest, GoogleLoginResponse
from app.services.oauth_service import OAuthService
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["OAuth"])


@router.post("/google/login", response_model=GoogleLoginResponse)
async def google_login(
        request: GoogleTokenRequest,
        session: Session = Depends(get_session),
):
    """
    Google OAuth Login Endpoint

    Receives Google ID token from frontend and authenticates user

    Args:
        request: GoogleTokenRequest with Google token
        session: Database session

    Returns:
        GoogleLoginResponse with access token and user info
    """
    try:
        # Verify Google token
        user_info = await OAuthService.verify_google_token(request.token)

        # Get or create user
        user, is_new = await OAuthService.get_or_create_user(user_info, session)

        # Create tokens
        tokens = await OAuthService.create_tokens(user, session)

        return GoogleLoginResponse(
            access_token=tokens["access_token"],
            token_type=tokens["token_type"],
            user_id=tokens["user_id"],
            email=tokens["email"],
            first_name=user.first_name,
            last_name=user.last_name,
            is_new_user=is_new,
            avatar_url=user.avatar_url,
        )

    except ValueError as e:
        logger.error(f"Google login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed",
        )


@router.post("/logout")
async def logout(session: Session = Depends(get_session)):
    """
    Logout endpoint

    Currently just a placeholder - actual logout is handled by frontend
    removing the token from localStorage
    """
    return {"message": "Logged out successfully"}
