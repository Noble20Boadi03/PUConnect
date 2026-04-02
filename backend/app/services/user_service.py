from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserUpdate
from app.core import security

class UserService:
    @staticmethod
    def get(db: Session, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_multi(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[User]:
        """Get multiple users, optionally filtered by search term."""
        query = db.query(User).filter(User.is_active == True)
        if search:
            search_term = f"%{search}%"
            # postgres JSON array element match is more complex, but we can search in text form or bio/name
            # simplified approach: match in fullName or bio
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
                    User.bio.ilike(search_term)
                )
            )
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
        """Update user profile."""
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Handle password if it were in UserUpdate (it isn't currently, but for future)
        if "password" in update_data:
            hashed_password = security.get_password_hash(update_data["password"])
            db_obj.hashed_password = hashed_password
            del update_data["password"]

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
