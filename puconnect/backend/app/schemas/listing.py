"""
Listing schemas for API request/response validation.
All schemas match the Listing model exactly.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import ListingType


class ListingBase(BaseModel):
    """Base listing schema with common fields."""
    title: str
    description: Optional[str] = None
    price: float
    category: str
    type: ListingType
    is_active: bool = True


class ListingCreate(ListingBase):
    """Schema for creating a new listing."""
    pass


class ListingUpdate(BaseModel):
    """Schema for updating a listing."""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    type: Optional[ListingType] = None
    is_active: Optional[bool] = None


class ListingResponse(ListingBase):
    """
    Schema for listing responses.
    Matches Listing model exactly.
    """
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
