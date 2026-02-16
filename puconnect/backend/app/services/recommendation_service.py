from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.listing import Listing
from app.models.user import User
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class RecommendationService:

    @staticmethod
    def get_user_viewed_listings(user_id: UUID, db: Session) -> List[Listing]:
        """
        Fetch listings previously viewed by the user.
        """
        return db.query(Listing).join(User.viewed_listings).filter(User.id == user_id).all()

    @staticmethod
    def recommend_listings(user_id: UUID, db: Session) -> List[Listing]:
        """
        Recommend listings based on category similarity and price range.
        """
        viewed_listings = RecommendationService.get_user_viewed_listings(user_id, db)

        if not viewed_listings:
            return []

        # Extract features from viewed listings
        viewed_features = np.array([
            [listing.category_id, listing.price] for listing in viewed_listings
        ])

        # Fetch all listings from the database
        all_listings = db.query(Listing).all()

        # Extract features from all listings
        all_features = np.array([
            [listing.category_id, listing.price] for listing in all_listings
        ])

        # Compute cosine similarity
        similarities = cosine_similarity(viewed_features, all_features)

        # Aggregate similarity scores for each listing
        similarity_scores = np.sum(similarities, axis=0)

        # Sort listings by similarity scores
        recommended_indices = np.argsort(similarity_scores)[::-1]
        recommended_listings = [all_listings[i] for i in recommended_indices]

        return recommended_listings
