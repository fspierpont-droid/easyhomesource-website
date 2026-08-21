"""MongoDB connection and indexes for the permanent Easy HomeSource backend."""
from __future__ import annotations

import os
from functools import lru_cache

import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


def _required_env(name: str) -> str:
    value = (os.environ.get(name) or "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


@lru_cache(maxsize=1)
def get_client() -> AsyncIOMotorClient:
    return AsyncIOMotorClient(
        _required_env("MONGO_URL"),
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=15000,
        retryWrites=True,
    )


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[_required_env("DB_NAME")]


async def ping_database() -> None:
    await get_db().command("ping")


async def ensure_indexes() -> None:
    """Create indexes required by the permanent platform.

    This is intentionally additive. It never drops collections, removes data, or
    rewrites migrated records.
    """
    db = get_db()

    await db.users.create_index("id", unique=True)
    await db.users.create_index("email", unique=True)
    await db.users.create_index([("role", 1), ("active", 1)])
    await db.users.create_index("ghl_user_id")

    await db.customers.create_index("id", unique=True)
    await db.customers.create_index("email")
    await db.customers.create_index("ghl_contact_id")

    await db.homes.create_index("id", unique=True, sparse=True)
    await db.homes.create_index([("manufacturer", 1), ("series", 1), ("model_name", 1)])

    await db.quotes.create_index("id", unique=True)
    await db.quotes.create_index("quote_number", unique=True)
    await db.quotes.create_index("customer_id")
    await db.quotes.create_index("associate_id")
    await db.quotes.create_index([("updated_at", -1)])

    await db.legacy_quotes.create_index("legacy_source_id", unique=True)
    await db.legacy_quotes.create_index("quote_number")
    await db.legacy_quotes.create_index([("updated_at", -1)])
    await db.legacy_quotes.create_index([("legacy_archived_at", -1)])

    await db.projects.create_index("id", unique=True)
    await db.projects.create_index("associate_id")
    await db.projects.create_index([("archived", 1), ("updated_at", -1)])

    await db.properties.create_index("id", unique=True)
    await db.properties.create_index([("archived", 1), ("display_order", 1)])
    await db.properties.create_index([("public_visible", 1), ("status", 1)])

    await db.home_inventory.create_index("id", unique=True)
    await db.home_inventory.create_index([("active", 1), ("archived", 1), ("updated_at", -1)])
    await db.home_inventory.create_index("catalog_home_id")
    await db.home_inventory.create_index("customer_id")
    await db.home_inventory.create_index("quote_id")

    await db.key_contacts.create_index("id", unique=True)
    await db.key_contacts.create_index([("active", 1), ("priority", -1), ("category", 1)])

    await db.permit_jobs.create_index("id", unique=True)
    await db.permit_jobs.create_index([("archived", 1), ("status", 1), ("updated_at", -1)])
    await db.permit_jobs.create_index("county")
    await db.permit_jobs.create_index("parcel_number")
    await db.permit_jobs.create_index("permit_number")
    await db.permit_jobs.create_index("project_id")
    await db.permit_jobs.create_index("property_id")
    await db.permit_jobs.create_index("quote_id")

    await db.audit_logs.create_index([("timestamp", -1)])
    await db.audit_logs.create_index([("actor_user_id", 1), ("timestamp", -1)])
    await db.audit_logs.create_index([("resource_type", 1), ("resource_id", 1), ("timestamp", -1)])

    await db.rate_limits.create_index("key", unique=True)
    await db.rate_limits.create_index("reset_at", expireAfterSeconds=0)

    await db.integration_connections.create_index("provider")
    await db.integration_sync_events.create_index([("provider", 1), ("created_at", -1)])
    await db.integration_event_receipts.create_index(
        [("provider", 1), ("external_event_id", 1)], unique=True
    )
