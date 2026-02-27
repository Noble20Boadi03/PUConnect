from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from jose import JWTError
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserCreate, TokenResponse
from app.core import security

class AuthService:
    @staticmethod
    def register_user(db: Session, user_create: UserCreate) -> User:
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_create.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

            # Create new user
            hashed_password = security.get_password_hash(user_create.password)
            db_user = User(
                email=user_create.email,
                full_name=user_create.full_name,
                hashed_password=hashed_password,
                university_id=user_create.university_id,
                role=user_create.role,
                is_active=user_create.is_active
            )

            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user

        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        except Exception as e:
            db.rollback()
            print("REGISTER ERROR:", repr(e))
            raise


    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not security.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    @staticmethod
    def generate_tokens(user: User) -> TokenResponse:
        access_token = security.create_access_token(subject=user.id)
        refresh_token = security.create_refresh_token(subject=user.id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )

    @staticmethod
    def get_current_user(db: Session, token: str) -> User:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = security.decode_token(token)
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
            # Use UUID if necessary? user.id is UUID in model. 
            # sub is stringified UUID.
        except JWTError:
            raise credentials_exception
        
        user = db.query(User).filter(User.id == UUID(user_id)).first()
        if user is None:
            raise credentials_exception
        return user
