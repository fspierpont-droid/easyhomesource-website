"""Customer records required by the EHS quoting workflow.

CRM lifecycle ownership remains in GoHighLevel. These records are the persisted
customer snapshots/relationships required by EHS quotes and are not a second CRM
pipeline.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator
from pymongo import ReturnDocument

from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/api/customers", tags=["customers"])


def _text(value) -> Optional[str]:
    if value is None:
        return None
    cleaned = str(value).strip()
    return cleaned or None


def _phone(value) -> Optional[str]:
    cleaned = _text(value)
    if not cleaned:
        return None
    digits = re.sub(r"\D", "", cleaned)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) != 10:
        raise ValueError("Phone must be a 10-digit U.S. number")
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"


class CustomerWrite(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = None
    email: Optional[str] = Field(default=None, max_length=320)
    current_address: Optional[str] = Field(default=None, max_length=240)
    current_city: Optional[str] = Field(default=None, max_length=120)
    current_state: Optional[str] = Field(default=None, max_length=2)
    current_zip: Optional[str] = Field(default=None, max_length=10)
    mailing_same_as_current: bool = True
    mailing_address: Optional[str] = Field(default=None, max_length=240)
    mailing_city: Optional[str] = Field(default=None, max_length=120)
    mailing_state: Optional[str] = Field(default=None, max_length=2)
    mailing_zip: Optional[str] = Field(default=None, max_length=10)
    has_co_buyer: bool = False
    co_buyer_first_name: Optional[str] = Field(default=None, max_length=100)
    co_buyer_last_name: Optional[str] = Field(default=None, max_length=100)
    co_buyer_phone: Optional[str] = None
    co_buyer_email: Optional[str] = Field(default=None, max_length=320)
    notes: Optional[str] = Field(default=None, max_length=5000)
    ghl_contact_id: Optional[str] = Field(default=None, max_length=200)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def required_name(cls, value):
        cleaned = _text(value)
        if not cleaned:
            raise ValueError("Name is required")
        return cleaned

    @field_validator("phone", "co_buyer_phone", mode="before")
    @classmethod
    def normalize_phone(cls, value):
        return _phone(value)

    @field_validator("email", "co_buyer_email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        cleaned = _text(value)
        return cleaned.lower() if cleaned else None

    @field_validator("current_state", "mailing_state", mode="before")
    @classmethod
    def normalize_state(cls, value):
        cleaned = _text(value)
        if not cleaned:
            return None
        state = re.sub(r"[^A-Za-z]", "", cleaned).upper()
        if len(state) != 2:
            raise ValueError("State must be a 2-letter code")
        return state


def _clean(document: dict | None) -> dict | None:
    if not document:
        return None
    result = dict(document)
    result.pop("_id", None)
    return result


@router.get("")
async def list_customers(
    q: Optional[str] = Query(default=None, max_length=160),
    _user: dict = Depends(get_current_user),
) -> list[dict]:
    query: dict = {}
    if q and q.strip():
        escaped = re.escape(q.strip())
        query = {
            "$or": [
                {"first_name": {"$regex": escaped, "$options": "i"}},
                {"last_name": {"$regex": escaped, "$options": "i"}},
                {"email": {"$regex": escaped, "$options": "i"}},
                {"phone": {"$regex": escaped, "$options": "i"}},
            ]
        }
    return await get_db().customers.find(query, {"_id": 0}).sort("updated_at", -1).to_list(500)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerWrite,
    user: dict = Depends(get_current_user),
) -> dict:
    now = datetime.now(timezone.utc)
    document = {
        "id": str(uuid4()),
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
        "created_by_id": user.get("id"),
        "updated_by_id": user.get("id"),
    }
    await get_db().customers.insert_one(document)
    return _clean(document) or {}


@router.get("/{customer_id}")
async def get_customer(
    customer_id: str,
    _user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().customers.find_one({"id": customer_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Customer not found")
    return document


@router.patch("/{customer_id}")
async def update_customer(
    customer_id: str,
    payload: CustomerWrite,
    user: dict = Depends(get_current_user),
) -> dict:
    update = payload.model_dump()
    update["updated_at"] = datetime.now(timezone.utc)
    update["updated_by_id"] = user.get("id")
    document = await get_db().customers.find_one_and_update(
        {"id": customer_id},
        {"$set": update},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not document:
        raise HTTPException(status_code=404, detail="Customer not found")
    return document


@router.get("/{customer_id}/quotes")
async def customer_quotes(
    customer_id: str,
    _user: dict = Depends(get_current_user),
) -> list[dict]:
    return await get_db().quotes.find(
        {"customer_id": customer_id}, {"_id": 0}
    ).sort("updated_at", -1).to_list(500)
