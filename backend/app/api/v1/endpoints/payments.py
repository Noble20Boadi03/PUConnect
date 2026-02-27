from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.schemas.payment import PaymentInitiate, TransactionHistoryItem
from app.services.payment_service import PaymentService
from app.api import deps
from app.api.deps import get_current_user
from typing import Dict, List
import logging

router = APIRouter()
logger = logging.getLogger("payments")

@router.get("/history", response_model=List[TransactionHistoryItem])
def read_payment_history(
    db: Session = Depends(deps.get_db),
    current_user=Depends(get_current_user)
):
    """
    Retrieve payment history for the current user.
    """
    return PaymentService.get_user_transactions(db, current_user.id)

@router.post("/initiate", status_code=status.HTTP_201_CREATED)
def initiate_payment(payment: PaymentInitiate, current_user=Depends(get_current_user)):
    try:
        return PaymentService.initiate_payment(current_user.id, payment)
    except Exception as e:
        logger.error(f"Payment initiation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate payment"
        )

@router.get("/verify/{reference}", status_code=status.HTTP_200_OK)
def verify_payment(reference: str, current_user=Depends(get_current_user)):
    try:
        return PaymentService.verify_payment(reference)
    except Exception as e:
        logger.error(f"Payment verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify payment"
        )

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def payment_webhook(request: Request):
    try:
        payload = await request.json()
        reference = payload.get("reference")
        if not reference:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing transaction reference"
            )
        return PaymentService.handle_webhook(reference, payload)
    except Exception as e:
        logger.error(f"Webhook handling failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process webhook"
        )
