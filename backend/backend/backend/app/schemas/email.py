from pydantic import BaseModel, EmailStr


class EmailVerificationRequest(BaseModel):
    """Request to verify email with token"""
    email: EmailStr
    token: str


class EmailVerificationResponse(BaseModel):
    """Response after email verification"""
    message: str
    email: str
    verified: bool


class ResendVerificationEmailRequest(BaseModel):
    """Request to resend verification email"""
    email: EmailStr


class ResendVerificationEmailResponse(BaseModel):
    """Response for resend verification email"""
    message: str
    email: str


class PasswordResetRequest(BaseModel):
    """Request to reset password"""
    email: EmailStr


class PasswordResetResponse(BaseModel):
    """Response for password reset request"""
    message: str
    email: str


class SetNewPasswordRequest(BaseModel):
    """Request to set new password with token"""
    email: EmailStr
    token: str
    new_password: str


class SetNewPasswordResponse(BaseModel):
    """Response after setting new password"""
    message: str
    email: str
