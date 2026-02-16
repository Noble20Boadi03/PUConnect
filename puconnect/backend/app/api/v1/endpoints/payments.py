from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.payment_service import PaymentService

router = APIRouter()

@router.get("/")
def read_payments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve payments.
    """
    # return PaymentService.get_multi(db, skip=skip, limit=limit)
    return [{"amount": 100.0, "status": "pending"}]
