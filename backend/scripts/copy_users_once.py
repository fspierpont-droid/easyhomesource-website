"""Copy employee user documents from the legacy EHS database to the permanent database.

This utility is intentionally narrow and conservative:
- reads only the source `users` collection;
- writes only the destination `users` collection;
- never deletes or updates source records;
- preserves existing documents, including bcrypt password hashes and identifiers;
- refuses to run if source and destination databases are the same;
- refuses conflicting destination records instead of overwriting them;
- is safe to re-run when destination copies are already identical.

Required environment variables:
    SOURCE_DB_NAME
    DB_NAME
    MONGO_URL

Optional:
    SOURCE_MONGO_URL  (defaults to MONGO_URL when source/destination use same cluster)

Never pass credentials on the command line. Supply them only as environment variables.
"""
from __future__ import annotations

import asyncio
import os
import sys
from typing import Any

import certifi
from motor.motor_asyncio import AsyncIOMotorClient


def required_env(name: str) -> str:
    value = (os.environ.get(name) or "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


def comparable_user(document: dict[str, Any]) -> dict[str, Any]:
    """Return fields that must remain identical for authentication continuity."""
    return {
        "_id": document.get("_id"),
        "id": document.get("id"),
        "email": document.get("email"),
        "password_hash": document.get("password_hash"),
        "name": document.get("name"),
        "phone": document.get("phone"),
        "role": document.get("role"),
        "active": document.get("active", True),
        "ghl_linked": document.get("ghl_linked"),
        "ghl_user_id": document.get("ghl_user_id"),
        "ghl_user_email": document.get("ghl_user_email"),
        "ghl_location_id": document.get("ghl_location_id"),
        "ghl_company_id": document.get("ghl_company_id"),
    }


async def main() -> int:
    source_uri = (os.environ.get("SOURCE_MONGO_URL") or required_env("MONGO_URL")).strip()
    destination_uri = required_env("MONGO_URL")
    source_db_name = required_env("SOURCE_DB_NAME")
    destination_db_name = required_env("DB_NAME")

    if source_uri == destination_uri and source_db_name == destination_db_name:
        raise RuntimeError("Source and destination databases must be different")

    source_client = AsyncIOMotorClient(
        source_uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=15000,
        retryWrites=True,
    )
    destination_client = AsyncIOMotorClient(
        destination_uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=15000,
        connectTimeoutMS=15000,
        retryWrites=True,
    )

    try:
        await source_client[source_db_name].command("ping")
        await destination_client[destination_db_name].command("ping")

        source = source_client[source_db_name].users
        destination = destination_client[destination_db_name].users

        source_users = await source.find({}).to_list(length=None)
        if not source_users:
            raise RuntimeError("Source users collection is empty; refusing to copy")

        for user in source_users:
            if not user.get("id") or not user.get("email") or not user.get("password_hash"):
                raise RuntimeError("Source user is missing id, email, or password_hash; refusing to copy")

        inserted = 0
        already_identical = 0

        for user in source_users:
            existing = await destination.find_one(
                {
                    "$or": [
                        {"_id": user.get("_id")},
                        {"id": user["id"]},
                        {"email": user["email"]},
                    ]
                }
            )
            if existing:
                if comparable_user(existing) != comparable_user(user):
                    raise RuntimeError(
                        "Destination contains a conflicting employee record; no overwrite was performed"
                    )
                already_identical += 1
                continue

            await destination.insert_one(dict(user))
            inserted += 1

        destination_users = await destination.find({}).to_list(length=None)
        destination_by_id = {user.get("id"): user for user in destination_users}

        for source_user in source_users:
            copied = destination_by_id.get(source_user.get("id"))
            if not copied or comparable_user(copied) != comparable_user(source_user):
                raise RuntimeError("Post-copy verification failed")

        print("Employee copy verified successfully.")
        print(f"Source users: {len(source_users)}")
        print(f"Inserted: {inserted}")
        print(f"Already identical: {already_identical}")
        print("Verified identity fields and password hashes: yes")
        return 0
    finally:
        source_client.close()
        destination_client.close()


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except Exception as exc:
        print(f"Employee copy aborted: {exc}", file=sys.stderr)
        raise SystemExit(1)
