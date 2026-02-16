from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserResponse
from app.services.user_service import UserService
from app.api.deps import get_current_user
from typing import List

router = APIRouter()

# Dependency for role-based authorization
def is_admin(current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user=Depends(get_current_user)):
    user = UserService.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.get("/users", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 10, current_user=Depends(get_current_user), admin=Depends(is_admin)):
    return UserService.get_users(skip=skip, limit=limit)

@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: dict, current_user=Depends(get_current_user)):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    updated_user = UserService.update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, current_user=Depends(get_current_user)):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own profile"
        )
    if not UserService.delete_user(user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")