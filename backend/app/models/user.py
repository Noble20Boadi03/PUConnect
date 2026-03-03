import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.enums import UserRole, ExperienceLevel


class User(Base):
	__tablename__ = "users"

	id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
	full_name = Column(String, nullable=False)
	email = Column(String, unique=True, index=True, nullable=False)
	hashed_password = Column(String, nullable=False)
	university_id = Column(String, index=True, nullable=False)
	role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
	is_active = Column(Boolean, default=True, nullable=False)
	
	# Profile Setup Fields
	bio = Column(String, nullable=True)
	skill_tags = Column(JSON, nullable=True) # List of strings
	experience_level = Column(Enum(ExperienceLevel), nullable=True)
	portfolio_links = Column(JSON, nullable=True) # List of strings/URLs
	is_available = Column(Boolean, default=True, nullable=False)
	profile_picture_url = Column(String, nullable=True)

	created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
	updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

	# Relationships
	listings = relationship("Listing", back_populates="owner")
	reviews = relationship("Review", back_populates="user")
	payments = relationship("Payment", back_populates="user")
	sent_messages = relationship("Chat", back_populates="sender", foreign_keys='Chat.sender_id')
	received_messages = relationship("Chat", back_populates="receiver", foreign_keys='Chat.receiver_id')

	# Properties
	@property
	def is_admin(self) -> bool:
		"""Check if user has admin role."""
		return self.role == UserRole.admin

