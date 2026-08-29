"""Administrative read APIs for the permanent Easy HomeSource platform."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from auth import require_admin
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/audit-logs")
async def list_audit_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    action: str | None = Query(default=None, max_length=120),
    success: bool | None = Query(default=None),
    _admin: dict = Depends(require_admin),
) -> dict:
    """Return newest-first audit activity using bounded server-side pagination."""
    query: dict = {}
    if action:
        query["action"] = action.strip()
    if success is not None:
        query["success"] = success

    collection = get_db().audit_logs
    total = await collection.count_documents(query)
    skip = (page - 1) * page_size
    items = await (
        collection.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .skip(skip)
        .limit(page_size)
        .to_list(page_size)
    )

    total_pages = max(1, (total + page_size - 1) // page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }
