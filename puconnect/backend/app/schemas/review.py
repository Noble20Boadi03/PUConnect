"""
Review schemas for API request/response validation.
All schemas match the Review model exactly.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ReviewBase(BaseModel):
    """Base review schema with common fields."""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    """Schema for creating a new review."""
    listing_id: UUID


class ReviewUpdate(BaseModel):
    """Schema for updating a review."""
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    """
    Schema for review responses.
    Matches Review model exactly.
    """
    id: UUID
    reviewer_id: UUID
    listing_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
