from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class SubcategoryFilterBase(BaseModel):
    subcategory: str
    filter_label: str
    filter_type: str
    filter_options: Optional[Union[List[Any], Dict[str, Any]]] = None
    display_order: int = 0
    is_active: bool = True

class SubcategoryFilterCreate(SubcategoryFilterBase):
    pass

class SubcategoryFilterUpdate(SubcategoryFilterBase):
    subcategory: Optional[str] = None
    filter_label: Optional[str] = None
    filter_type: Optional[str] = None

class SubcategoryFilterInDBBase(SubcategoryFilterBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SubcategoryFilter(SubcategoryFilterInDBBase):
    pass
