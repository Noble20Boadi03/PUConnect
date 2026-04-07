import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from app.db.session import Base

class SubcategoryFilter(Base):
    __tablename__ = "subcategory_filters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subcategory = Column(String, index=True, nullable=False)
    filter_label = Column(String, nullable=False)
    filter_type = Column(String, nullable=False) # e.g., 'dropdown', 'multi_select', 'range', 'radio'
    filter_options = Column(JSON, nullable=True) # e.g., ['100L', '200L', '300L'] or bounds for range
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
