"""
Chat schemas for API request/response validation.
All schemas match the Chat model exactly.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ChatBase(BaseModel):
    """Base chat schema with common fields."""
    message: str


class ChatCreate(ChatBase):
    """Schema for creating a new chat message."""
    receiver_id: UUID
    listing_id: UUID


class ChatUpdate(BaseModel):
    """Schema for updating chat message (mainly for marking as read)."""
    is_read: Optional[bool] = None


class ChatResponse(ChatBase):
    """
    Schema for chat message responses.
    Matches Chat model exactly.
    """
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    listing_id: UUID
    is_read: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
