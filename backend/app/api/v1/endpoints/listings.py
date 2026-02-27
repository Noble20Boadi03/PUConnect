from typing import List, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from app.models.user import User
from app.services.listing_service import ListingService

router = APIRouter()

@router.post("/", response_model=ListingResponse)
def create_listing(
    *,
    db: Session = Depends(deps.get_db),
    listing_in: ListingCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new listing.
    """
    listing = ListingService.create(db=db, obj_in=listing_in, owner_id=current_user.id)
    return listing

@router.get("/", response_model=List[ListingResponse])
def read_listings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve listings.
    """
    listings = ListingService.get_multi(db, skip=skip, limit=limit)
    return listings

@router.get("/{id}", response_model=ListingResponse)
def read_listing(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
) -> Any:
    """
    Get listing by ID.
    """
    listing = ListingService.get(db=db, id=id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.put("/{id}", response_model=ListingResponse)
def update_listing(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    listing_in: ListingUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a listing.
    """
    listing = ListingService.get(db=db, id=id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    listing = ListingService.update(db=db, db_obj=listing, obj_in=listing_in)
    return listing

@router.delete("/{id}", response_model=ListingResponse)
def delete_listing(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a listing.
    """
    listing = ListingService.get(db=db, id=id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    listing = ListingService.remove(db=db, id=id)
    return listing
