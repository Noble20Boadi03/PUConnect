from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class PaymentStatus(str, Enum):
    pending = "pending"
    successful = "successful"
    failed = "failed"

class PaymentBase(BaseModel):
    amount: float
    status: PaymentStatus = PaymentStatus.pending
    transaction_reference: str

class PaymentCreate(PaymentBase):
    listing_id: UUID

class PaymentResponse(PaymentBase):
    id: UUID
    user_id: UUID
    listing_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
