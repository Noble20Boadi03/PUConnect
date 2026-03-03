"""
User schemas for API request/response validation.
All schemas match the User model exactly.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.enums import UserRole, ExperienceLevel


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., alias="fullName")
    university_id: str = Field(..., alias="universityId")
    role: UserRole = UserRole.student
    is_active: bool = True

    # Profile Setup Fields
    bio: Optional[str] = None
    skill_tags: Optional[List[str]] = Field(default=None, alias="skillTags")
    experience_level: Optional[ExperienceLevel] = Field(default=None, alias="experienceLevel")
    portfolio_links: Optional[List[str]] = Field(default=None, alias="portfolioLinks")
    is_available: bool = Field(default=True, alias="isAvailable")
    profile_picture_url: Optional[str] = Field(default=None, alias="profilePictureUrl")

    model_config = ConfigDict(populate_by_name=True)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, max_length=72)


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(default=None, alias="fullName")
    university_id: Optional[str] = Field(default=None, alias="universityId")
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

    # New profile fields
    bio: Optional[str] = None
    skill_tags: Optional[List[str]] = Field(default=None, alias="skillTags")
    experience_level: Optional[ExperienceLevel] = Field(default=None, alias="experienceLevel")
    portfolio_links: Optional[List[str]] = Field(default=None, alias="portfolioLinks")
    is_available: Optional[bool] = Field(default=None, alias="isAvailable")
    profile_picture_url: Optional[str] = Field(default=None, alias="profilePictureUrl")

    model_config = ConfigDict(populate_by_name=True)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """
    Schema for user responses.
    Matches User model exactly (excluding hashed_password).
    """
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str
