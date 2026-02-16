from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.listing_service import ListingService

router = APIRouter()

@router.get("/")
def read_listings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve listings.
    """
    # Placeholder for ListingService usage
    # return ListingService.get_multi(db, skip=skip, limit=limit)
    return [{"title": "Placeholder Listing"}]
