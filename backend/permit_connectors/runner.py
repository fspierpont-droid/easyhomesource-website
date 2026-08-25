"""Select and execute allow-listed permit portal checks for active AMHI jobs."""
from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from typing import Mapping

from permit_monitoring import record_external_observation, record_monitor_issue

from .accela import AccelaConnector
from .base import ConnectorConfigurationError, ConnectorRequestError, RecordNotFoundError
from .registry import SUPPORTED_CONNECTORS, get_connector_spec

MAX_JOBS_PER_RUN = 250
REQUEST_SPACING_SECONDS = 0.25


def _now() -> datetime:
    return datetime.now(timezone.utc)


def default_connector_for_county(county: str | None) -> str | None:
    key = str(county or "").strip().lower()
    matches = [spec.id for spec in SUPPORTED_CONNECTORS.values() if spec.county.lower() == key]
    return matches[0] if len(matches) == 1 else None


def connector_id_for_job(job: dict) -> str | None:
    explicit = str(job.get("portal_connector_id") or "").strip().lower()
    return explicit or default_connector_for_county(job.get("county"))


def external_record_id_for_job(job: dict) -> str | None:
    for field in ("external_record_id", "permit_number", "application_number"):
        value = str(job.get(field) or "").strip()
        if value:
            return value
    return None


def connector_is_configured(connector_id: str | None, environ: Mapping[str, str] | None = None) -> bool:
    spec = get_connector_spec(connector_id or "")
    if not spec:
        return False
    values = environ if environ is not None else os.environ
    return all(str(values.get(name, "")).strip() for name in (spec.app_id_env, spec.agency_env, spec.environment_env))


async def sync_connector_registry(db) -> None:
    """Persist only non-secret allowlist metadata for operational visibility."""
    timestamp = _now()
    for spec in SUPPORTED_CONNECTORS.values():
        await db.permit_portal_connectors.update_one(
            {"id": spec.id},
            {
                "$set": {
                    "id": spec.id,
                    "provider": spec.provider,
                    "county": spec.county,
                    "api_hostname": spec.api_hostname,
                    "portal_url": spec.portal_url,
                    "active": True,
                    "updated_at": timestamp,
                }
            },
            upsert=True,
        )


async def _eligible_jobs(db, *, job_id: str | None = None) -> list[dict]:
    query: dict = {"archived": {"$ne": True}, "monitor_enabled": True}
    if job_id:
        query["id"] = job_id
    return await db.permit_jobs.find(query).sort("external_last_checked_at", 1).to_list(MAX_JOBS_PER_RUN)


async def run_monitor(
    db,
    *,
    execute: bool = False,
    job_id: str | None = None,
    environ: Mapping[str, str] | None = None,
) -> dict:
    """Run one monitor pass. Defaults to dry-run and performs no network/writes."""
    values = environ if environ is not None else os.environ
    jobs = await _eligible_jobs(db, job_id=job_id)
    plan = []
    for job in jobs:
        connector_id = connector_id_for_job(job)
        external_record_id = external_record_id_for_job(job)
        plan.append({
            "permit_job_id": job.get("id"),
            "county": job.get("county"),
            "connector_id": connector_id,
            "external_record_id_present": bool(external_record_id),
            "connector_configured": connector_is_configured(connector_id, values),
        })

    if not execute:
        return {
            "mode": "dry-run",
            "eligible_jobs": len(jobs),
            "plan": plan,
        }

    await sync_connector_registry(db)
    summary = {
        "mode": "execute",
        "eligible_jobs": len(jobs),
        "checked": 0,
        "healthy": 0,
        "manual_required": 0,
        "errors": 0,
        "results": [],
    }

    for job in jobs:
        permit_job_id = str(job.get("id") or "")
        connector_id = connector_id_for_job(job)
        external_record_id = external_record_id_for_job(job)
        spec = get_connector_spec(connector_id or "")

        if not connector_id or not spec:
            await record_monitor_issue(
                db,
                permit_job_id=permit_job_id,
                state="manual_required",
                message="No supported allow-listed portal connector is available for this job.",
                connector_id=connector_id,
            )
            summary["manual_required"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "manual_required"})
            continue

        if not external_record_id:
            await record_monitor_issue(
                db,
                permit_job_id=permit_job_id,
                state="manual_required",
                message="A permit or application number is required before portal monitoring can run.",
                connector_id=connector_id,
            )
            summary["manual_required"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "manual_required"})
            continue

        try:
            if spec.provider != "accela":
                raise ConnectorConfigurationError("Unsupported connector provider")
            connector = AccelaConnector.from_environment(spec, values)
            result = await asyncio.to_thread(connector.fetch_record, external_record_id)
            await record_external_observation(
                db,
                permit_job_id=permit_job_id,
                connector_id=connector_id,
                external_record_id=result["external_record_id"],
                observation=result["observation"],
                source_url=result["source_url"],
            )
            summary["checked"] += 1
            summary["healthy"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "healthy"})
        except ConnectorConfigurationError:
            await record_monitor_issue(
                db,
                permit_job_id=permit_job_id,
                state="manual_required",
                message="The approved portal connector is not fully configured on the server.",
                connector_id=connector_id,
            )
            summary["manual_required"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "manual_required"})
        except RecordNotFoundError:
            await record_monitor_issue(
                db,
                permit_job_id=permit_job_id,
                state="manual_required",
                message="No exact public portal record matched the configured permit/application number.",
                connector_id=connector_id,
            )
            summary["manual_required"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "manual_required"})
        except ConnectorRequestError:
            await record_monitor_issue(
                db,
                permit_job_id=permit_job_id,
                state="error",
                message="The public permit portal could not be checked successfully.",
                connector_id=connector_id,
            )
            summary["errors"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "error"})
        except Exception:
            await record_monitor_issue(
                db,
                permit_job_id=permit_job_id,
                state="error",
                message="The permit monitor encountered an unexpected connector error.",
                connector_id=connector_id,
            )
            summary["errors"] += 1
            summary["results"].append({"permit_job_id": permit_job_id, "state": "error"})

        await asyncio.sleep(REQUEST_SPACING_SECONDS)

    return summary
