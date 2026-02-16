from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError

from app.api import deps
from app.schemas.user import UserCreate, UserResponse, TokenResponse, UserLogin
from app.services.auth_service import AuthService
from app.core import security
from app.models.user import User
from app.core.config import get_settings

settings = get_settings()

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = AuthService.register_user(db, user_in)
    return user

@router.post("/login", response_model=TokenResponse)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = AuthService.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return AuthService.generate_tokens(user)

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    db: Session = Depends(deps.get_db),
    token: str = Body(..., embed=True) 
) -> Any:
    """
    Refresh access token.
    Expects {"token": "refresh_token"} in body.
    """
    try:
        payload = security.decode_token(token)
        if payload.get("type") != "refresh":
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        user_id = payload.get("sub")
        if not user_id:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        # Verify user still exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        elif not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
            
        return AuthService.generate_tokens(user)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
