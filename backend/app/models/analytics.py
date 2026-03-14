import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base

class SearchQuery(Base):
    __tablename__ = "search_queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Optional, null if anonymous
    query_text = Column(String, index=True, nullable=False)
    extracted_skills = Column(JSONB, nullable=True) # Extracted standard skills
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", backref="search_queries")
