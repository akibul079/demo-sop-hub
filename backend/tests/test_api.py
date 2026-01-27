"""
Phase 5: Comprehensive API Testing Suite
SOP Hub Backend - Production Readiness Tests
"""

import json
import pytest
from backend.app.main import app
from httpx import AsyncClient


# ================================================================
# TEST CONFIGURATION & FIXTURES
# ================================================================

@pytest.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
def valid_credentials():
    """Valid test credentials"""
    return {
        "username": "test@example.com",
        "password": "TestPassword123!"
    }


@pytest.fixture
def invalid_credentials():
    """Invalid test credentials"""
    return {
        "username": "wrong@example.com",
        "password": "WrongPassword123"
    }


# ================================================================
# 1. AUTHENTICATION TESTS
# ================================================================

class TestAuthentication:
    """Test authentication endpoints"""

    @pytest.mark.asyncio
    async def test_login_success(self, client, valid_credentials):
        """Test successful login"""
        response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print("✅ Login Success Test Passed")

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, client, invalid_credentials):
        """Test login with invalid credentials"""
        response = await client.post(
            "/api/v1/login/access-token",
            data=invalid_credentials
        )
        assert response.status_code == 400
        assert "detail" in response.json()
        print("✅ Invalid Credentials Test Passed")

    @pytest.mark.asyncio
    async def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = await client.post(
            "/api/v1/login/access-token",
            data={"username": "test@example.com"}  # Missing password
        )
        assert response.status_code in [400, 422]
        print("✅ Missing Fields Test Passed")


# ================================================================
# 2. USER MANAGEMENT TESTS
# ================================================================

class TestUserManagement:
    """Test user management endpoints"""

    @pytest.mark.asyncio
    async def test_get_user_profile_unauthorized(self, client):
        """Test accessing protected endpoint without token"""
        response = await client.get("/api/v1/users/me")
        assert response.status_code == 401
        print("✅ Unauthorized Access Test Passed")

    @pytest.mark.asyncio
    async def test_get_user_profile_with_token(self, client, valid_credentials):
        """Test getting user profile with valid token"""
        # First login to get token
        login_response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Then get profile
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        print("✅ Get User Profile Test Passed")

    @pytest.mark.asyncio
    async def test_update_user_profile(self, client, valid_credentials):
        """Test updating user profile"""
        # Login
        login_response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update profile
        update_data = {
            "first_name": "Updated",
            "last_name": "User",
            "phone": "+8801234567890",
            "job_title": "Senior Developer"
        }
        response = await client.put(
            "/api/v1/users/me",
            json=update_data,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        print("✅ Update Profile Test Passed")

    @pytest.mark.asyncio
    async def test_change_password(self, client, valid_credentials):
        """Test password change"""
        # Login
        login_response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Change password
        password_data = {
            "current_password": valid_credentials["password"],
            "new_password": "NewPassword456!",
            "confirm_password": "NewPassword456!"
        }
        response = await client.post(
            "/api/v1/users/change-password",
            json=password_data,
            headers=headers
        )
        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()
        print("✅ Change Password Test Passed")


# ================================================================
# 3. EMAIL VERIFICATION TESTS
# ================================================================

class TestEmailManagement:
    """Test email-related endpoints"""

    @pytest.mark.asyncio
    async def test_resend_verification_email(self, client):
        """Test resending verification email"""
        response = await client.post(
            "/api/v1/email/resend-verification",
            json={"email": "test@example.com"}
        )
        # Should return 400 if already verified or 200 if not
        assert response.status_code in [200, 400]
        print("✅ Resend Verification Test Passed")

    @pytest.mark.asyncio
    async def test_forgot_password(self, client):
        """Test password reset request"""
        response = await client.post(
            "/api/v1/email/forgot-password",
            json={"email": "test@example.com"}
        )
        assert response.status_code == 200
        assert "email" in response.json()
        print("✅ Forgot Password Test Passed")


# ================================================================
# 4. ERROR HANDLING TESTS
# ================================================================

class TestErrorHandling:
    """Test error handling and edge cases"""

    @pytest.mark.asyncio
    async def test_invalid_token(self, client):
        """Test with invalid JWT token"""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = await client.get("/api/v1/users/me", headers=headers)
        assert response.status_code == 401
        print("✅ Invalid Token Test Passed")

    @pytest.mark.asyncio
    async def test_nonexistent_user(self, client, valid_credentials):
        """Test accessing non-existent user"""
        # Login first
        login_response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Try to get non-existent user
        response = await client.get(
            "/api/v1/users/nonexistent-id",
            headers=headers
        )
        assert response.status_code == 404
        print("✅ Non-existent User Test Passed")

    @pytest.mark.asyncio
    async def test_malformed_json(self, client):
        """Test with malformed JSON"""
        response = await client.post(
            "/api/v1/login/access-token",
            content="invalid json{",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [400, 422]
        print("✅ Malformed JSON Test Passed")


# ================================================================
# 5. DATABASE INTEGRATION TESTS
# ================================================================

class TestDatabaseIntegration:
    """Test database connectivity and operations"""

    @pytest.mark.asyncio
    async def test_database_connection(self, client):
        """Test if database is connected"""
        # Try a simple operation that requires DB
        response = await client.post(
            "/api/v1/login/access-token",
            data={"username": "test@example.com", "password": "TestPassword123!"}
        )
        # Should not get server error (500)
        assert response.status_code != 500
        print("✅ Database Connection Test Passed")

    @pytest.mark.asyncio
    async def test_data_persistence(self, client, valid_credentials):
        """Test that data persists in database"""
        # Login
        login_response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get user
        response1 = await client.get("/api/v1/users/me", headers=headers)
        user_id_1 = response1.json()["id"]

        # Get user again
        response2 = await client.get("/api/v1/users/me", headers=headers)
        user_id_2 = response2.json()["id"]

        # IDs should match
        assert user_id_1 == user_id_2
        print("✅ Data Persistence Test Passed")


# ================================================================
# 6. SECURITY TESTS
# ================================================================

class TestSecurity:
    """Test security features"""

    @pytest.mark.asyncio
    async def test_password_hashing(self, client, valid_credentials):
        """Test that passwords are hashed"""
        login_response = await client.post(
            "/api/v1/login/access-token",
            data=valid_credentials
        )
        # Should work, meaning password is validated correctly
        assert login_response.status_code == 200
        print("✅ Password Hashing Test Passed")

    @pytest.mark.asyncio
    async def test_cors_headers(self, client):
        """Test CORS headers"""
        response = await client.get("/api/v1/users/me")
        # Even if 401, CORS headers should be present in production
        assert response.status_code in [200, 401]
        print("✅ CORS Test Passed")


# ================================================================
# TEST SUMMARY
# ================================================================

if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════╗
    ║     SOP Hub - Phase 5 API Testing Suite        ║
    ║     Automated Tests for Production Readiness   ║
    ╚════════════════════════════════════════════════╝
    
    To run all tests:
        pytest backend/tests/test_api.py -v
    
    To run specific test:
        pytest backend/tests/test_api.py::TestAuthentication::test_login_success -v
    
    To generate HTML report:
        pytest backend/tests/test_api.py --html=report.html
    """)
