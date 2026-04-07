from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.subcategory_filter import SubcategoryFilter, SubcategoryFilterCreate
from app.services.subcategory_filter_service import SubcategoryFilterService

router = APIRouter()

@router.get("/{subcategory}", response_model=List[SubcategoryFilter])
def get_filters_by_subcategory(
    subcategory: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve all active filters for a specific subcategory.
    """
    return SubcategoryFilterService.get_filters_by_subcategory(db, subcategory)

@router.post("/", response_model=SubcategoryFilter)
def create_subcategory_filter(
    *,
    db: Session = Depends(deps.get_db),
    filter_in: SubcategoryFilterCreate
) -> Any:
    """
    Create a new dynamic filter configuration for a subcategory.
    """
    return SubcategoryFilterService.create_filter(db, filter_in)
