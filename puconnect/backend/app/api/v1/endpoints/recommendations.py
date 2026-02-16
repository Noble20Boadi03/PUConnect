from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.recommendation_service import RecommendationService

router = APIRouter()

@router.get("/")
def read_recommendations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve recommendations.
    """
    # return RecommendationService.get_recommendations(db, skip=skip, limit=limit)
    return [{"recommendation": "Item 1"}]
