"""Persistent runtime overrides for the verified EHS catalog baselines.

The repository-owned public and Master Quote catalogs remain the verified fallback.
This module stores only approved runtime overrides so pricing/status/spec changes can
be shared across the quote builder, public website, and chatbot without replacing
rich static media or risking a bulk data migration.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel, Field, model_validator
from pymongo import ReturnDocument

from auth import get_current_user, require_catalog_manager
from database import get_db

router = APIRouter(prefix="/api/catalog-overrides", tags=["catalog-overrides"])


class CatalogOverrideWrite(BaseModel):
    quote_slug: Optional[str] = Field(default=None, max_length=240)
    public_slug: Optional[str] = Field(default=None, max_length=240)
    name: Optional[str] = Field(default=None, max_length=200)
    manufacturer: Optional[str] = Field(default=None, max_length=160)

    quote_enabled: Optional[bool] = None
    public_enabled: Optional[bool] = None
    public_status: Optional[Literal["Available", "Coming Soon", "Sold"]] = None
    is_on_display: Optional[bool] = None

    hud_base_price: Optional[float] = Field(default=None, ge=0)
    est_factory_cost: Optional[float] = Field(default=None, ge=0)
    msrp: Optional[float] = Field(default=None, ge=0)
    ehs_price: Optional[float] = Field(default=None, ge=0)
    starting_price: Optional[float] = Field(default=None, ge=0)

    bedrooms: Optional[int] = Field(default=None, ge=0, le=20)
    bathrooms: Optional[float] = Field(default=None, ge=0, le=20)
    square_feet: Optional[int] = Field(default=None, ge=0, le=50000)
    width: Optional[float] = Field(default=None, ge=0, le=500)
    length: Optional[float] = Field(default=None, ge=0, le=500)
    dimensions: Optional[str] = Field(default=None, max_length=120)
    note: Optional[str] = Field(default=None, max_length=3000)

    @model_validator(mode="after")
    def require_surface(self):
        if not (self.quote_slug or self.public_slug):
            raise ValueError("quote_slug or public_slug is required")
        return self


def _clean(document: dict | None) -> dict | None:
    if not document:
        return None
    result = dict(document)
    result.pop("_id", None)
    return result


def _public(document: dict) -> dict:
    allowed = {
        "catalog_key",
        "quote_slug",
        "public_slug",
        "name",
        "manufacturer",
        "public_enabled",
        "public_status",
        "is_on_display",
        "msrp",
        "ehs_price",
        "starting_price",
        "bedrooms",
        "bathrooms",
        "square_feet",
        "width",
        "length",
        "dimensions",
        "updated_at",
    }
    return {key: value for key, value in document.items() if key in allowed}


async def _audit_change(action: str, admin: dict, catalog_key: str) -> None:
    await get_db().audit_logs.insert_one(
        {
            "audit_id": str(uuid4()),
            "timestamp": datetime.now(timezone.utc),
            "action": action,
            "actor_user_id": admin.get("id"),
            "actor_email": admin.get("email"),
            "resource_type": "catalog_override",
            "resource_id": catalog_key,
            "success": True,
        }
    )


@router.get("/public")
async def public_catalog_overrides() -> list[dict]:
    documents = await get_db().catalog_overrides.find({}, {"_id": 0}).sort("catalog_key", 1).to_list(5000)
    return [_public(document) for document in documents]


@router.get("")
async def internal_catalog_overrides(_user: dict = Depends(get_current_user)) -> list[dict]:
    return await get_db().catalog_overrides.find({}, {"_id": 0}).sort("catalog_key", 1).to_list(5000)


@router.put("/{catalog_key}")
async def upsert_catalog_override(
    payload: CatalogOverrideWrite,
    catalog_key: str = Path(min_length=1, max_length=240),
    admin: dict = Depends(require_catalog_manager),
) -> dict:
    now = datetime.now(timezone.utc)
    update = payload.model_dump(exclude_unset=True)
    update.update(
        {
            "catalog_key": catalog_key,
            "updated_at": now,
            "updated_by_id": admin.get("id"),
        }
    )

    document = await get_db().catalog_overrides.find_one_and_update(
        {"catalog_key": catalog_key},
        {
            "$set": update,
            "$setOnInsert": {
                "created_at": now,
                "created_by_id": admin.get("id"),
            },
        },
        projection={"_id": 0},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    await _audit_change("catalog_override_saved", admin, catalog_key)
    return _clean(document) or {"catalog_key": catalog_key, **update}


@router.delete("/{catalog_key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog_override(
    catalog_key: str = Path(min_length=1, max_length=240),
    admin: dict = Depends(require_catalog_manager),
):
    result = await get_db().catalog_overrides.delete_one({"catalog_key": catalog_key})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Catalog override not found")
    await _audit_change("catalog_override_reset", admin, catalog_key)
    return None
