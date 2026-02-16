import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from uuid import uuid4

# Mock environment variables
os.environ["DATABASE_URL"] = "postgresql://user:password@localhost/dbname"
os.environ["SECRET_KEY"] = "supersecretkey"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["MTN_MOMO_API_KEY"] = "dummy_api_key"

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from app.main import app
    from app.api import deps
    from app.services.listing_service import ListingService
    from app.models.listing import Listing
    from app.models.user import User

    client = TestClient(app)

    # Mock Dependency get_db
    def override_get_db():
        try:
            db = MagicMock()
            yield db
        finally:
            pass
    
    app.dependency_overrides[deps.get_db] = override_get_db

    # Mock get_current_user
    mock_user_id = uuid4()
    mock_user = User(id=mock_user_id, email="test@example.com")
    def override_get_current_user():
        return mock_user
    
    app.dependency_overrides[deps.get_current_user] = override_get_current_user

    # Test Create Listing
    original_create = ListingService.create
    mock_listing_id = uuid4()
    mock_listing = Listing(
        id=mock_listing_id,
        title="Test Listing",
        price=10.0,
        category="Test",
        type="product",
        owner_id=mock_user_id,
        is_active=True
    )
    ListingService.create = MagicMock(return_value=mock_listing)

    response = client.post("/api/v1/listings/", json={
        "title": "Test Listing",
        "price": 10.0,
        "category": "Test",
        "type": "product"
    })
    
    print(f"Create Listing Response: {response.status_code}")
    if response.status_code == 200:
        print("Create Listing passed.")
    else:
        print(f"Create Listing failed: {response.text}")

    # Test Get Listings
    original_get_multi = ListingService.get_multi
    ListingService.get_multi = MagicMock(return_value=[mock_listing])
    
    response = client.get("/api/v1/listings/")
    print(f"Get Listings Response: {response.status_code}")
    if response.status_code == 200 and len(response.json()) > 0:
        print("Get Listings passed.")
    else:
        print(f"Get Listings failed: {response.text}")

    # Restore mocks
    ListingService.create = original_create
    ListingService.get_multi = original_get_multi

except Exception as e:
    print(f"Error verification: {e}")
    import traceback
    traceback.print_exc()
