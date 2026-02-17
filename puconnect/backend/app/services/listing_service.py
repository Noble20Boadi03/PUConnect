from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.listing import Listing
from app.schemas.listing import ListingCreate, ListingUpdate

class ListingService:
    @staticmethod
    def get(db: Session, id: UUID) -> Optional[Listing]:
        return db.query(Listing).filter(Listing.id == id).first()

    @staticmethod
    def get_multi(db: Session, skip: int = 0, limit: int = 100) -> List[Listing]:
        return db.query(Listing).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, obj_in: ListingCreate, owner_id: UUID) -> Listing:
        db_obj = Listing(
            title=obj_in.title,
            description=obj_in.description,
            price=obj_in.price,
            category=obj_in.category,
            type=obj_in.type,
            is_active=obj_in.is_active,
            owner_id=owner_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(db: Session, *, db_obj: Listing, obj_in: ListingUpdate) -> Listing:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def remove(db: Session, *, id: UUID) -> Listing:
        obj = db.query(Listing).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
