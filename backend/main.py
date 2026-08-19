"""Permanent Easy HomeSource API entrypoint.

This service is deliberately independent of the old ehs-staging deployment. It
uses only the database and secrets supplied to this deployment.
"""
from __future__ import annotations

import hashlib
import logging
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from catalog import router as catalog_router
from customers import router as customers_router
from database import ensure_indexes, get_db, ping_database
from legacy_quotes import router as legacy_quotes_router
from models import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserCreate,
    UserPublic,
    UserUpdate,
)
from properties import router as properties_router
from quotes import public_router as public_quotes_router
from quotes import router as quotes_router

logger = logging.getLogger("easyhomesource.api")
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))

app = FastAPI(
    title="Easy HomeSource API",
    version="2.0.0",
    docs_url="/api/docs" if os.environ.get("ENABLE_API_DOCS", "false").lower() == "true" else None,
    redoc_url=None,
)
app.include_router(catalog_router)
app.include_router(customers_router)
app.include_router(properties_router)
app.include_router(quotes_router)
app.include_router(public_quotes_router)
app.include_router(legacy_quotes_router)


def _cors_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "")
    values = [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]
    if os.environ.get("APP_ENV", "development").lower() not in {"production", "prod"}:
        values.extend(["http://localhost:3000", "http://127.0.0.1:3000"])
    return sorted(set(value for value in values if value != "*"))


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cache-Control"] = "no-store"
    if os.environ.get("APP_ENV", "development").lower() in {"production", "prod"}:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


def _safe_user(document: dict) -> dict:
    return {key: value for key, value in document.items() if key not in {"_id", "password_hash"}}


def _as_utc(value: object) -> datetime | None:
    """Normalize MongoDB datetimes so login throttling comparisons are safe.

    PyMongo/Motor returns BSON datetimes as naive UTC values by default, while
    application timestamps use timezone-aware UTC datetimes. Comparing those
    directly raises TypeError and turns a normal login attempt into HTTP 500.
    """
    if not isinstance(value, datetime):
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


async def _audit(
    action: str,
    *,
    user: dict | None = None,
    target_user_id: str | None = None,
    success: bool = True,
    reason: str | None = None,
    request: Request | None = None,
) -> None:
    try:
        await get_db().audit_logs.insert_one(
            {
                "audit_id": str(uuid4()),
                "timestamp": datetime.now(timezone.utc),
                "action": action,
                "actor_user_id": (user or {}).get("id"),
                "actor_email": (user or {}).get("email"),
                "target_user_id": target_user_id,
                "success": success,
                "reason": reason,
                "ip_address": request.client.host if request and request.client else None,
                "user_agent": request.headers.get("user-agent") if request else None,
            }
        )
    except Exception:
        logger.exception("Audit log write failed")


async def _enforce_login_rate_limit(email: str) -> None:
    """Database-backed per-identity login throttling."""
    key = hashlib.sha256(email.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    window = timedelta(minutes=5)
    limit = 10
    collection = get_db().rate_limits
    document = await collection.find_one({"key": key})
    reset_at = _as_utc(document.get("reset_at")) if document else None

    if not document or reset_at is None or reset_at <= now:
        await collection.update_one(
            {"key": key},
            {"$set": {"key": key, "count": 1, "reset_at": now + window, "updated_at": now}},
            upsert=True,
        )
        return

    if int(document.get("count", 0)) >= limit:
        raise HTTPException(status_code=429, detail="Too many login attempts. Please wait and try again.")

    await collection.update_one(
        {"key": key},
        {"$inc": {"count": 1}, "$set": {"updated_at": now}},
    )


@app.on_event("startup")
async def startup() -> None:
    await ping_database()
    await ensure_indexes()
    logger.info("Permanent Easy HomeSource API initialized")


@app.get("/api/health")
async def health() -> dict:
    await ping_database()
    return {"ok": True, "service": "easyhomesource-api", "version": "2.0.0"}


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request) -> LoginResponse:
    email = str(payload.email).lower().strip()
    await _enforce_login_rate_limit(email)

    user = await get_db().users.find_one({"email": email})
    valid = bool(
        user
        and user.get("active", True)
        and verify_password(payload.password, user.get("password_hash", ""))
    )
    if not valid:
        await _audit("login_attempt", success=False, reason="invalid_credentials", request=request)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    public_user = UserPublic(**_safe_user(user))
    token = create_access_token(public_user.id, extra={"role": public_user.role})
    await _audit("login_attempt", user=user, success=True, request=request)
    return LoginResponse(access_token=token, user=public_user)


@app.get("/api/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)) -> UserPublic:
    return UserPublic(**user)


@app.post("/api/auth/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    user: dict = Depends(get_current_user),
) -> dict:
    stored = await get_db().users.find_one({"id": user["id"]})
    if not stored or not verify_password(payload.current_password, stored.get("password_hash", "")):
        await _audit("password_change", user=user, success=False, reason="invalid_current_password", request=request)
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    await get_db().users.update_one(
        {"id": user["id"]},
        {"$set": {"password_hash": hash_password(payload.new_password), "updated_at": datetime.now(timezone.utc)}},
    )
    await _audit("password_change", user=user, success=True, request=request)
    return {"ok": True}


@app.get("/api/auth/users", response_model=list[UserPublic])
async def list_users(_admin: dict = Depends(require_admin)) -> list[UserPublic]:
    users = await get_db().users.find({}, {"_id": 0, "password_hash": 0}).sort("name", 1).to_list(500)
    return [UserPublic(**user) for user in users]


@app.post("/api/auth/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    request: Request,
    admin: dict = Depends(require_admin),
) -> UserPublic:
    now = datetime.now(timezone.utc)
    document = {
        "id": str(uuid4()),
        "email": str(payload.email).lower().strip(),
        "name": payload.name.strip(),
        "phone": payload.phone,
        "role": payload.role,
        "active": payload.active,
        "ghl_linked": False,
        "password_hash": hash_password(payload.password),
        "created_at": now,
        "updated_at": now,
    }
    try:
        await get_db().users.insert_one(document)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An employee with that email already exists")

    await _audit("user_created", user=admin, target_user_id=document["id"], request=request)
    return UserPublic(**_safe_user(document))


@app.patch("/api/auth/users/{user_id}", response_model=UserPublic)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    request: Request,
    admin: dict = Depends(require_admin),
) -> UserPublic:
    update = payload.model_dump(exclude_unset=True)
    if "email" in update and update["email"] is not None:
        update["email"] = str(update["email"]).lower().strip()
    if "password" in update:
        password = update.pop("password")
        if password:
            update["password_hash"] = hash_password(password)
    update["updated_at"] = datetime.now(timezone.utc)

    try:
        document = await get_db().users.find_one_and_update(
            {"id": user_id},
            {"$set": update},
            projection={"_id": 0, "password_hash": 0},
            return_document=ReturnDocument.AFTER,
        )
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="An employee with that email already exists")

    if not document:
        raise HTTPException(status_code=404, detail="Employee not found")

    await _audit("user_updated", user=admin, target_user_id=user_id, request=request)
    return UserPublic(**document)


@app.get("/api/admin/system-check")
async def system_check(_admin: dict = Depends(require_admin)) -> dict:
    db = get_db()
    collections = (
        "users",
        "customers",
        "quotes",
        "legacy_quotes",
        "projects",
        "homes",
        "properties",
        "home_inventory",
        "key_contacts",
        "settings",
    )
    counts = {name: await db[name].count_documents({}) for name in collections}
    return {
        "ok": True,
        "service": "easyhomesource-api",
        "database": os.environ.get("DB_NAME"),
        "collection_counts": counts,
    }
