import logging
from app.core.database import get_session
from app.core.security import get_current_user, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    ChangePasswordRequest,
    ChangePasswordResponse,
    UserListResponse,
)
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
        current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user's profile

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        UserResponse with user details
    """
    return UserResponse.model_validate(current_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
        user_id: str,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
):
    """
    Get user by ID (only if user is authorized or is the same user)

    Args:
        user_id: User ID to fetch
        session: Database session
        current_user: Current authenticated user

    Returns:
        UserResponse with user details
    """
    try:
        # Check authorization - users can only view their own profile or admin can view anyone
        if str(current_user.id) != user_id and current_user.role.value != "SUPER_ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this user",
            )

        # Find user
        statement = select(User).where(User.id == user_id)
        user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return UserResponse.model_validate(user)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user",
        )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
        request: UserUpdate,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
):
    """
    Update current user's profile

    Args:
        request: User update data
        session: Database session
        current_user: Current authenticated user

    Returns:
        Updated UserResponse
    """
    try:
        # Update only provided fields
        if request.first_name is not None:
            current_user.first_name = request.first_name

        if request.last_name is not None:
            current_user.last_name = request.last_name

        if request.phone is not None:
            current_user.phone = request.phone

        if request.timezone is not None:
            current_user.timezone = request.timezone

        if request.job_title is not None:
            current_user.job_title = request.job_title

        if request.department is not None:
            current_user.department = request.department

        if request.avatar_url is not None:
            current_user.avatar_url = request.avatar_url

        # Update timestamp
        current_user.updated_at = datetime.utcnow()

        # Save to database
        session.add(current_user)
        session.commit()
        session.refresh(current_user)

        logger.info(f"User {current_user.id} profile updated")

        return UserResponse.model_validate(current_user)

    except Exception as e:
        logger.error(f"Update user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
        request: ChangePasswordRequest,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
):
    """
    Change user password

    Args:
        request: Current and new password
        session: Database session
        current_user: Current authenticated user

    Returns:
        ChangePasswordResponse
    """
    try:
        # Check if passwords match
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match",
            )

        # Check if new password is different from current
        if request.current_password == request.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password",
            )

        # Validate password strength
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long",
            )

        # Verify current password
        if current_user.hashed_password is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account uses OAuth login. Cannot change password.",
            )

        if not verify_password(request.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )

        # Hash new password
        current_user.hashed_password = get_password_hash(request.new_password)
        current_user.updated_at = datetime.utcnow()

        # Save to database
        session.add(current_user)
        session.commit()

        logger.info(f"User {current_user.id} password changed")

        return ChangePasswordResponse(
            message="Password changed successfully",
            email=current_user.email,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password",
        )


@router.get("", response_model=UserListResponse)
async def list_users(
        skip: int = 0,
        limit: int = 10,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
):
    """
    List all users (admin only)

    Args:
        skip: Number of users to skip
        limit: Number of users to return
        session: Database session
        current_user: Current authenticated user

    Returns:
        UserListResponse with list of users
    """
    try:
        # Check if user is admin
        if current_user.role.value not in ["SUPER_ADMIN", "ADMIN"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can list users",
            )

        # Get total count
        total_statement = select(User)
        total = len(session.exec(total_statement).all())

        # Get paginated users
        statement = select(User).offset(skip).limit(limit)
        users = session.exec(statement).all()

        return UserListResponse(
            total=total,
            users=[UserResponse.model_validate(user) for user in users],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"List users error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users",
        )


@router.delete("/me")
async def delete_account(
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
):
    """
    Delete current user account (soft delete by deactivating)

    Args:
        session: Database session
        current_user: Current authenticated user

    Returns:
        Success message
    """
    try:
        # Soft delete - just deactivate the account
        current_user.is_active = False
        current_user.updated_at = datetime.utcnow()

        session.add(current_user)
        session.commit()

        logger.info(f"User {current_user.id} account deleted")

        return {
            "message": "Account deleted successfully",
            "email": current_user.email,
        }

    except Exception as e:
        logger.error(f"Delete account error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account",
        )
