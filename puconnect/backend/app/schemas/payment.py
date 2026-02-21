"""
Payment schemas for API request/response validation.
All schemas match the Payment model exactly.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import PaymentStatus


class PaymentBase(BaseModel):
    """Base payment schema with common fields."""
    amount: float = Field(..., gt=0, description="Payment amount (must be positive)")
    status: PaymentStatus = PaymentStatus.pending
    transaction_reference: str


class PaymentCreate(PaymentBase):
    """Schema for creating a payment record."""
    listing_id: UUID


class PaymentInitiate(BaseModel):
    """
    Schema for initiating a payment (client request).
    Only requires listing_id and amount.
    """
    listing_id: UUID
    amount: float = Field(..., gt=0, description="Payment amount (must be positive)")


class PaymentUpdate(BaseModel):
    """Schema for updating payment status."""
    status: Optional[PaymentStatus] = None
    transaction_reference: Optional[str] = None


class PaymentResponse(PaymentBase):
    """
    Schema for payment responses.
    Matches Payment model exactly.
    """
    id: UUID
    user_id: UUID
    listing_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TransactionHistoryItem(BaseModel):
    """Schema for individual transaction history items."""
    id: str
    amount: float
    status: PaymentStatus
    transaction_reference: str
    created_at: datetime
    listing_title: str
    listing_type: str
    transaction_type: str # 'buy', 'sell', or 'service'
    other_party_name: str

    model_config = ConfigDict(from_attributes=True)
