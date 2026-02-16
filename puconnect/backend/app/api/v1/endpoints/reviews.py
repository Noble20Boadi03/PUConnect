from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.review_service import ReviewService

router = APIRouter()

@router.get("/")
def read_reviews(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve reviews.
    """
    # return ReviewService.get_multi(db, skip=skip, limit=limit)
    return [{"comment": "Placeholder Review"}]
