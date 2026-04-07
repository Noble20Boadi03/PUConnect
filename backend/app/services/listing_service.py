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
    def get_multi(
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        tag: Optional[str] = None,
        level: Optional[str] = None,
        department: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: str = "rating"
    ) -> List[Listing]:
        query = db.query(Listing).filter(Listing.is_active == True)
        
        if category:
            query = query.filter(Listing.category == category)
        if subcategory:
            query = query.filter(Listing.subcategory == subcategory)
        if level:
            query = query.filter(Listing.level == level)
        if department:
            query = query.filter(Listing.department == department)
        if min_price:
            query = query.filter(Listing.price >= min_price)
        if max_price:
            query = query.filter(Listing.price <= max_price)
        if tag:
            # PostgreSQL specific JSON containment check
            from sqlalchemy import text
            query = query.filter(text("tags @> :tag")).params(tag=f'["{tag}"]')

        if sort_by == "rating":
            query = query.order_by(Listing.average_rating.desc())
        elif sort_by == "price":
            query = query.order_by(Listing.price.asc())
        else:
            query = query.order_by(Listing.created_at.desc())

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, obj_in: ListingCreate, owner_id: UUID) -> Listing:
        db_obj = Listing(
            **obj_in.model_dump(),
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
