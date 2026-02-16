import sys
import os
import datetime
from uuid import uuid4

# Add the current directory to sys.path so we can import 'app'
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, UserRole
    # Mocking a db object
    class MockUser:
        def __init__(self):
            self.id = uuid4()
            self.email = "test@example.com"
            self.full_name = "Test User"
            self.university_id = "123456"
            self.role = UserRole.student
            self.is_active = True
            self.created_at = datetime.datetime.now()
            self.hashed_password = "hashed_secret" # Should be excluded

    user_obj = MockUser()
    user_response = UserResponse.from_orm(user_obj)
    
    print("UserResponse created successfully.")
    print(f"ID: {user_response.id}")
    print(f"Email: {user_response.email}")
    
    if hasattr(user_response, 'hashed_password'):
        print("ERROR: hashed_password exists in response!")
        sys.exit(1)
    else:
        print("hashed_password correctly excluded.")

    if hasattr(user_response, 'role'):
        print(f"Role included: {user_response.role}")
    else:
         print("ERROR: role missing!")
         sys.exit(1)

    print("Verification Passed!")

except Exception as e:
    print(f"Error verification: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
