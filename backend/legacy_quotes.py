"""Read-only bridge for historical quotes from the retired EHS portal.

The current quote engine remains authoritative for all new quotes. Historical
records are copied as immutable snapshots from the retired database into a
separate permanent collection. No legacy record is passed through current
pricing, validation, or quote-save logic.
"""
from __future__ import annotations

import asyncio
import logging
import os
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from functools import lru_cache

import certifi
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from auth import get_current_user
from database import get_client, get_db

logger = logging.getLogger("easyhomesource.legacy_quotes")
router = APIRouter(prefix="/api/legacy-quotes", tags=["legacy-quotes"])

DEFAULT_LEGACY_DB_NAME = "ehs_staging"
LEGACY_COLLECTION = "quotes"
ARCHIVE_COLLECTION = "legacy_quotes"
SYNC_TTL = timedelta(minutes=5)
SYNC_LIMIT = 5000

_sync_lock = asyncio.Lock()
_last_sync_at: datetime | None = None
_last_sync_result: dict | None = None


@lru_cache(maxsize=1)
def _separate_legacy_client() -> AsyncIOMotorClient | None:
    """Return an optional dedicated client when the retired DB uses another cluster."""
    uri = (os.environ.get("LEGACY_MONGO_URL") or "").strip()
    if not uri:
        return None
    return AsyncIOMotorClient(
        uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=15000,
        retryWrites=False,
    )


def get_legacy_db() -> AsyncIOMotorDatabase:
    db_name = (os.environ.get("LEGACY_DB_NAME") or DEFAULT_LEGACY_DB_NAME).strip()
    current_name = (os.environ.get("DB_NAME") or "").strip()
    client = _separate_legacy_client() or get_client()
    if client is get_client() and db_name == current_name:
        raise RuntimeError("Legacy quote database must be separate from the permanent database")
    return client[db_name]


def archive_legacy_quote(source: dict, *, archived_at: str | None = None) -> dict:
    """Create a read-only archive snapshot without recalculating any pricing."""
    document = deepcopy(source)
    mongo_id = document.pop("_id", None)
    source_id = str(document.get("id") or document.get("quote_number") or mongo_id or "").strip()
    if not source_id:
        raise ValueError("Legacy quote is missing an id and quote number")

    original_share_token = document.get("share_token")
    document["id"] = f"legacy:{source_id}"
    document["legacy_source_id"] = source_id
    document["legacy_source_db"] = (os.environ.get("LEGACY_DB_NAME") or DEFAULT_LEGACY_DB_NAME).strip()
    document["legacy_source_collection"] = LEGACY_COLLECTION
    document["legacy_read_only"] = True
    document["pricing_preserved"] = True
    document["legacy_archived_at"] = archived_at or datetime.now(timezone.utc).isoformat()
    document["legacy_original_share_token"] = original_share_token

    # Retired public links must never become live links in the new platform.
    document["share_token"] = None
    document["share_enabled"] = False
    return document


async def sync_legacy_quotes(*, force: bool = False) -> dict:
    """Idempotently copy retired quote snapshots into permanent legacy_quotes."""
    global _last_sync_at, _last_sync_result

    now = datetime.now(timezone.utc)
    if (
        not force
        and _last_sync_at is not None
        and _last_sync_result is not None
        and now - _last_sync_at < SYNC_TTL
    ):
        return dict(_last_sync_result)

    async with _sync_lock:
        now = datetime.now(timezone.utc)
        if (
            not force
            and _last_sync_at is not None
            and _last_sync_result is not None
            and now - _last_sync_at < SYNC_TTL
        ):
            return dict(_last_sync_result)

        target = get_db()[ARCHIVE_COLLECTION]
        source_db_name = (os.environ.get("LEGACY_DB_NAME") or DEFAULT_LEGACY_DB_NAME).strip()
        try:
            source = get_legacy_db()[LEGACY_COLLECTION]
            documents = await source.find({}, {"_id": 0}).sort("updated_at", -1).to_list(SYNC_LIMIT)
            synced = 0
            skipped = 0
            sync_time = now.isoformat()

            for source_document in documents:
                try:
                    archive = archive_legacy_quote(source_document, archived_at=sync_time)
                except ValueError:
                    skipped += 1
                    continue
                await target.replace_one(
                    {"legacy_source_id": archive["legacy_source_id"]},
                    archive,
                    upsert=True,
                )
                synced += 1

            result = {
                "ok": True,
                "source_database": source_db_name,
                "source_count": len(documents),
                "synced_count": synced,
                "skipped_count": skipped,
                "archive_count": await target.count_documents({}),
                "synced_at": sync_time,
            }
        except Exception:
            logger.exception("Legacy quote synchronization failed")
            result = {
                "ok": False,
                "source_database": source_db_name,
                "source_count": None,
                "synced_count": 0,
                "skipped_count": 0,
                "archive_count": await target.count_documents({}),
                "synced_at": now.isoformat(),
                "error": "Legacy quote source is unavailable.",
            }

        _last_sync_at = now
        _last_sync_result = result
        return dict(result)


@router.get("")
async def list_legacy_quotes(_user: dict = Depends(get_current_user)) -> dict:
    sync = await sync_legacy_quotes()
    documents = await get_db()[ARCHIVE_COLLECTION].find({}, {"_id": 0}).sort("updated_at", -1).to_list(SYNC_LIMIT)
    return {"quotes": documents, "sync": sync}


@router.get("/{quote_id}")
async def get_legacy_quote(quote_id: str, _user: dict = Depends(get_current_user)) -> dict:
    await sync_legacy_quotes()
    lookup = quote_id.removeprefix("legacy:")
    document = await get_db()[ARCHIVE_COLLECTION].find_one(
        {
            "$or": [
                {"id": quote_id},
                {"legacy_source_id": lookup},
                {"quote_number": quote_id},
            ]
        },
        {"_id": 0},
    )
    if not document:
        raise HTTPException(status_code=404, detail="Legacy quote not found")
    return document
