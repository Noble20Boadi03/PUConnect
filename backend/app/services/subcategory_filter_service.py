from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.subcategory_filter import SubcategoryFilter
from app.schemas.subcategory_filter import SubcategoryFilterCreate, SubcategoryFilterUpdate

class SubcategoryFilterService:
    @staticmethod
    def get_filters_by_subcategory(db: Session, subcategory: str) -> List[SubcategoryFilter]:
        return db.query(SubcategoryFilter).filter(
            SubcategoryFilter.subcategory == subcategory,
            SubcategoryFilter.is_active == True
        ).order_by(SubcategoryFilter.display_order.asc()).all()

    @staticmethod
    def create_filter(db: Session, obj_in: SubcategoryFilterCreate) -> SubcategoryFilter:
        db_obj = SubcategoryFilter(
            subcategory=obj_in.subcategory,
            filter_label=obj_in.filter_label,
            filter_type=obj_in.filter_type,
            filter_options=obj_in.filter_options,
            display_order=obj_in.display_order,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete_filter(db: Session, filter_id: UUID) -> Optional[SubcategoryFilter]:
        db_obj = db.query(SubcategoryFilter).filter(SubcategoryFilter.id == filter_id).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj
