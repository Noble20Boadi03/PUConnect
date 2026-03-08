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
        service_offer: Offering a service
        service_request: Requesting a service
        project_team: Recruiting for a project/team
    """
    service_offer = "service_offer"
    service_request = "service_request"
    project_team = "project_team"


class CategoryType(str, enum.Enum):
    """
    Marketplace category enumeration.
    Synced with mobile/constants/categories.ts
    """
    programming  = "programming"
    design       = "design"
    writing      = "writing"
    tutoring     = "tutoring"
    marketing    = "marketing"
    media        = "media"
    audio        = "audio"
    data_ai      = "data_ai"
    business     = "business"
    engineering  = "engineering"
    tech_support = "tech_support"
    events       = "events"
    translation  = "translation"
    research     = "research"


class ExperienceLevel(str, enum.Enum):
    """
    Experience level enumeration for user profiles.
    
    Values:
        beginner: Just starting out
        intermediate: Some experience
        expert: Highly skilled
    """
    beginner = "beginner"
    intermediate = "intermediate"
    expert = "expert"


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
