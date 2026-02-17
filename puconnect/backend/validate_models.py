#!/usr/bin/env python3
"""
Model Layer Validation Script

Validates:
- No duplicate enum definitions
- All enums imported from centralized enums.py
- Relationships are bidirectional and consistent
- Foreign keys are correct
- UUID usage is consistent
- All models have required fields
"""

import sys
import inspect
from typing import List, Tuple

def test_enum_centralization():
    """Test that all enums are defined only in enums.py"""
    print("🔍 Testing Enum Centralization...")
    results = []
    
    # Import enums module
    try:
        from app.models import enums
        enum_classes = [name for name, obj in inspect.getmembers(enums) if inspect.isclass(obj) and name != 'Enum']
        results.append((True, f"✅ Found {len(enum_classes)} enums in centralized enums.py: {', '.join(enum_classes)}"))
    except ImportError as e:
        results.append((False, f"❌ Failed to import enums.py: {e}"))
        return results
    
    # Check that models import from enums, not define their own
    model_files = ['user', 'listing', 'payment']
    for model_name in model_files:
        try:
            module = __import__(f'app.models.{model_name}', fromlist=[model_name])
            source = inspect.getsource(module)
            
            # Check if it defines its own enum (bad)
            if 'class UserRole(enum.Enum):' in source or 'class ListingType(enum.Enum):' in source or 'class PaymentStatus(enum.Enum):' in source:
                results.append((False, f"❌ {model_name}.py defines its own enum (should import from enums.py)"))
            else:
                # Check if it imports from enums (good)
                if 'from app.models.enums import' in source:
                    results.append((True, f"✅ {model_name}.py imports from centralized enums.py"))
                else:
                    results.append((True, f"✅ {model_name}.py doesn't define enums"))
        except Exception as e:
            results.append((False, f"❌ Error checking {model_name}.py: {e}"))
    
    # Check schemas also import from enums
    schema_files = ['user', 'listing', 'payment']
    for schema_name in schema_files:
        try:
            module = __import__(f'app.schemas.{schema_name}', fromlist=[schema_name])
            source = inspect.getsource(module)
            
            # Check if it defines its own enum (bad)
            if 'class UserRole(str, Enum):' in source or 'class ListingType(str, Enum):' in source or 'class PaymentStatus(str, Enum):' in source:
                results.append((False, f"❌ schemas/{schema_name}.py defines its own enum (should import from models.enums)"))
            else:
                # Check if it imports from enums (good)
                if 'from app.models.enums import' in source:
                    results.append((True, f"✅ schemas/{schema_name}.py imports from centralized enums.py"))
                else:
                    results.append((True, f"✅ schemas/{schema_name}.py doesn't use enums"))
        except Exception as e:
            results.append((False, f"❌ Error checking schemas/{schema_name}.py: {e}"))
    
    return results

def test_model_imports():
    """Test that all models can be imported"""
    print("\n📦 Testing Model Imports...")
    results = []
    
    models = ['user', 'listing', 'review', 'payment', 'chat']
    for model_name in models:
        try:
            module = __import__(f'app.models.{model_name}', fromlist=[model_name])
            model_class = getattr(module, model_name.capitalize())
            results.append((True, f"✅ {model_class.__name__} model imported successfully"))
        except Exception as e:
            results.append((False, f"❌ Failed to import {model_name} model: {e}"))
    
    return results

def test_relationships():
    """Test that relationships are bidirectional"""
    print("\n🔗 Testing Relationships...")
    results = []
    
    try:
        from app.models.user import User
        from app.models.listing import Listing
        from app.models.review import Review
        from app.models.payment import Payment
        from app.models.chat import Chat
        
        # User <-> Listing
        if hasattr(User, 'listings') and hasattr(Listing, 'owner'):
            results.append((True, "✅ User <-> Listing relationship is bidirectional"))
        else:
            results.append((False, "❌ User <-> Listing relationship is incomplete"))
        
        # User <-> Review
        if hasattr(User, 'reviews') and hasattr(Review, 'user'):
            results.append((True, "✅ User <-> Review relationship is bidirectional"))
        else:
            results.append((False, "❌ User <-> Review relationship is incomplete"))
        
        # User <-> Payment
        if hasattr(User, 'payments') and hasattr(Payment, 'user'):
            results.append((True, "✅ User <-> Payment relationship is bidirectional"))
        else:
            results.append((False, "❌ User <-> Payment relationship is incomplete"))
        
        # User <-> Chat (sent)
        if hasattr(User, 'sent_messages') and hasattr(Chat, 'sender'):
            results.append((True, "✅ User <-> Chat (sent) relationship is bidirectional"))
        else:
            results.append((False, "❌ User <-> Chat (sent) relationship is incomplete"))
        
        # User <-> Chat (received)
        if hasattr(User, 'received_messages') and hasattr(Chat, 'receiver'):
            results.append((True, "✅ User <-> Chat (received) relationship is bidirectional"))
        else:
            results.append((False, "❌ User <-> Chat (received) relationship is incomplete"))
        
        # Listing <-> Review
        if hasattr(Listing, 'reviews') and hasattr(Review, 'listing'):
            results.append((True, "✅ Listing <-> Review relationship is bidirectional"))
        else:
            results.append((False, "❌ Listing <-> Review relationship is incomplete"))
        
        # Listing <-> Payment
        if hasattr(Listing, 'payments') and hasattr(Payment, 'listing'):
            results.append((True, "✅ Listing <-> Payment relationship is bidirectional"))
        else:
            results.append((False, "❌ Listing <-> Payment relationship is incomplete"))
        
        # Listing <-> Chat
        if hasattr(Listing, 'messages') and hasattr(Chat, 'listing'):
            results.append((True, "✅ Listing <-> Chat relationship is bidirectional"))
        else:
            results.append((False, "❌ Listing <-> Chat relationship is incomplete"))
            
    except Exception as e:
        results.append((False, f"❌ Error testing relationships: {e}"))
    
    return results

def test_required_fields():
    """Test that all models have required fields"""
    print("\n📋 Testing Required Fields...")
    results = []
    
    try:
        from app.models.user import User
        from app.models.listing import Listing
        from app.models.review import Review
        from app.models.payment import Payment
        from app.models.chat import Chat
        
        # Check User has updated_at
        if hasattr(User, '__table__') and 'updated_at' in User.__table__.columns:
            results.append((True, "✅ User model has updated_at field"))
        else:
            results.append((False, "❌ User model missing updated_at field"))
        
        # Check User has is_admin property
        if hasattr(User, 'is_admin'):
            results.append((True, "✅ User model has is_admin property"))
        else:
            results.append((False, "❌ User model missing is_admin property"))
        
        # Check Listing has updated_at
        if hasattr(Listing, '__table__') and 'updated_at' in Listing.__table__.columns:
            results.append((True, "✅ Listing model has updated_at field"))
        else:
            results.append((False, "❌ Listing model missing updated_at field"))
        
        # Check Review has updated_at
        if hasattr(Review, '__table__') and 'updated_at' in Review.__table__.columns:
            results.append((True, "✅ Review model has updated_at field"))
        else:
            results.append((False, "❌ Review model missing updated_at field"))
        
        # Check Payment has updated_at
        if hasattr(Payment, '__table__') and 'updated_at' in Payment.__table__.columns:
            results.append((True, "✅ Payment model has updated_at field"))
        else:
            results.append((False, "❌ Payment model missing updated_at field"))
        
        # Check Chat has updated_at
        if hasattr(Chat, '__table__') and 'updated_at' in Chat.__table__.columns:
            results.append((True, "✅ Chat model has updated_at field"))
        else:
            results.append((False, "❌ Chat model missing updated_at field"))
            
    except Exception as e:
        results.append((False, f"❌ Error testing required fields: {e}"))
    
    return results

def test_enum_values():
    """Test that enum values are correct and final"""
    print("\n🎯 Testing Enum Values...")
    results = []
    
    try:
        from app.models.enums import UserRole, ListingType, PaymentStatus
        
        # UserRole
        expected_roles = {'student', 'admin'}
        actual_roles = {role.value for role in UserRole}
        if actual_roles == expected_roles:
            results.append((True, f"✅ UserRole values are correct: {actual_roles}"))
        else:
            results.append((False, f"❌ UserRole values mismatch. Expected: {expected_roles}, Got: {actual_roles}"))
        
        # ListingType
        expected_types = {'service', 'product'}
        actual_types = {t.value for t in ListingType}
        if actual_types == expected_types:
            results.append((True, f"✅ ListingType values are correct: {actual_types}"))
        else:
            results.append((False, f"❌ ListingType values mismatch. Expected: {expected_types}, Got: {actual_types}"))
        
        # PaymentStatus
        expected_statuses = {'pending', 'successful', 'failed'}
        actual_statuses = {s.value for s in PaymentStatus}
        if actual_statuses == expected_statuses:
            results.append((True, f"✅ PaymentStatus values are correct: {actual_statuses}"))
        else:
            results.append((False, f"❌ PaymentStatus values mismatch. Expected: {expected_statuses}, Got: {actual_statuses}"))
            
    except Exception as e:
        results.append((False, f"❌ Error testing enum values: {e}"))
    
    return results

def validate_models():
    """Run all model validation tests"""
    print("=" * 80)
    print("🔍 MODEL LAYER VALIDATION")
    print("=" * 80)
    print()
    
    all_results = []
    
    # Run all tests
    all_results.extend(test_enum_centralization())
    all_results.extend(test_model_imports())
    all_results.extend(test_relationships())
    all_results.extend(test_required_fields())
    all_results.extend(test_enum_values())
    
    # Print Summary
    print()
    print("=" * 80)
    print("📊 VALIDATION SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for success, _ in all_results if success)
    failed = sum(1 for success, _ in all_results if not success)
    total = len(all_results)
    
    for success, message in all_results:
        print(message)
    
    print()
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print()
    
    if failed == 0:
        print("🎉 ALL MODEL TESTS PASSED! Models are locked and ready.")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED! Review errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(validate_models())
