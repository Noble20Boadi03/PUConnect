from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    listing_id: UUID

class ReviewResponse(ReviewBase):
    id: UUID
    reviewer_id: UUID
    listing_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
