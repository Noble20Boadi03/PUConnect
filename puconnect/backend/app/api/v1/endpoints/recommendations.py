from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.listing import ListingResponse
from app.services.recommendation_service import RecommendationService
from app.api.deps import get_current_user
from typing import List

router = APIRouter()

# Dependency for role-based authorization
def is_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

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

@router.get("/recommendations", response_model=List[ListingResponse])
def get_personal_recommendations(skip: int = 0, limit: int = 10, current_user=Depends(get_current_user)):
    return RecommendationService.get_recommendations_for_user(current_user.id, skip=skip, limit=limit)

@router.get("/recommendations/{user_id}", response_model=List[ListingResponse])
def get_user_recommendations(user_id: int, skip: int = 0, limit: int = 10, admin=Depends(is_admin)):
    return RecommendationService.get_recommendations_for_user(user_id, skip=skip, limit=limit)
