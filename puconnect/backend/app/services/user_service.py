from typing import Optional
from sqlalchemy.orm import Session
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
