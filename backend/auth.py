"""Authentication for the permanent Easy HomeSource backend.

Existing EHS bcrypt password hashes remain valid after database copy. New or
changed passwords are hashed here; plaintext passwords are never stored.
"""
from __future__ import annotations

import os
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from database import get_db

JWT_ALG = "HS256"
JWT_EXP_HOURS = int(os.environ.get("JWT_EXP_HOURS", "12"))
MIN_PASSWORD_LENGTH = int(os.environ.get("MIN_PASSWORD_LENGTH", "10"))
APP_ENV = (os.environ.get("APP_ENV") or os.environ.get("ENVIRONMENT") or "development").lower()
PRODUCTION_ENVS = {"production", "prod"}
DEV_JWT_SECRET = "ehs-local-dev-secret-do-not-use-in-prod"

ROLES = {
    "admin",
    "manager",
    "associate",
    "salesperson",
    "sales",
    "production",
    "quote",
    "quote_user",
    "sales_quote",
}
ADMIN_ROLES = {"admin"}
MANAGER_ROLES = {"admin", "manager"}


def _jwt_secret() -> str:
    secret = (os.environ.get("JWT_SECRET") or "").strip()
    if secret:
        if APP_ENV in PRODUCTION_ENVS and len(secret) < 32:
            raise RuntimeError("JWT_SECRET must be at least 32 characters in production")
        return secret
    if APP_ENV in PRODUCTION_ENVS:
        raise RuntimeError("JWT_SECRET is required in production")
    return DEV_JWT_SECRET


JWT_SECRET = _jwt_secret()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def normalize_role(role: Optional[str]) -> str:
    normalized = (role or "associate").strip().lower()
    if normalized not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid user role")
    return normalized


def validate_password_strength(plain: str) -> None:
    if len(plain or "") < MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters",
        )
    if len(plain) < 14:
        checks = [
            bool(re.search(r"[a-z]", plain)),
            bool(re.search(r"[A-Z]", plain)),
            bool(re.search(r"\d", plain)),
            bool(re.search(r"[^A-Za-z0-9]", plain)),
        ]
        if sum(checks) < 3:
            raise HTTPException(
                status_code=400,
                detail="Password must include at least three of: uppercase, lowercase, number, symbol",
            )
    lowered = plain.lower()
    if any(term in lowered for term in ("password", "easyhomesource", "welcome", "admin")):
        raise HTTPException(status_code=400, detail="Password contains a common or company-related phrase")


def hash_password(plain: str) -> str:
    validate_password_strength(plain)
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(sub: str, extra: Optional[dict[str, Any]] = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": sub,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(hours=JWT_EXP_HOURS),
        "typ": "access",
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALG],
        options={"require": ["exp", "iat", "sub"]},
    )


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_token(token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await get_db().users.find_one(
        {"id": user_id},
        {"_id": 0, "password_hash": 0},
    )
    if not user or not user.get("active", True):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if (user.get("role") or "").lower() not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin role required")
    return user


async def require_manager_or_admin(user: dict = Depends(get_current_user)) -> dict:
    if (user.get("role") or "").lower() not in MANAGER_ROLES:
        raise HTTPException(status_code=403, detail="Manager or admin role required")
    return user
