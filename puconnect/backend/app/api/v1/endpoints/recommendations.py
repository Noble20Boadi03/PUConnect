from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.listing import ListingResponse
from app.services.recommendation_service import RecommendationService
from app.api import deps
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

@router.get("/", response_model=List[ListingResponse])
def get_personal_recommendations(
    skip: int = 0, 
    limit: int = 10, 
    current_user=Depends(get_current_user),
    db: Session = Depends(deps.get_db)
):
    return RecommendationService.get_recommendations_for_user(
        user_id=current_user.id, 
        db=db,
        skip=skip, 
        limit=limit
    )

@router.get("/{user_id}", response_model=List[ListingResponse])
def get_user_recommendations(
    user_id: int, 
    skip: int = 0, 
    limit: int = 10, 
    admin=Depends(is_admin),
    db: Session = Depends(deps.get_db)
):
    return RecommendationService.get_recommendations_for_user(
        user_id=user_id,
        db=db, 
        skip=skip, 
        limit=limit
    )
