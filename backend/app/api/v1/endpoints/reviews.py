"""
Review API endpoints.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.review_service import ReviewService


router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    *,
    db: Session = Depends(deps.get_db),
    review_in: ReviewCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create a new review.
    """
    review = ReviewService.create(
        db=db,
        review_in=review_in,
        reviewer_id=current_user.id
    )
    return review


@router.get("/", response_model=List[ReviewResponse])
def read_reviews(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve all reviews with pagination.
    """
    reviews = ReviewService.get_multi(db=db, skip=skip, limit=limit)
    return reviews


@router.get("/listing/{listing_id}", response_model=List[ReviewResponse])
def read_listing_reviews(
    *,
    db: Session = Depends(deps.get_db),
    listing_id: UUID,
    skip: int = 0,
    limit: int = 100,
):
    """
    Get all reviews for a specific listing.
    """
    reviews = ReviewService.get_by_listing(
        db=db,
        listing_id=listing_id,
        skip=skip,
        limit=limit
    )
    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
def read_review(
    *,
    db: Session = Depends(deps.get_db),
    review_id: UUID,
):
    """
    Get a specific review by ID.
    """
    review = ReviewService.get(db=db, review_id=review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    *,
    db: Session = Depends(deps.get_db),
    review_id: UUID,
    review_in: ReviewUpdate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Update a review (only by the reviewer).
    """
    review = ReviewService.get(db=db, review_id=review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this review"
        )
    
    review = ReviewService.update(db=db, db_review=review, review_in=review_in)
    return review


@router.delete("/{review_id}", response_model=ReviewResponse)
def delete_review(
    *,
    db: Session = Depends(deps.get_db),
    review_id: UUID,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Delete a review (only by the reviewer or admin).
    """
    review = ReviewService.get(db=db, review_id=review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Only reviewer or admin can delete
    if review.reviewer_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    review = ReviewService.delete(db=db, review_id=review_id)
    return review
