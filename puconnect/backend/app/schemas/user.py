from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr

class UserRole(str, Enum):
    student = "student"
    admin = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    university_id: str
    role: UserRole = UserRole.student
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    # is_active and role are already in UserBase, so they are included.
    # hashed_password is NOT in UserBase, so it is excluded by default.

    class Config:
        orm_mode = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
