"""Core Pydantic models for the permanent Easy HomeSource API."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal[
    "admin",
    "manager",
    "associate",
    "salesperson",
    "sales",
    "production",
    "quote",
    "quote_user",
    "sales_quote",
]


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: UserRole = "associate"
    active: bool = True
    ghl_linked: bool = False
    ghl_user_id: Optional[str] = None
    ghl_user_email: Optional[EmailStr] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=10, max_length=256)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=256)
    name: str = Field(min_length=1, max_length=160)
    phone: Optional[str] = Field(default=None, max_length=50)
    role: UserRole = "associate"
    active: bool = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=10, max_length=256)
    name: Optional[str] = Field(default=None, min_length=1, max_length=160)
    phone: Optional[str] = Field(default=None, max_length=50)
    role: Optional[UserRole] = None
    active: Optional[bool] = None
    ghl_linked: Optional[bool] = None
    ghl_user_id: Optional[str] = Field(default=None, max_length=200)
    ghl_user_email: Optional[EmailStr] = None
