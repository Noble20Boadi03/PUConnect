"""
Centralized Enum Definitions

This is the SINGLE SOURCE OF TRUTH for all enums in the application.
All models and schemas MUST import from this file.

DO NOT define enums elsewhere - import from here!
"""

import enum


class UserRole(str, enum.Enum):
    """
    User role enumeration.
    
    Values:
        student: Regular student user
        admin: Administrator with elevated privileges
    """
    student = "student"
    admin = "admin"


class ListingType(str, enum.Enum):
    """
    Listing type enumeration.
    
    Values:
        service: Service offering (e.g., tutoring, delivery)
        product: Physical product for sale
    """
    service = "service"
    product = "product"


class PaymentStatus(str, enum.Enum):
    """
    Payment transaction status enumeration.
    
    Values:
        pending: Payment initiated but not yet confirmed
        successful: Payment completed successfully
        failed: Payment failed or was rejected
    """
    pending = "pending"
    successful = "successful"
    failed = "failed"
