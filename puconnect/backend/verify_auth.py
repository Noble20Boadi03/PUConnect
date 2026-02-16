import sys
import os
from unittest.mock import MagicMock
from uuid import uuid4

# Mock environment variables for Settings validation
os.environ["DATABASE_URL"] = "postgresql://user:password@localhost/dbname"
os.environ["SECRET_KEY"] = "supersecretkey"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["MTN_MOMO_API_KEY"] = "dummy_api_key"

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from app.services.auth_service import AuthService
    from app.schemas.user import UserCreate, UserRole, TokenResponse
    from app.models.user import User
    from app.core import security # Just to verify import works
    
    # Mock DB Session
    mock_db = MagicMock()
    
    # Test Register User
    print("Testing register_user...")
    user_create = UserCreate(
        email="test@example.com",
        password="password123",
        full_name="Test User",
        university_id="123456",
        role=UserRole.student
    )
    
    # Needs to handle query().filter().first()
    # Mock return value for 'existing_user' check -> None
    mock_db.query.return_value.filter.return_value.first.side_effect = [None, None] 
    
    user = AuthService.register_user(mock_db, user_create)
    print("User registered successfully.")
    
    # Test Authenticate User
    print("Testing authenticate_user...")
    
    # We need a real hashed password for verify_password to work
    hashed = security.get_password_hash("password123")
    mock_user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password=hashed,
        is_active=True
    )
    
    # Reset side_effect for next call
    mock_db.query.return_value.filter.return_value.first.side_effect = None
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    auth_user = AuthService.authenticate_user(mock_db, "test@example.com", "password123")
    if auth_user:
         print(f"User authenticated successfully: {auth_user.email}")
    else:
         print("User authentication failed!")
         sys.exit(1)

    # Test Generate Tokens
    print("Testing generate_tokens...")
    tokens = AuthService.generate_tokens(auth_user)
    # TokenResponse is Pydantic model
    if tokens.access_token:
        print(f"Tokens generated: {tokens.access_token[:10]}...")
    else:
        print("Token generation failed!")
        sys.exit(1)

    print("Verification Passed!")

except Exception as e:
    print(f"Error verification: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
