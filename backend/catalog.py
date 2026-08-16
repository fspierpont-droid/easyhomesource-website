"""Persistent home catalog routes for the permanent EHS platform."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from pymongo import ReturnDocument

from auth import get_current_user, require_admin
from database import get_db

router = APIRouter(prefix="/api/homes", tags=["homes"])


class HomeWrite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    manufacturer: str = Field(min_length=1, max_length=160)
    manufacturer_full: Optional[str] = Field(default=None, max_length=240)
    manufacturer_id: Optional[str] = Field(default=None, max_length=160)
    series: Optional[str] = Field(default=None, max_length=160)
    model_name: str = Field(min_length=1, max_length=200)
    home_type: Optional[str] = Field(default=None, max_length=80)
    floors: Optional[int] = Field(default=None, ge=1, le=4)
    beds: Optional[int] = Field(default=None, ge=0, le=20)
    baths: Optional[float] = Field(default=None, ge=0, le=20)
    sqft: Optional[int] = Field(default=None, ge=0, le=50000)
    width: Optional[float] = Field(default=None, ge=0, le=500)
    length: Optional[float] = Field(default=None, ge=0, le=500)
    dimensions: Optional[str] = Field(default=None, max_length=120)
    est_factory_cost: Optional[float] = Field(default=None, ge=0)
    msrp: Optional[float] = Field(default=None, ge=0)
    ehs_price: Optional[float] = Field(default=None, ge=0)
    wind_zone: Optional[str] = Field(default=None, max_length=80)
    active: bool = True
    description: Optional[str] = Field(default=None, max_length=10000)
    short_description: Optional[str] = Field(default=None, max_length=2000)
    summary: Optional[str] = Field(default=None, max_length=3000)
    spec_summary: Optional[str] = Field(default=None, max_length=3000)
    image: Optional[str] = Field(default=None, max_length=2000)
    image_url: Optional[str] = Field(default=None, max_length=2000)
    primary_image_url: Optional[str] = Field(default=None, max_length=2000)
    photo_url: Optional[str] = Field(default=None, max_length=2000)
    exterior_image_url: Optional[str] = Field(default=None, max_length=2000)
    floorplan_url: Optional[str] = Field(default=None, max_length=2000)
    floor_plan_url: Optional[str] = Field(default=None, max_length=2000)
    floorplan_image_url: Optional[str] = Field(default=None, max_length=2000)
    plan_image_url: Optional[str] = Field(default=None, max_length=2000)


class HomePatch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    manufacturer: Optional[str] = Field(default=None, min_length=1, max_length=160)
    manufacturer_full: Optional[str] = Field(default=None, max_length=240)
    manufacturer_id: Optional[str] = Field(default=None, max_length=160)
    series: Optional[str] = Field(default=None, max_length=160)
    model_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    home_type: Optional[str] = Field(default=None, max_length=80)
    floors: Optional[int] = Field(default=None, ge=1, le=4)
    beds: Optional[int] = Field(default=None, ge=0, le=20)
    baths: Optional[float] = Field(default=None, ge=0, le=20)
    sqft: Optional[int] = Field(default=None, ge=0, le=50000)
    width: Optional[float] = Field(default=None, ge=0, le=500)
    length: Optional[float] = Field(default=None, ge=0, le=500)
    dimensions: Optional[str] = Field(default=None, max_length=120)
    est_factory_cost: Optional[float] = Field(default=None, ge=0)
    msrp: Optional[float] = Field(default=None, ge=0)
    ehs_price: Optional[float] = Field(default=None, ge=0)
    wind_zone: Optional[str] = Field(default=None, max_length=80)
    active: Optional[bool] = None
    description: Optional[str] = Field(default=None, max_length=10000)
    short_description: Optional[str] = Field(default=None, max_length=2000)
    summary: Optional[str] = Field(default=None, max_length=3000)
    spec_summary: Optional[str] = Field(default=None, max_length=3000)
    image: Optional[str] = Field(default=None, max_length=2000)
    image_url: Optional[str] = Field(default=None, max_length=2000)
    primary_image_url: Optional[str] = Field(default=None, max_length=2000)
    photo_url: Optional[str] = Field(default=None, max_length=2000)
    exterior_image_url: Optional[str] = Field(default=None, max_length=2000)
    floorplan_url: Optional[str] = Field(default=None, max_length=2000)
    floor_plan_url: Optional[str] = Field(default=None, max_length=2000)
    floorplan_image_url: Optional[str] = Field(default=None, max_length=2000)
    plan_image_url: Optional[str] = Field(default=None, max_length=2000)


PUBLIC_HOME_FIELDS = {
    "id",
    "manufacturer",
    "manufacturer_full",
    "manufacturer_id",
    "series",
    "model_name",
    "home_type",
    "floors",
    "beds",
    "baths",
    "sqft",
    "width",
    "length",
    "dimensions",
    "msrp",
    "ehs_price",
    "wind_zone",
    "description",
    "short_description",
    "summary",
    "spec_summary",
    "image",
    "image_url",
    "primary_image_url",
    "photo_url",
    "exterior_image_url",
    "floorplan_url",
    "floor_plan_url",
    "floorplan_image_url",
    "plan_image_url",
}


def _public_home(document: dict) -> dict:
    return {key: value for key, value in document.items() if key in PUBLIC_HOME_FIELDS}


def _query(
    q: Optional[str],
    manufacturer: Optional[str],
    series: Optional[str],
    home_type: Optional[str],
    active_only: bool,
) -> dict:
    query: dict = {}
    if active_only:
        query["active"] = True
    if manufacturer:
        query["manufacturer"] = manufacturer
    if series:
        query["series"] = series
    if home_type:
        query["home_type"] = home_type
    if q and q.strip():
        escaped = re.escape(q.strip())
        query["$or"] = [
            {"model_name": {"$regex": escaped, "$options": "i"}},
            {"series": {"$regex": escaped, "$options": "i"}},
            {"manufacturer": {"$regex": escaped, "$options": "i"}},
        ]
    return query


@router.get("/public")
async def public_homes(
    q: Optional[str] = Query(default=None, max_length=160),
    manufacturer: Optional[str] = Query(default=None, max_length=160),
    series: Optional[str] = Query(default=None, max_length=160),
    home_type: Optional[str] = Query(default=None, max_length=80),
) -> list[dict]:
    documents = await get_db().homes.find(
        _query(q, manufacturer, series, home_type, True), {"_id": 0}
    ).sort([("manufacturer", 1), ("series", 1), ("model_name", 1)]).to_list(2000)
    return [_public_home(document) for document in documents]


@router.get("")
async def list_homes(
    q: Optional[str] = Query(default=None, max_length=160),
    manufacturer: Optional[str] = Query(default=None, max_length=160),
    series: Optional[str] = Query(default=None, max_length=160),
    home_type: Optional[str] = Query(default=None, max_length=80),
    include_inactive: bool = False,
    user: dict = Depends(get_current_user),
) -> list[dict]:
    can_see_inactive = include_inactive and (user.get("role") or "").lower() == "admin"
    return await get_db().homes.find(
        _query(q, manufacturer, series, home_type, not can_see_inactive), {"_id": 0}
    ).sort([("manufacturer", 1), ("series", 1), ("model_name", 1)]).to_list(2000)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_home(
    payload: HomeWrite,
    admin: dict = Depends(require_admin),
) -> dict:
    now = datetime.now(timezone.utc)
    document = {
        "id": str(uuid4()),
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
        "created_by_id": admin.get("id"),
        "updated_by_id": admin.get("id"),
    }
    await get_db().homes.insert_one(document)
    result = dict(document)
    result.pop("_id", None)
    return result


@router.patch("/{home_id}")
async def update_home(
    home_id: str,
    payload: HomePatch,
    admin: dict = Depends(require_admin),
) -> dict:
    update = payload.model_dump(exclude_unset=True)
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    update["updated_at"] = datetime.now(timezone.utc)
    update["updated_by_id"] = admin.get("id")
    document = await get_db().homes.find_one_and_update(
        {"id": home_id},
        {"$set": update},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not document:
        raise HTTPException(status_code=404, detail="Home not found")
    return document
