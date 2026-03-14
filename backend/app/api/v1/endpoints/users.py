from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter()

from app.models.analytics import SearchQuery

@router.get("/talent", response_model=List[UserResponse])
def get_talent(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get top collaborators / talent.
    """
    if search:
        # Log the search query for telemetry / skill gap analysis
        try:
            search_query = SearchQuery(
                user_id=current_user.id,
                query_text=search
            )
            db.add(search_query)
            db.commit()
        except Exception:
            db.rollback()

    users = UserService.get_multi(db, skip=skip, limit=limit, search=search)
    return users

@router.get("/profile", response_model=UserResponse)
def read_user_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.patch("/profile", response_model=UserResponse)
def update_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update current user profile.
    """
    user = UserService.update(db, db_obj=current_user, obj_in=user_in)
    return user
