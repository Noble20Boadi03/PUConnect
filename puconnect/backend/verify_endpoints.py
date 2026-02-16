import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

# Mock environment variables
os.environ["DATABASE_URL"] = "postgresql://user:password@localhost/dbname"
os.environ["SECRET_KEY"] = "supersecretkey"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["MTN_MOMO_API_KEY"] = "dummy_api_key"

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from app.main import app
    from app.api import deps
    from app.services.auth_service import AuthService
    from app.models.user import User
    from app.schemas.user import UserResponse, TokenResponse
    from app.core import security
    from uuid import uuid4

    client = TestClient(app)

    # Mock Dependency get_db
    def override_get_db():
        try:
            db = MagicMock()
            yield db
        finally:
            pass
    
    app.dependency_overrides[deps.get_db] = override_get_db

    # Test Register
    # We need to mock AuthService.register_user
    original_register = AuthService.register_user
    AuthService.register_user = MagicMock(return_value=User(
        id=uuid4(),
        email="new@example.com",
        full_name="New User",
        university_id="999",
        role="student",
        is_active=True
    ))

    response = client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "password": "password",
        "full_name": "New User",
        "university_id": "999"
    })
    
    print(f"Register Response: {response.status_code}")
    if response.status_code == 200:
        print("Register passed.")
    else:
        print(f"Register failed: {response.text}")

    # Test Login
    # Mock AuthService.authenticate_user and generate_tokens
    original_auth = AuthService.authenticate_user
    original_gen = AuthService.generate_tokens
    
    mock_user = User(id=uuid4(), email="test@example.com")
    AuthService.authenticate_user = MagicMock(return_value=mock_user)
    AuthService.generate_tokens = MagicMock(return_value=TokenResponse(
        access_token="fake_access_token",
        refresh_token="fake_refresh_token",
        token_type="bearer"
    ))

    response = client.post("/api/v1/auth/login", data={
        "username": "test@example.com",
        "password": "password"
    })
    
    print(f"Login Response: {response.status_code}")
    if response.status_code == 200:
        print("Login passed.")
    else:
        print(f"Login failed: {response.text}")

    # Test Me
    # We need to override get_current_user dependency or mock decode_token
    # Overriding dependency is cleaner for TestClient
    def override_get_current_user():
        return mock_user
    
    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    
    response = client.get("/api/v1/auth/me")
    print(f"Me Response: {response.status_code}")
    if response.status_code == 200:
        print("Me passed.")
    else:
        print(f"Me failed: {response.text}")

    # Restore mocks (optional if script ends)
    AuthService.register_user = original_register
    AuthService.authenticate_user = original_auth
    AuthService.generate_tokens = original_gen

except Exception as e:
    print(f"Error verification: {e}")
    import traceback
    traceback.print_exc()
    # sys.exit(1) # Don't exit to allow seeing partial results
