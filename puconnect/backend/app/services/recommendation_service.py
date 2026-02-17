from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.listing import Listing
from app.models.user import User


class RecommendationService:
    """
    Service for generating personalized listing recommendations.
    Currently uses a simple category-based recommendation system.
    TODO: Integrate with ML service for more sophisticated recommendations.
    """

    @staticmethod
    def get_recommendations_for_user(
        user_id: UUID, 
        db: Session = None,
        skip: int = 0, 
        limit: int = 10
    ) -> List[Listing]:
        """
        Get personalized recommendations for a user.
        
        Args:
            user_id: The user ID to get recommendations for
            db: Database session (optional, for future use)
            skip: Number of records to skip (pagination)
            limit: Maximum number of recommendations to return
            
        Returns:
            List of recommended Listing objects
        """
        # TODO: Implement actual recommendation logic
        # For now, return empty list or random listings
        # This prevents AttributeError while allowing the endpoint to work
        
        if db:
            # Return active listings, excluding user's own listings
            recommendations = (
                db.query(Listing)
                .filter(Listing.is_active == True)
                .filter(Listing.owner_id != user_id)
                .order_by(Listing.created_at.desc())
                .offset(skip)
                .limit(limit)
                .all()
            )
            return recommendations
        
        return []

    @staticmethod
    def get_user_viewed_listings(user_id: UUID, db: Session) -> List[Listing]:
        """
        Fetch listings previously viewed by the user.
        TODO: Implement view tracking in the database
        """
        # TODO: Add a view tracking table to store user-listing interactions
        return []

    @staticmethod
    def recommend_listings(user_id: UUID, db: Session) -> List[Listing]:
        """
        Recommend listings based on user preferences.
        This is a placeholder for future ML-based recommendations.
        """
        # Use the main recommendation method
        return RecommendationService.get_recommendations_for_user(
            user_id=user_id,
            db=db,
            skip=0,
            limit=10
        )
