from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService
from app.api.deps import get_current_user
from typing import List

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

@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(review: ReviewCreate, current_user=Depends(get_current_user)):
    if ReviewService.has_user_reviewed(current_user.id, review.listing_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has already reviewed this listing"
        )
    return ReviewService.create_review(current_user.id, review)

@router.get("/reviews/listing/{listing_id}", response_model=List[ReviewResponse])
def get_reviews_for_listing(listing_id: int):
    reviews, average_rating = ReviewService.get_reviews_and_average_rating(listing_id)
    return {"reviews": reviews, "average_rating": average_rating}

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, current_user=Depends(get_current_user)):
    review = ReviewService.get_review_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )
    ReviewService.delete_review(review_id)
