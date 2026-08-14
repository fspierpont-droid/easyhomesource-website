"""Permanent property / land-home package inventory routes.

Unlike the old staging implementation, this module never auto-seeds property
records. Production records arrive only through the controlled database copy or
authorized employee writes.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from auth import get_current_user, require_manager_or_admin
from database import get_db

router = APIRouter(prefix="/api/properties", tags=["properties"])

PropertyStatus = Literal[
    "Available Now",
    "Coming Soon / In Progress",
    "Under Contract / Sold",
    "Status to Confirm",
]
PropertyType = Literal[
    "Finished Home",
    "Home in Progress",
    "Vacant Lot / Land",
    "Unknown",
]


class PropertyCreate(BaseModel):
    street: str = Field(min_length=1, max_length=200)
    city: str = Field(default="", max_length=120)
    state: str = Field(default="FL", min_length=2, max_length=2)
    zip: str = Field(default="", max_length=10)
    county: str = Field(default="", max_length=120)
    status: PropertyStatus = "Status to Confirm"
    property_type: PropertyType = "Unknown"
    units: int = Field(default=1, ge=1, le=10000)
    lot_size: str = Field(default="", max_length=120)
    land_price: Optional[float] = Field(default=None, ge=0)
    package_price: Optional[float] = Field(default=None, ge=0)
    sales_rep: str = Field(default="Unassigned", max_length=160)
    notes_internal: str = Field(default="", max_length=5000)
    notes_public: str = Field(default="", max_length=2000)
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
    status: Optional[PropertyStatus] = None
    property_type: Optional[PropertyType] = None
    units: Optional[int] = Field(default=None, ge=1, le=10000)
    lot_size: Optional[str] = Field(default=None, max_length=120)
    land_price: Optional[float] = Field(default=None, ge=0)
    package_price: Optional[float] = Field(default=None, ge=0)
    sales_rep: Optional[str] = Field(default=None, max_length=160)
    notes_internal: Optional[str] = Field(default=None, max_length=5000)
    notes_public: Optional[str] = Field(default=None, max_length=2000)
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


def _public_property(document: dict) -> dict:
    """Explicit allow-list prevents leaking internal notes or employee metadata."""
    return {
        "id": document.get("id"),
        "street": document.get("street", ""),
        "city": document.get("city", ""),
        "state": document.get("state", "FL"),
        "zip": document.get("zip", ""),
        "county": document.get("county", ""),
        "status": document.get("status"),
        "property_type": document.get("property_type"),
        "units": document.get("units", 1),
        "lot_size": document.get("lot_size", ""),
        "package_price": document.get("package_price"),
        "notes_public": document.get("notes_public", ""),
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


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_property(
    payload: PropertyCreate,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    now = datetime.now(timezone.utc)
    document = {
        "id": f"EHS-PROP-{str(uuid4()).split('-')[0].upper()}",
        **payload.model_dump(),
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

    update["updated_at"] = datetime.now(timezone.utc)
    update["updated_by_id"] = user.get("id")
    document = await get_db().properties.find_one_and_update(
        {"id": property_id},
        {"$set": update},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not document:
        raise HTTPException(status_code=404, detail="Property not found")
    return document


@router.delete("/{property_id}")
async def archive_property(
    property_id: str,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    result = await get_db().properties.update_one(
        {"id": property_id},
        {
            "$set": {
                "archived": True,
                "public_visible": False,
                "updated_at": datetime.now(timezone.utc),
                "updated_by_id": user.get("id"),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True, "archived": True}
