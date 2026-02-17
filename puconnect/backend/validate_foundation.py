#!/usr/bin/env python3
"""
Foundation Validation Script
Tests for:
- Circular imports
- Missing imports
- Duplicate definitions
- Schema existence
- Service method availability
"""

import sys
import traceback
from typing import List, Tuple

def test_import(module_path: str, description: str) -> Tuple[bool, str]:
    """Test if a module can be imported successfully."""
    try:
        __import__(module_path)
        return True, f"✅ {description}"
    except ImportError as e:
        return False, f"❌ {description}: ImportError - {str(e)}"
    except AttributeError as e:
        return False, f"❌ {description}: AttributeError - {str(e)}"
    except Exception as e:
        return False, f"❌ {description}: {type(e).__name__} - {str(e)}"

def validate_foundation():
    """Run all foundation validation tests."""
    print("=" * 80)
    print("🔍 BACKEND FOUNDATION VALIDATION")
    print("=" * 80)
    print()
    
    results: List[Tuple[bool, str]] = []
    
    # Test 1: Core modules
    print("📦 Testing Core Modules...")
    results.append(test_import("app.core.config", "Core Config"))
    results.append(test_import("app.core.security", "Core Security"))
    results.append(test_import("app.core.settings", "Core Settings"))
    print()
    
    # Test 2: Database layer
    print("💾 Testing Database Layer...")
    results.append(test_import("app.db.session", "Database Session"))
    results.append(test_import("app.db.base", "Database Base"))
    print()
    
    # Test 3: Models (check for circular imports)
    print("📋 Testing Models (Circular Import Check)...")
    results.append(test_import("app.models.user", "User Model"))
    results.append(test_import("app.models.listing", "Listing Model"))
    results.append(test_import("app.models.review", "Review Model"))
    results.append(test_import("app.models.payment", "Payment Model"))
    results.append(test_import("app.models.chat", "Chat Model"))
    print()
    
    # Test 4: Schemas
    print("📝 Testing Schemas...")
    results.append(test_import("app.schemas.user", "User Schema"))
    results.append(test_import("app.schemas.listing", "Listing Schema"))
    results.append(test_import("app.schemas.review", "Review Schema"))
    results.append(test_import("app.schemas.payment", "Payment Schema"))
    results.append(test_import("app.schemas.chat", "Chat Schema"))
    print()
    
    # Test 5: Services
    print("⚙️  Testing Services...")
    results.append(test_import("app.services.auth_service", "Auth Service"))
    results.append(test_import("app.services.listing_service", "Listing Service"))
    results.append(test_import("app.services.review_service", "Review Service"))
    results.append(test_import("app.services.payment_service", "Payment Service"))
    results.append(test_import("app.services.recommendation_service", "Recommendation Service"))
    results.append(test_import("app.services.chat_service", "Chat Service"))
    print()
    
    # Test 6: API Dependencies
    print("🔗 Testing API Dependencies...")
    results.append(test_import("app.api.deps", "API Dependencies"))
    print()
    
    # Test 7: API Endpoints
    print("🌐 Testing API Endpoints...")
    results.append(test_import("app.api.v1.endpoints.auth", "Auth Endpoints"))
    results.append(test_import("app.api.v1.endpoints.listings", "Listings Endpoints"))
    results.append(test_import("app.api.v1.endpoints.reviews", "Reviews Endpoints"))
    results.append(test_import("app.api.v1.endpoints.payments", "Payments Endpoints"))
    results.append(test_import("app.api.v1.endpoints.recommendations", "Recommendations Endpoints"))
    print()
    
    # Test 8: API Router
    print("🔀 Testing API Router...")
    results.append(test_import("app.api.v1.router", "API Router"))
    print()
    
    # Test 9: Main Application
    print("🚀 Testing Main Application...")
    results.append(test_import("app.main", "FastAPI Main App"))
    print()
    
    # Test 10: Check for specific schemas
    print("🔍 Testing Specific Schema Existence...")
    try:
        from app.schemas.payment import PaymentInitiate
        results.append((True, "✅ PaymentInitiate schema exists"))
    except ImportError:
        results.append((False, "❌ PaymentInitiate schema missing"))
    print()
    
    # Test 11: Check for service methods
    print("🔍 Testing Service Methods...")
    try:
        from app.services.payment_service import PaymentService
        assert hasattr(PaymentService, 'initiate_payment'), "Missing initiate_payment method"
        assert hasattr(PaymentService, 'verify_payment'), "Missing verify_payment method"
        assert hasattr(PaymentService, 'handle_webhook'), "Missing handle_webhook method"
        results.append((True, "✅ PaymentService has all required methods"))
    except (ImportError, AssertionError) as e:
        results.append((False, f"❌ PaymentService methods: {str(e)}"))
    
    try:
        from app.services.recommendation_service import RecommendationService
        assert hasattr(RecommendationService, 'get_recommendations_for_user'), "Missing get_recommendations_for_user method"
        results.append((True, "✅ RecommendationService has required methods"))
    except (ImportError, AssertionError) as e:
        results.append((False, f"❌ RecommendationService methods: {str(e)}"))
    print()
    
    # Test 12: Check for duplicate functions in deps
    print("🔍 Testing for Duplicate Definitions...")
    try:
        from app.api import deps
        import inspect
        
        # Get all functions in deps module
        functions = [name for name, obj in inspect.getmembers(deps) if inspect.isfunction(obj)]
        duplicates = [name for name in functions if functions.count(name) > 1]
        
        if duplicates:
            results.append((False, f"❌ Duplicate functions found in deps: {duplicates}"))
        else:
            results.append((True, "✅ No duplicate functions in deps"))
    except Exception as e:
        results.append((False, f"❌ Error checking duplicates: {str(e)}"))
    print()
    
    # Print Summary
    print("=" * 80)
    print("📊 VALIDATION SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for success, _ in results if success)
    failed = sum(1 for success, _ in results if not success)
    total = len(results)
    
    for success, message in results:
        print(message)
    
    print()
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print()
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED! Foundation is solid.")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED! Review errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(validate_foundation())
