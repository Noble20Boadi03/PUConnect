from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class ListingType(str, Enum):
    service = "service"
    product = "product"

class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category: str
    type: ListingType
    is_active: bool = True

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    type: Optional[ListingType] = None
    is_active: Optional[bool] = None

class ListingResponse(ListingBase):
    id: UUID
    owner_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
