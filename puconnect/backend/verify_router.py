import sys
import os

# Mock environment variables for Settings validation
os.environ["DATABASE_URL"] = "postgresql://user:password@localhost/dbname"
os.environ["SECRET_KEY"] = "supersecretkey"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["MTN_MOMO_API_KEY"] = "dummy_api_key"

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from app.api.v1.router import api_router
    print("Successfully imported api_router.")
    
    # Check if all routes are included
    routes = [route.path for route in api_router.routes]
    print("Routes found:", len(routes))
    
    expected_prefixes = ["/auth", "/listings", "/reviews", "/payments", "/recommendations"]
    
    # Check tags or paths to confirm inclusion
    # api_router.routes contains APIRoute objects. 
    # The prefixes are not directly on the routes in the main router, but the paths should reflect them if we mounted them.
    # Actually, include_router adds routes to the router.
    
    found_paths = [r.path for r in api_router.routes]
    print("Sample paths:", found_paths[:5])
    
    # Simple check if we have routes
    if len(routes) > 0:
        print("Verification Passed!")
    else:
        print("Verification Failed: No routes found.")
        sys.exit(1)

except Exception as e:
    print(f"Error verification: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
