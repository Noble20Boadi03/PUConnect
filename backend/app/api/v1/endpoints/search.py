from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Any

from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/")
def semantic_search(query: str, db: Session = Depends(deps.get_db)) -> Any:
    """
    Search for students using basic text search.
    Example: /search?query=startup
    """
    if not query.strip():
        return []

    search_term = f"%{query.strip()}%"
    
    # Fetch all active student profiles that match the query
    students = db.query(User).filter(
        User.is_active == True,
        or_(
            User.full_name.ilike(search_term),
            User.bio.ilike(search_term)
        )
    ).limit(10).all()
    
    results = []
    
    for student in students:
        # Determine how to display the picture safely
        pic_url = student.profile_picture_url
        if pic_url and pic_url.startswith('/'):
            # This logic usually happens in frontend but exposing full pic isn't bad
            pass
            
        results.append({
            "id": str(student.id),
            "fullName": student.full_name,
            "skillTags": student.skill_tags or [],
            "bio": student.bio or "",
            "role": student.role.value if student.role else "student",
            "profilePictureUrl": pic_url,
            "similarityScore": 1.0 
        })
    
    return results
