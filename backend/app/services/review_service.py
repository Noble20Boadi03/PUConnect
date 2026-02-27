"""
Review Service

Handles business logic for review operations.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


class ReviewService:
    """Service for managing reviews."""
    
    @staticmethod
    def create(
        db: Session,
        review_in: ReviewCreate,
        reviewer_id: UUID
    ) -> Review:
        """
        Create a new review.
        
        Args:
            db: Database session
            review_in: Review creation data
            reviewer_id: ID of the user creating the review
            
        Returns:
            Created Review object
        """
        # TODO: Check if user already reviewed this listing
        # TODO: Check if listing exists
        # TODO: Check if user is not reviewing their own listing
        
        db_review = Review(
            rating=review_in.rating,
            comment=review_in.comment,
            reviewer_id=reviewer_id,
            listing_id=review_in.listing_id
        )
        
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review
    
    @staticmethod
    def get(db: Session, review_id: UUID) -> Optional[Review]:
        """Get a review by ID."""
        return db.query(Review).filter(Review.id == review_id).first()
    
    @staticmethod
    def get_multi(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Review]:
        """Get multiple reviews with pagination."""
        return db.query(Review).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_listing(
        db: Session,
        listing_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Review]:
        """Get all reviews for a specific listing."""
        return (
            db.query(Review)
            .filter(Review.listing_id == listing_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def get_by_reviewer(
        db: Session,
        reviewer_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Review]:
        """Get all reviews by a specific user."""
        return (
            db.query(Review)
            .filter(Review.reviewer_id == reviewer_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def update(
        db: Session,
        db_review: Review,
        review_in: ReviewUpdate
    ) -> Review:
        """
        Update a review.
        
        Args:
            db: Database session
            db_review: Existing review object
            review_in: Update data
            
        Returns:
            Updated Review object
        """
        update_data = review_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_review, field, value)
        
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review
    
    @staticmethod
    def delete(db: Session, review_id: UUID) -> Optional[Review]:
        """Delete a review."""
        review = db.query(Review).filter(Review.id == review_id).first()
        if review:
            db.delete(review)
            db.commit()
        return review
    
    @staticmethod
    def get_average_rating(db: Session, listing_id: UUID) -> Optional[float]:
        """Get average rating for a listing."""
        from sqlalchemy import func
        
        result = (
            db.query(func.avg(Review.rating))
            .filter(Review.listing_id == listing_id)
            .scalar()
        )
        
        return float(result) if result else None
