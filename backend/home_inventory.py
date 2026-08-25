"""Verified on-lot home inventory and private operational documents.

The permanent MongoDB database is the source of truth. This module never seeds
prototype records and never writes inventory documents to the Render filesystem
or a public/static website path.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from auth import get_current_user, require_manager_or_admin
from database import get_db

router = APIRouter(prefix="/api/home-inventory", tags=["home-inventory"])

InventoryStatus = Literal[
    "ON_LOT",
    "ORDERED",
    "IN_TRANSIT",
    "SETUP_IN_PROGRESS",
    "SOLD_AWAITING_DELIVERY",
    "OFF_LOT",
    "STATUS_TO_CONFIRM",
]
DocumentCategory = Literal[
    "Factory Invoice",
    "Certificate of Origin/MSO",
    "Build Sheet/Order",
    "Floorplan Financing",
    "Title",
    "Other",
]

# The authenticated browser path passes through Vercel before reaching Render.
# Vercel Functions cap request/response payloads at 4.5 MB, so we keep a safe
# margin below that platform ceiling and enforce the same operational limit here.
MAX_PDF_BYTES = 4 * 1024 * 1024
DATE_PATTERN = r"^\d{4}-\d{2}-\d{2}$"


class InventoryCreate(BaseModel):
    display_name: str = Field(min_length=1, max_length=200)
    manufacturer: Optional[str] = Field(default=None, max_length=160)
    model_name: Optional[str] = Field(default=None, max_length=200)
    series: Optional[str] = Field(default=None, max_length=160)
    serial_number: Optional[str] = Field(default=None, max_length=160)
    hud_labels: list[str] = Field(default_factory=list, max_length=10)
    catalog_home_id: Optional[str] = Field(default=None, max_length=160)
    status: InventoryStatus = "STATUS_TO_CONFIRM"
    lot_location: Optional[str] = Field(default=None, max_length=200)
    notes: str = Field(default="", max_length=5000)
    ehs_retail_price: Optional[float] = Field(default=None, ge=0)
    # Legacy compatibility only. New operational UI writes invoice_without_freight.
    factory_invoice_cost: Optional[float] = Field(default=None, ge=0)
    invoice_without_freight: Optional[float] = Field(default=None, ge=0)
    freight_financed: Optional[float] = Field(default=None, ge=0)
    freight_paid: Optional[float] = Field(default=None, ge=0)
    final_invoice_total: Optional[float] = Field(default=None, ge=0)
    floorplan_financing_balance: Optional[float] = Field(default=None, ge=0)
    financing_provider: Optional[str] = Field(default=None, max_length=120)
    ordered_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    delivered_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    estimated_offline_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    active: bool = True


class InventoryUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    manufacturer: Optional[str] = Field(default=None, max_length=160)
    model_name: Optional[str] = Field(default=None, max_length=200)
    series: Optional[str] = Field(default=None, max_length=160)
    serial_number: Optional[str] = Field(default=None, max_length=160)
    hud_labels: Optional[list[str]] = Field(default=None, max_length=10)
    catalog_home_id: Optional[str] = Field(default=None, max_length=160)
    status: Optional[InventoryStatus] = None
    lot_location: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=5000)
    ehs_retail_price: Optional[float] = Field(default=None, ge=0)
    # Legacy compatibility only. New operational UI writes invoice_without_freight.
    factory_invoice_cost: Optional[float] = Field(default=None, ge=0)
    invoice_without_freight: Optional[float] = Field(default=None, ge=0)
    freight_financed: Optional[float] = Field(default=None, ge=0)
    freight_paid: Optional[float] = Field(default=None, ge=0)
    final_invoice_total: Optional[float] = Field(default=None, ge=0)
    floorplan_financing_balance: Optional[float] = Field(default=None, ge=0)
    financing_provider: Optional[str] = Field(default=None, max_length=120)
    ordered_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    delivered_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    estimated_offline_date: Optional[str] = Field(default=None, pattern=DATE_PATTERN)
    active: Optional[bool] = None
    archived: Optional[bool] = None


def _clean(document: dict | None) -> dict | None:
    if not document:
        return None
    value = dict(document)
    value.pop("_id", None)
    return value


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _normalized_serial(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip().upper()
    return cleaned or None


def _normalized_hud_labels(values: list[str] | None) -> list[str]:
    normalized: list[str] = []
    for value in values or []:
        cleaned = str(value).strip().upper()
        if not cleaned:
            continue
        if len(cleaned) > 80:
            raise HTTPException(status_code=400, detail="HUD label is too long")
        if cleaned not in normalized:
            normalized.append(cleaned)
    return normalized


async def _ensure_serial_available(serial_number: str | None, *, exclude_id: str | None = None) -> None:
    serial = _normalized_serial(serial_number)
    if not serial:
        return
    query: dict = {"serial_number": serial, "archived": {"$ne": True}}
    if exclude_id:
        query["id"] = {"$ne": exclude_id}
    existing = await get_db().home_inventory.find_one(query, {"_id": 0, "id": 1})
    if existing:
        raise HTTPException(status_code=409, detail="An active inventory record already uses that serial number")


async def _inventory_or_404(inventory_id: str) -> dict:
    document = await get_db().home_inventory.find_one({"id": inventory_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Inventory home not found")
    return document


@router.get("")
async def list_inventory(
    include_archived: bool = Query(default=False),
    _user: dict = Depends(get_current_user),
) -> list[dict]:
    query = {} if include_archived else {"archived": {"$ne": True}}
    return await get_db().home_inventory.find(query, {"_id": 0}).sort(
        [("active", -1), ("display_name", 1)]
    ).to_list(1000)


@router.get("/{inventory_id}")
async def get_inventory(
    inventory_id: str,
    _user: dict = Depends(get_current_user),
) -> dict:
    return await _inventory_or_404(inventory_id)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_inventory(
    payload: InventoryCreate,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    serial = _normalized_serial(payload.serial_number)
    await _ensure_serial_available(serial)
    now = _now()
    data = payload.model_dump()
    data["serial_number"] = serial
    data["hud_labels"] = _normalized_hud_labels(payload.hud_labels)
    document = {
        "id": f"EHS-INV-{str(uuid4()).split('-')[0].upper()}",
        **data,
        "archived": False,
        "created_at": now,
        "updated_at": now,
        "created_by_id": user.get("id"),
        "updated_by_id": user.get("id"),
    }
    await get_db().home_inventory.insert_one(document)
    return _clean(document) or {}


@router.patch("/{inventory_id}")
async def update_inventory(
    inventory_id: str,
    payload: InventoryUpdate,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    update = payload.model_dump(exclude_unset=True)
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    if "serial_number" in update:
        update["serial_number"] = _normalized_serial(update.get("serial_number"))
        await _ensure_serial_available(update["serial_number"], exclude_id=inventory_id)
    if "hud_labels" in update:
        update["hud_labels"] = _normalized_hud_labels(update.get("hud_labels"))
    update["updated_at"] = _now()
    update["updated_by_id"] = user.get("id")
    document = await get_db().home_inventory.find_one_and_update(
        {"id": inventory_id},
        {"$set": update},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    if not document:
        raise HTTPException(status_code=404, detail="Inventory home not found")
    return document


@router.delete("/{inventory_id}")
async def archive_inventory(
    inventory_id: str,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    result = await get_db().home_inventory.update_one(
        {"id": inventory_id},
        {
            "$set": {
                "archived": True,
                "active": False,
                "updated_at": _now(),
                "updated_by_id": user.get("id"),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inventory home not found")
    return {"ok": True, "archived": True}


@router.get("/{inventory_id}/documents")
async def list_documents(
    inventory_id: str,
    _user: dict = Depends(get_current_user),
) -> list[dict]:
    await _inventory_or_404(inventory_id)
    return await get_db().inventory_documents.find(
        {"inventory_id": inventory_id, "deleted": {"$ne": True}},
        {"_id": 0, "gridfs_id": 0},
    ).sort("uploaded_at", -1).to_list(500)


@router.post("/{inventory_id}/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(
    inventory_id: str,
    request: Request,
    category: DocumentCategory = Query(...),
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    await _inventory_or_404(inventory_id)

    filename = (request.headers.get("x-filename") or "document.pdf").strip()
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are allowed")
    if len(filename) > 240:
        raise HTTPException(status_code=400, detail="Filename is too long")

    content_type = (request.headers.get("content-type") or "").split(";", 1)[0].lower()
    if content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Document content type must be application/pdf")

    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="PDF document is empty")
    if len(body) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="PDF document exceeds the 4 MB portal limit")
    if not body.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid PDF")

    document_id = f"EHS-DOC-{str(uuid4()).split('-')[0].upper()}"
    bucket = AsyncIOMotorGridFSBucket(get_db(), bucket_name="inventory_files")
    gridfs_id = await bucket.upload_from_stream(
        filename,
        body,
        metadata={
            "document_id": document_id,
            "inventory_id": inventory_id,
            "category": category,
            "uploaded_by_id": user.get("id"),
            "content_type": "application/pdf",
        },
    )

    metadata = {
        "id": document_id,
        "inventory_id": inventory_id,
        "category": category,
        "filename": filename,
        "content_type": "application/pdf",
        "size_bytes": len(body),
        "gridfs_id": gridfs_id,
        "uploaded_at": _now(),
        "uploaded_by_id": user.get("id"),
        "uploaded_by_name": user.get("name") or user.get("email"),
        "deleted": False,
    }
    try:
        await get_db().inventory_documents.insert_one(metadata)
    except Exception:
        try:
            await bucket.delete(gridfs_id)
        finally:
            raise

    response = dict(metadata)
    response.pop("_id", None)
    response.pop("gridfs_id", None)
    return response


@router.get("/{inventory_id}/documents/{document_id}/download")
async def download_document(
    inventory_id: str,
    document_id: str,
    _user: dict = Depends(get_current_user),
) -> Response:
    await _inventory_or_404(inventory_id)
    metadata = await get_db().inventory_documents.find_one(
        {
            "id": document_id,
            "inventory_id": inventory_id,
            "deleted": {"$ne": True},
        }
    )
    if not metadata:
        raise HTTPException(status_code=404, detail="Inventory document not found")

    if int(metadata.get("size_bytes") or 0) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="Stored PDF exceeds the current portal download limit")

    gridfs_id = metadata.get("gridfs_id")
    if isinstance(gridfs_id, str) and ObjectId.is_valid(gridfs_id):
        gridfs_id = ObjectId(gridfs_id)
    bucket = AsyncIOMotorGridFSBucket(get_db(), bucket_name="inventory_files")
    try:
        stream = await bucket.open_download_stream(gridfs_id)
        body = await stream.read()
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Stored inventory document is unavailable") from exc

    safe_name = str(metadata.get("filename") or "document.pdf").replace('"', "").replace("\r", "").replace("\n", "")
    return Response(
        content=body,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}"',
            "Content-Length": str(len(body)),
            "Cache-Control": "private, no-store",
        },
    )


@router.delete("/{inventory_id}/documents/{document_id}")
async def delete_document(
    inventory_id: str,
    document_id: str,
    user: dict = Depends(require_manager_or_admin),
) -> dict:
    await _inventory_or_404(inventory_id)
    metadata = await get_db().inventory_documents.find_one(
        {"id": document_id, "inventory_id": inventory_id, "deleted": {"$ne": True}}
    )
    if not metadata:
        raise HTTPException(status_code=404, detail="Inventory document not found")

    bucket = AsyncIOMotorGridFSBucket(get_db(), bucket_name="inventory_files")
    try:
        await bucket.delete(metadata.get("gridfs_id"))
    except Exception:
        pass

    await get_db().inventory_documents.update_one(
        {"id": document_id},
        {
            "$set": {
                "deleted": True,
                "deleted_at": _now(),
                "deleted_by_id": user.get("id"),
            }
        },
    )
    return {"ok": True, "deleted": True}
