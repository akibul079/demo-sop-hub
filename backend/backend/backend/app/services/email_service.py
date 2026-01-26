import logging
import secrets
import smtplib
import string
from app.core.config import settings
from app.models.user import User
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlmodel import Session, select
from typing import Optional

logger = logging.getLogger(__name__)


class EmailVerificationToken:
    """Handle email verification tokens"""

    @staticmethod
    def generate_token(length: int = 32) -> str:
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    @staticmethod
    def create_verification_link(email: str, token: str) -> str:
        """Create verification link for email"""
        return f"{settings.FRONTEND_URL}/auth/verify-email?email={email}&token={token}"


class EmailService:
    """Service for sending emails"""

    @staticmethod
    async def send_verification_email(
            email: str,
            first_name: str,
            token: str,
            session: Session
    ) -> bool:
        """
        Send verification email to user

        Args:
            email: User email
            first_name: User first name
            token: Verification token
            session: Database session

        Returns:
            bool: True if email sent successfully
        """
        try:
            # Create verification link
            verification_link = EmailVerificationToken.create_verification_link(email, token)

            # Email content
            subject = "Verify Your SOP Hub Email"

            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Welcome to SOP Hub, {first_name}!</h2>
                        
                        <p>Thank you for signing up. Please verify your email address to get started.</p>
                        
                        <div style="margin: 30px 0;">
                            <a href="{verification_link}" 
                               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify Email
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #666;">
                            {verification_link}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This link will expire in 24 hours.<br>
                            If you didn't sign up for SOP Hub, you can ignore this email.
                        </p>
                    </div>
                </body>
            </html>
            """

            # Plain text version
            text_content = f"""
            Welcome to SOP Hub, {first_name}!
            
            Please verify your email address by clicking the link below:
            {verification_link}
            
            This link will expire in 24 hours.
            
            If you didn't sign up for SOP Hub, you can ignore this email.
            """

            # For now, just log it (we'll use a real email service in production)
            logger.info(f"Email verification sent to {email}")
            logger.debug(f"Verification link: {verification_link}")

            # TODO: Implement actual email sending with SendGrid, AWS SES, or SMTP
            # For local testing, emails are logged only

            return True

        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {str(e)}")
            return False

    @staticmethod
    async def send_password_reset_email(
            email: str,
            first_name: str,
            token: str,
            session: Session
    ) -> bool:
        """
        Send password reset email

        Args:
            email: User email
            first_name: User first name
            token: Reset token
            session: Database session

        Returns:
            bool: True if email sent successfully
        """
        try:
            # Create reset link
            reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?email={email}&token={token}"

            subject = "Reset Your SOP Hub Password"

            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Password Reset Request</h2>
                        
                        <p>Hi {first_name},</p>
                        
                        <p>We received a request to reset your password. Click the button below to set a new password:</p>
                        
                        <div style="margin: 30px 0;">
                            <a href="{reset_link}" 
                               style="background-color: #2196F3; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link:</p>
                        <p style="word-break: break-all; color: #666;">
                            {reset_link}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This link will expire in 1 hour.<br>
                            If you didn't request a password reset, please ignore this email.
                        </p>
                    </div>
                </body>
            </html>
            """

            text_content = f"""
            Password Reset Request
            
            Click the link below to reset your password:
            {reset_link}
            
            This link will expire in 1 hour.
            
            If you didn't request this, ignore this email.
            """

            logger.info(f"Password reset email sent to {email}")
            logger.debug(f"Reset link: {reset_link}")

            return True

        except Exception as e:
            logger.error(f"Failed to send password reset email to {email}: {str(e)}")
            return False

    @staticmethod
    async def send_welcome_email(email: str, first_name: str) -> bool:
        """Send welcome email to verified user"""
        try:
            subject = "Welcome to SOP Hub!"

            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2>Welcome to SOP Hub, {first_name}!</h2>
                        
                        <p>Your email has been verified successfully. You're all set to start using SOP Hub.</p>
                        
                        <div style="margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}" 
                               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <p>Happy organizing!</p>
                    </div>
                </body>
            </html>
            """

            logger.info(f"Welcome email sent to {email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            return False
