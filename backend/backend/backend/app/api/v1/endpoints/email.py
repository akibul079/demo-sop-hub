import logging
from app.core.database import get_session
from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserStatus
from app.schemas.email import (
    EmailVerificationRequest,
    EmailVerificationResponse,
    ResendVerificationEmailRequest,
    ResendVerificationEmailResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    SetNewPasswordRequest,
    SetNewPasswordResponse,
)
from app.services.email_service import EmailService, EmailVerificationToken
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/email", tags=["email"])

# Simple in-memory token storage (replace with database in production)
# Format: {token: {"email": str, "type": "verify|reset", "expires": datetime}}
verification_tokens = {}


@router.post("/verify", response_model=EmailVerificationResponse)
async def verify_email(
        request: EmailVerificationRequest,
        session: Session = Depends(get_session),
):
    """
    Verify user email with token

    Args:
        request: Email and verification token
        session: Database session

    Returns:
        EmailVerificationResponse with verification status
    """
    try:
        # Check if token exists and is valid
        token_data = verification_tokens.get(request.token)

        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token",
            )

        # Check if token expired
        if datetime.utcnow() > token_data["expires"]:
            del verification_tokens[request.token]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token expired",
            )

        # Check if email matches
        if token_data["email"] != request.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email mismatch",
            )

        # Find user and update verification status
        statement = select(User).where(User.email == request.email)
        user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Mark email as verified
        user.email_verified = True
        user.status = UserStatus.ACTIVE
        session.add(user)
        session.commit()

        # Remove token
        del verification_tokens[request.token]

        # Send welcome email
        await EmailService.send_welcome_email(user.email, user.first_name)

        return EmailVerificationResponse(
            message="Email verified successfully",
            email=request.email,
            verified=True,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Verification failed",
        )


@router.post("/resend-verification", response_model=ResendVerificationEmailResponse)
async def resend_verification_email(
        request: ResendVerificationEmailRequest,
        session: Session = Depends(get_session),
):
    """
    Resend verification email to user

    Args:
        request: User email
        session: Database session

    Returns:
        ResendVerificationEmailResponse
    """
    try:
        # Find user
        statement = select(User).where(User.email == request.email)
        user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Check if already verified
        if user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified",
            )

        # Generate new verification token
        token = EmailVerificationToken.generate_token()
        verification_tokens[token] = {
            "email": request.email,
            "type": "verify",
            "expires": datetime.utcnow() + timedelta(hours=24),
        }

        # Send email
        success = await EmailService.send_verification_email(
            email=request.email,
            first_name=user.first_name,
            token=token,
            session=session,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email",
            )

        return ResendVerificationEmailResponse(
            message="Verification email sent",
            email=request.email,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend verification email error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification email",
        )


@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
        request: PasswordResetRequest,
        session: Session = Depends(get_session),
):
    """
    Request password reset for user email

    Args:
        request: User email
        session: Database session

    Returns:
        PasswordResetResponse
    """
    try:
        # Find user
        statement = select(User).where(User.email == request.email)
        user = session.exec(statement).first()

        if not user:
            # Don't reveal if email exists (security best practice)
            return PasswordResetResponse(
                message="If email exists, password reset link has been sent",
                email=request.email,
            )

        # Generate reset token (valid for 1 hour)
        token = EmailVerificationToken.generate_token()
        verification_tokens[token] = {
            "email": request.email,
            "type": "reset",
            "expires": datetime.utcnow() + timedelta(hours=1),
        }

        # Send reset email
        success = await EmailService.send_password_reset_email(
            email=request.email,
            first_name=user.first_name,
            token=token,
            session=session,
        )

        if not success:
            logger.warning(f"Failed to send password reset email to {request.email}")

        return PasswordResetResponse(
            message="If email exists, password reset link has been sent",
            email=request.email,
        )

    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request",
        )


@router.post("/reset-password", response_model=SetNewPasswordResponse)
async def reset_password(
        request: SetNewPasswordRequest,
        session: Session = Depends(get_session),
):
    """
    Reset user password with token

    Args:
        request: Email, token, and new password
        session: Database session

    Returns:
        SetNewPasswordResponse
    """
    try:
        # Check if token exists and is valid
        token_data = verification_tokens.get(request.token)

        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password reset token",
            )

        # Check token type
        if token_data["type"] != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type",
            )

        # Check if token expired
        if datetime.utcnow() > token_data["expires"]:
            del verification_tokens[request.token]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token expired",
            )

        # Check if email matches
        if token_data["email"] != request.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email mismatch",
            )

        # Find user
        statement = select(User).where(User.email == request.email)
        user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Validate password strength (minimum 8 characters)
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long",
            )

        # Update password
        user.hashed_password = get_password_hash(request.new_password)
        session.add(user)
        session.commit()

        # Remove token
        del verification_tokens[request.token]

        return SetNewPasswordResponse(
            message="Password reset successfully",
            email=request.email,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password",
        )
