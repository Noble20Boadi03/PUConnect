from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class ChatBase(BaseModel):
    message: str

class ChatCreate(ChatBase):
    receiver_id: UUID
    listing_id: UUID

class ChatResponse(ChatBase):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    listing_id: UUID
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
