"""AMHI external permit-portal observation and audit primitives.

This module deliberately performs no network requests. Portal connectors supply
validated observations later; this layer normalizes, snapshots, compares, and
records those observations without overwriting the human EHS workflow status.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

MONITOR_ACTOR = "system:permit-monitor"
MONITOR_STATES = {
    "not_configured",
    "pending",
    "healthy",
    "stale",
    "manual_required",
    "error",
}

OBSERVATION_FIELDS = (
    "status",
    "status_detail",
    "review_stage",
    "issued_date",
    "expiration_date",
    "inspection_status",
    "inspection_result",
    "fees_status",
    "portal_updated_at",
    "public_comments",
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clean_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def normalize_observation(payload: dict[str, Any]) -> dict[str, str | None]:
    """Return a stable, allow-listed representation of one portal observation."""
    return {field: _clean_text(payload.get(field)) for field in OBSERVATION_FIELDS}


def snapshot_digest(observation: dict[str, Any]) -> str:
    """Create a deterministic digest for material external permit fields."""
    normalized = normalize_observation(observation)
    encoded = json.dumps(normalized, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def material_changes(
    previous: dict[str, Any] | None,
    current: dict[str, Any],
) -> dict[str, dict[str, str | None]]:
    """Describe field-level external changes without touching the EHS job status."""
    before = normalize_observation(previous or {})
    after = normalize_observation(current)
    return {
        field: {"before": before[field], "after": after[field]}
        for field in OBSERVATION_FIELDS
        if before[field] != after[field]
    }


async def append_permit_event(
    db,
    *,
    permit_job_id: str,
    event_type: str,
    actor: str,
    source: str,
    details: dict[str, Any] | None = None,
    created_at: datetime | None = None,
) -> dict[str, Any]:
    """Append an immutable permit event. No update/delete helper is exposed."""
    event = {
        "id": f"permit-event-{uuid4()}",
        "permit_job_id": permit_job_id,
        "event_type": event_type,
        "actor": actor,
        "source": source,
        "details": details or {},
        "created_at": created_at or _now(),
    }
    await db.permit_events.insert_one(event)
    return event


async def record_external_observation(
    db,
    *,
    permit_job_id: str,
    connector_id: str,
    external_record_id: str,
    observation: dict[str, Any],
    source_url: str | None = None,
    actor: str = MONITOR_ACTOR,
    observed_at: datetime | None = None,
) -> dict[str, Any]:
    """Persist one connector observation and update external-only job fields.

    The human `permit_jobs.status` field is intentionally never written here.
    `source_url` is metadata only; this function never fetches it. Future
    connectors must supply source URLs from an allow-listed connector registry.
    """
    job = await db.permit_jobs.find_one({"id": permit_job_id, "archived": {"$ne": True}})
    if not job:
        raise ValueError("Permit job not found")

    connector_id = _clean_text(connector_id) or ""
    external_record_id = _clean_text(external_record_id) or ""
    if not connector_id or not external_record_id:
        raise ValueError("Connector ID and external record ID are required")

    timestamp = observed_at or _now()
    normalized = normalize_observation(observation)
    digest = snapshot_digest(normalized)
    previous = await db.permit_external_snapshots.find_one(
        {"permit_job_id": permit_job_id},
        sort=[("observed_at", -1)],
    )
    previous_observation = previous.get("observation") if previous else None
    changes = material_changes(previous_observation, normalized)

    snapshot = {
        "id": f"permit-snapshot-{uuid4()}",
        "permit_job_id": permit_job_id,
        "connector_id": connector_id,
        "external_record_id": external_record_id,
        "source_url": _clean_text(source_url),
        "observation": normalized,
        "snapshot_hash": digest,
        "observed_at": timestamp,
    }
    await db.permit_external_snapshots.insert_one(snapshot)

    external_update: dict[str, Any] = {
        "portal_connector_id": connector_id,
        "external_record_id": external_record_id,
        "external_status": normalized.get("status"),
        "external_status_detail": normalized.get("status_detail"),
        "external_source_url": _clean_text(source_url),
        "external_snapshot_hash": digest,
        "external_last_checked_at": timestamp,
        "external_monitor_state": "healthy",
        "updated_at": timestamp,
        "updated_by": actor,
    }
    if previous is None or changes:
        external_update["external_last_changed_at"] = timestamp

    await db.permit_jobs.update_one(
        {"id": permit_job_id, "archived": {"$ne": True}},
        {"$set": external_update},
    )

    event = None
    if previous is None:
        event = await append_permit_event(
            db,
            permit_job_id=permit_job_id,
            event_type="external_baseline_recorded",
            actor=actor,
            source="permit_portal",
            details={
                "connector_id": connector_id,
                "external_record_id": external_record_id,
                "snapshot_hash": digest,
            },
            created_at=timestamp,
        )
    elif changes:
        event = await append_permit_event(
            db,
            permit_job_id=permit_job_id,
            event_type="external_portal_changed",
            actor=actor,
            source="permit_portal",
            details={
                "connector_id": connector_id,
                "external_record_id": external_record_id,
                "changes": changes,
                "snapshot_hash": digest,
            },
            created_at=timestamp,
        )

    return {
        "snapshot": snapshot,
        "changes": changes,
        "event": event,
        "human_status_unchanged": True,
    }
