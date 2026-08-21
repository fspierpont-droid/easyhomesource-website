"""AMHI permitting workspace: permit jobs, documents, and operational tracking."""
from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from pymongo import ReturnDocument

from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/api/permitting", tags=["permitting"])

STATUSES = {
    "Research",
    "Intake",
    "Ready to Submit",
    "Submitted",
    "Corrections",
    "Approved",
    "Inspections",
    "Final / CO",
    "On Hold",
}
PERMIT_TYPES = {
    "Manufactured Home Installation",
    "Historical / After-the-Fact",
    "Replacement Home",
    "Demo / Removal",
    "Electrical",
    "Well",
    "Septic",
    "Driveway / ROW",
    "Other",
}
DOCUMENT_CATEGORIES = {
    "Permit Application",
    "Survey / Site Plan",
    "Deed / Ownership",
    "Property Appraiser",
    "Floor Plan / Elevations",
    "Manufacturer / HUD Documents",
    "Installation Manual",
    "Foundation / Tie-Down Plan",
    "Installer / Contractor License",
    "Septic",
    "Well",
    "Electrical",
    "Driveway / ROW",
    "Impact Fees",
    "Flood / Elevation",
    "Approved Plans",
    "Corrections / Comments",
    "Inspection Report",
    "Certificate of Occupancy / Completion",
    "Photos",
    "Other",
}
MAX_FILE_BYTES = int(os.environ.get("PERMIT_DOCUMENT_MAX_BYTES", str(25 * 1024 * 1024)))
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx", ".xls", ".xlsx"}
BLOCKED_EXTENSIONS = {".exe", ".bat", ".cmd", ".js", ".sh", ".com", ".scr", ".msi", ".dll"}
GRIDFS_BUCKET = "permit_documents"

JOB_FIELDS = {
    "customer_name", "project_name", "address", "city", "state", "zip", "county", "municipality",
    "parcel_number", "jurisdiction", "permit_type", "status", "permit_number", "application_number",
    "quote_id", "project_id", "property_id", "assigned_to", "installer", "submitted_at", "issued_at",
    "expires_at", "target_install_date", "next_action", "notes", "checklist",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _text(value: Any) -> str | None:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def _serialize(doc: dict) -> dict:
    result = dict(doc)
    result.pop("_id", None)
    for key, value in list(result.items()):
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result


def _require_job(job_id: str):
    return {"id": job_id, "archived": {"$ne": True}}


@router.get("/jobs")
async def list_jobs(user: dict = Depends(get_current_user)) -> list[dict]:
    docs = await get_db().permit_jobs.find({"archived": {"$ne": True}}).sort("updated_at", -1).to_list(1000)
    return [_serialize(doc) for doc in docs]


@router.post("/jobs")
async def create_job(payload: dict, user: dict = Depends(get_current_user)) -> dict:
    data = {key: payload.get(key) for key in JOB_FIELDS if key in payload}
    address = _text(data.get("address"))
    county = _text(data.get("county"))
    if not address or not county:
        raise HTTPException(status_code=400, detail="Address and county are required")
    status_value = _text(data.get("status")) or "Research"
    permit_type = _text(data.get("permit_type")) or "Manufactured Home Installation"
    now = _now()
    doc = {
        "id": f"permit-{uuid4()}",
        **data,
        "address": address,
        "county": county,
        "state": _text(data.get("state")) or "FL",
        "status": status_value if status_value in STATUSES else "Research",
        "permit_type": permit_type if permit_type in PERMIT_TYPES else "Other",
        "installer": _text(data.get("installer")) or "Advance Mobile Home Installation",
        "documents": [],
        "archived": False,
        "created_at": now,
        "updated_at": now,
        "created_by": user.get("id"),
        "updated_by": user.get("id"),
    }
    await get_db().permit_jobs.insert_one(doc)
    return _serialize(doc)


@router.patch("/jobs/{job_id}")
async def update_job(job_id: str, payload: dict, user: dict = Depends(get_current_user)) -> dict:
    update = {key: payload.get(key) for key in JOB_FIELDS if key in payload}
    if "status" in update:
        update["status"] = update["status"] if update["status"] in STATUSES else "Research"
    if "permit_type" in update:
        update["permit_type"] = update["permit_type"] if update["permit_type"] in PERMIT_TYPES else "Other"
    update["updated_at"] = _now()
    update["updated_by"] = user.get("id")
    doc = await get_db().permit_jobs.find_one_and_update(
        _require_job(job_id), {"$set": update}, return_document=ReturnDocument.AFTER
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Permit job not found")
    return _serialize(doc)


@router.delete("/jobs/{job_id}")
async def archive_job(job_id: str, user: dict = Depends(get_current_user)) -> dict:
    doc = await get_db().permit_jobs.find_one_and_update(
        _require_job(job_id),
        {"$set": {"archived": True, "updated_at": _now(), "updated_by": user.get("id")}},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Permit job not found")
    return {"ok": True}


@router.post("/jobs/{job_id}/documents")
async def upload_document(
    job_id: str,
    file: UploadFile = File(...),
    category: str = Form("Other"),
    user: dict = Depends(get_current_user),
) -> dict:
    job = await get_db().permit_jobs.find_one(_require_job(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Permit job not found")

    filename = _text(file.filename) or "document"
    ext = os.path.splitext(filename)[1].lower()
    if ext in BLOCKED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read(MAX_FILE_BYTES + 1)
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds the 25 MB permit-document limit")
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")

    document_id = str(uuid4())
    bucket = AsyncIOMotorGridFSBucket(get_db(), bucket_name=GRIDFS_BUCKET)
    gridfs_id = await bucket.upload_from_stream(
        filename,
        content,
        metadata={
            "document_id": document_id,
            "job_id": job_id,
            "category": category if category in DOCUMENT_CATEGORIES else "Other",
            "uploaded_by": user.get("id"),
            "content_type": file.content_type or "application/octet-stream",
        },
    )
    record = {
        "document_id": document_id,
        "gridfs_file_id": str(gridfs_id),
        "filename": filename,
        "category": category if category in DOCUMENT_CATEGORIES else "Other",
        "content_type": file.content_type or "application/octet-stream",
        "size": len(content),
        "uploaded_at": _now(),
        "uploaded_by": user.get("id"),
    }
    await get_db().permit_jobs.update_one(
        _require_job(job_id),
        {"$push": {"documents": record}, "$set": {"updated_at": _now(), "updated_by": user.get("id")}},
    )
    return _serialize(record)


@router.get("/jobs/{job_id}/documents/{document_id}/download")
async def download_document(job_id: str, document_id: str, user: dict = Depends(get_current_user)):
    job = await get_db().permit_jobs.find_one(_require_job(job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Permit job not found")
    record = next((item for item in job.get("documents", []) if item.get("document_id") == document_id and not item.get("archived")), None)
    if not record:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        gridfs_id = ObjectId(record["gridfs_file_id"])
    except Exception as exc:
        raise HTTPException(status_code=404, detail="Stored document reference is invalid") from exc

    bucket = AsyncIOMotorGridFSBucket(get_db(), bucket_name=GRIDFS_BUCKET)
    stream = await bucket.open_download_stream(gridfs_id)

    async def iterator():
        while True:
            chunk = await stream.readchunk()
            if not chunk:
                break
            yield chunk

    safe_name = re.sub(r"[^A-Za-z0-9._ -]", "_", record.get("filename") or "document")
    return StreamingResponse(
        iterator(),
        media_type=record.get("content_type") or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}"'},
    )


@router.delete("/jobs/{job_id}/documents/{document_id}")
async def archive_document(job_id: str, document_id: str, user: dict = Depends(get_current_user)) -> dict:
    result = await get_db().permit_jobs.update_one(
        {"id": job_id, "documents.document_id": document_id, "archived": {"$ne": True}},
        {"$set": {"documents.$.archived": True, "documents.$.archived_at": _now(), "updated_at": _now(), "updated_by": user.get("id")}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"ok": True}
