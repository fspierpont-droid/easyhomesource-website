"""Permanent property / land-home package inventory routes.

The permanent API is the source of truth for portal property records. This
module deliberately never auto-seeds records: production properties arrive only
through a controlled verified import or authenticated employee writes.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from auth import get_current_user, require_manager_or_admin
from database import get_db

router = APIRouter(prefix="/api/properties", tags=["properties"])

PropertyStatus = Literal[
    "AVAILABLE",
    "COMING_SOON",
    "UNDER_CONTRACT",
    "SOLD",
    "STATUS_TO_CONFIRM",
]
PropertyType = Literal[
    "LAND",
    "HOME",
    "LAND_HOME_PACKAGE",
    "SPEC_HOME",
    "MODEL",
]


class PropertyCreate(BaseModel):
    street: str = Field(min_length=1, max_length=200)
    city: str = Field(default="", max_length=120)
    state: str = Field(default="FL", min_length=2, max_length=2)
    zip: str = Field(default="", max_length=10)
    county: str = Field(default="", max_length=120)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    status: PropertyStatus = "STATUS_TO_CONFIRM"
    property_type: PropertyType = "LAND"
    builder: Optional[str] = Field(default=None, max_length=200)
    community: Optional[str] = Field(default=None, max_length=200)
    price: Optional[float] = Field(default=None, ge=0)
    land_price: Optional[float] = Field(default=None, ge=0)
    package_price: Optional[float] = Field(default=None, ge=0)
    bedrooms: Optional[int] = Field(default=None, ge=0, le=20)
    bathrooms: Optional[float] = Field(default=None, ge=0, le=20)
    square_feet: Optional[int] = Field(default=None, ge=0, le=100000)
    lot_size: Optional[str] = Field(default=None, max_length=120)
    parcel_number: Optional[str] = Field(default=None, max_length=160)
    photos: list[str] = Field(default_factory=list)
    description: str = Field(default="", max_length=10000)
    units: int = Field(default=1, ge=1, le=10000)
    sales_rep: str = Field(default="Unassigned", max_length=160)
    notes_internal: str = Field(default="", max_length=5000)
    notes_public: str = Field(default="", max_length=5000)
    zoning: Optional[str] = Field(default=None, max_length=200)
    flood_zone: Optional[str] = Field(default=None, max_length=200)
    utilities: dict[str, str] = Field(default_factory=dict)
    source: str = Field(default="", max_length=240)
    public_visible: bool = False
    featured: bool = False
    compatible_home_ids: list[str] = Field(default_factory=list)
    display_order: int = Field(default=0, ge=0, le=100000)


class PropertyUpdate(BaseModel):
    street: Optional[str] = Field(default=None, min_length=1, max_length=200)
    city: Optional[str] = Field(default=None, max_length=120)
    state: Optional[str] = Field(default=None, min_length=2, max_length=2)
    zip: Optional[str] = Field(default=None, max_length=10)
    county: Optional[str] = Field(default=None, max_length=120)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    status: Optional[PropertyStatus] = None
    property_type: Optional[PropertyType] = None
    builder: Optional[str] = Field(default=None, max_length=200)
    community: Optional[str] = Field(default=None, max_length=200)
    price: Optional[float] = Field(default=None, ge=0)
    land_price: Optional[float] = Field(default=None, ge=0)
    package_price: Optional[float] = Field(default=None, ge=0)
    bedrooms: Optional[int] = Field(default=None, ge=0, le=20)
    bathrooms: Optional[float] = Field(default=None, ge=0, le=20)
    square_feet: Optional[int] = Field(default=None, ge=0, le=100000)
    lot_size: Optional[str] = Field(default=None, max_length=120)
    parcel_number: Optional[str] = Field(default=None, max_length=160)
    photos: Optional[list[str]] = None
    description: Optional[str] = Field(default=None, max_length=10000)
    units: Optional[int] = Field(default=None, ge=1, le=10000)
    sales_rep: Optional[str] = Field(default=None, max_length=160)
    notes_internal: Optional[str] = Field(default=None, max_length=5000)
    notes_public: Optional[str] = Field(default=None, max_length=5000)
    zoning: Optional[str] = Field(default=None, max_length=200)
    flood_zone: Optional[str] = Field(default=None, max_length=200)
    utilities: Optional[dict[str, str]] = None
    source: Optional[str] = Field(default=None, max_length=240)
    public_visible: Optional[bool] = None
    featured: Optional[bool] = None
    compatible_home_ids: Optional[list[str]] = None
    display_order: Optional[int] = Field(default=None, ge=0, le=100000)
    archived: Optional[bool] = None


def _clean(document: dict | None) -> dict | None:
    if not document:
        return None
    value = dict(document)
    value.pop("_id", None)
    return value


def _audit_entry(user: dict, action: str, **extra: Any) -> dict:
    return {
        "id": f"log-{uuid4()}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user": user.get("name") or user.get("email") or "Portal User",
        "action": action,
        **extra,
    }


def _public_property(document: dict) -> dict:
    """Explicit allow-list prevents leaking internal notes or employee metadata."""
    return {
        "id": document.get("id"),
        "street": document.get("street", ""),
        "city": document.get("city", ""),
        "state": document.get("state", "FL"),
        "zip": document.get("zip", ""),
        "county": document.get("county", ""),
        "latitude": document.get("latitude"),
        "longitude": document.get("longitude"),
        "status": document.get("status"),
        "property_type": document.get("property_type"),
        "builder": document.get("builder"),
        "community": document.get("community"),
        "price": document.get("price"),
        "package_price": document.get("package_price"),
        "bedrooms": document.get("bedrooms"),
        "bathrooms": document.get("bathrooms"),
        "square_feet": document.get("square_feet"),
        "lot_size": document.get("lot_size"),
        "parcel_number": document.get("parcel_number"),
        "photos": document.get("photos") or [],
        "description": document.get("description", ""),
        "units": document.get("units", 1),
        "notes_public": document.get("notes_public", ""),
        "zoning": document.get("zoning"),
        "flood_zone": document.get("flood_zone"),
        "utilities": document.get("utilities") or {},
        "featured": bool(document.get("featured")),
        "compatible_home_ids": document.get("compatible_home_ids") or [],
        "display_order": document.get("display_order", 0),
        "updated_at": document.get("updated_at"),
    }


@router.get("/public")
async def list_public_properties() -> list[dict]:
    documents = await get_db().properties.find(
        {"archived": {"$ne": True}, "public_visible": True},
        {"_id": 0},
    ).sort([("featured", -1), ("display_order", 1), ("city", 1)]).to_list(2000)
    return [_public_property(document) for document in documents]


@router.get("")
async def list_properties(
    include_archived: bool = Query(default=False),
    _user: dict = Depends(get_current_user),
) -> list[dict]:
    query = {} if include_archived else {"archived": {"$ne": True}}
    return await get_db().properties.find(query, {"_id": 0}).sort(
        [("featured", -1), ("display_order", 1), ("city", 1)]
    ).to_list(2000)


@router.get("/{property_id}")
async def get_property(
    property_id: str,
    _user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().properties.find_one({"id": property_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Property not found")
    return document


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_property(
    payload: PropertyCreate,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    now = datetime.now(timezone.utc)
    document = {
        "id": f"EHS-PROP-{str(uuid4()).split('-')[0].upper()}",
        **payload.model_dump(),
        "history": [_audit_entry(user, "Property Created")],
        "archived": False,
        "created_at": now,
        "updated_at": now,
        "created_by_id": user.get("id"),
        "updated_by_id": user.get("id"),
    }
    await get_db().properties.insert_one(document)
    return _clean(document) or {}


@router.patch("/{property_id}")
async def update_property(
    property_id: str,
    payload: PropertyUpdate,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    update = payload.model_dump(exclude_unset=True)
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")

    existing = await get_db().properties.find_one({"id": property_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Property not found")

    changed_fields = [key for key, value in update.items() if existing.get(key) != value]
    if not changed_fields:
        return existing

    update["updated_at"] = datetime.now(timezone.utc)
    update["updated_by_id"] = user.get("id")
    document = await get_db().properties.find_one_and_update(
        {"id": property_id},
        {
            "$set": update,
            "$push": {
                "history": {
                    "$each": [
                        _audit_entry(
                            user,
                            "Property Updated",
                            field=",".join(changed_fields),
                        )
                    ],
                    "$position": 0,
                }
            },
        },
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    return document or {}


@router.delete("/{property_id}")
async def archive_property(
    property_id: str,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    now = datetime.now(timezone.utc)
    result = await get_db().properties.update_one(
        {"id": property_id},
        {
            "$set": {
                "archived": True,
                "public_visible": False,
                "updated_at": now,
                "updated_by_id": user.get("id"),
            },
            "$push": {
                "history": {
                    "$each": [_audit_entry(user, "Property Archived")],
                    "$position": 0,
                }
            },
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True, "archived": True}
