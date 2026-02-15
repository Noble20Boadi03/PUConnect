from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.config import get_settings

# Get the database URL from settings
DATABASE_URL = get_settings().DATABASE_URL

# Create the SQLAlchemy engine (PostgreSQL compatible)
engine = create_engine(
	DATABASE_URL,
	pool_pre_ping=True
)

# Create a configured "SessionLocal" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for getting DB session
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
