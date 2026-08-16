"""Read-only verification for the EHS database copy.

This script NEVER writes to either database. It compares collection counts and
checks critical identity invariants after a separate mongodump/mongorestore
copy has been performed.
"""
from __future__ import annotations

import asyncio
import os
import sys
from dataclasses import dataclass

import certifi
from motor.motor_asyncio import AsyncIOMotorClient

CRITICAL_COLLECTIONS = (
    "users",
    "customers",
    "quotes",
    "projects",
    "homes",
    "properties",
    "home_inventory",
    "key_contacts",
    "settings",
    "audit_logs",
)


@dataclass(frozen=True)
class DatabaseTarget:
    uri_env: str
    db_env: str

    @property
    def uri(self) -> str:
        value = (os.environ.get(self.uri_env) or "").strip()
        if not value:
            raise RuntimeError(f"{self.uri_env} is required")
        return value

    @property
    def db_name(self) -> str:
        value = (os.environ.get(self.db_env) or "").strip()
        if not value:
            raise RuntimeError(f"{self.db_env} is required")
        return value


SOURCE = DatabaseTarget("SOURCE_MONGO_URL", "SOURCE_DB_NAME")
DESTINATION = DatabaseTarget("DEST_MONGO_URL", "DEST_DB_NAME")


def client(uri: str) -> AsyncIOMotorClient:
    return AsyncIOMotorClient(
        uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=15000,
    )


async def collection_counts(db) -> dict[str, int]:
    existing = set(await db.list_collection_names())
    return {
        name: await db[name].count_documents({}) if name in existing else 0
        for name in CRITICAL_COLLECTIONS
    }


async def verify_users(source_db, destination_db) -> list[str]:
    errors: list[str] = []

    source_users = await source_db.users.find(
        {}, {"_id": 0, "id": 1, "email": 1, "password_hash": 1, "password": 1, "active": 1}
    ).to_list(5000)
    destination_users = await destination_db.users.find(
        {}, {"_id": 0, "id": 1, "email": 1, "password_hash": 1, "password": 1, "active": 1}
    ).to_list(5000)

    source_by_id = {user.get("id"): user for user in source_users if user.get("id")}
    destination_by_id = {user.get("id"): user for user in destination_users if user.get("id")}

    if set(source_by_id) != set(destination_by_id):
        errors.append("Employee user IDs differ between source and destination.")

    for user_id, source_user in source_by_id.items():
        destination_user = destination_by_id.get(user_id)
        if not destination_user:
            continue
        if source_user.get("email") != destination_user.get("email"):
            errors.append(f"Employee email changed during copy for user id {user_id}.")
        if source_user.get("password_hash") != destination_user.get("password_hash"):
            errors.append(f"Password hash changed during copy for user id {user_id}.")
        if not destination_user.get("password_hash"):
            errors.append(f"Destination employee is missing a password hash for user id {user_id}.")
        if destination_user.get("password") is not None:
            errors.append(f"Destination contains a plaintext password field for user id {user_id}.")

    return errors


async def run() -> int:
    source_client = client(SOURCE.uri)
    destination_client = client(DESTINATION.uri)
    try:
        source_db = source_client[SOURCE.db_name]
        destination_db = destination_client[DESTINATION.db_name]

        await source_db.command("ping")
        await destination_db.command("ping")

        source_counts = await collection_counts(source_db)
        destination_counts = await collection_counts(destination_db)

        print("EHS database-copy verification (read only)")
        print(f"Source database: {SOURCE.db_name}")
        print(f"Destination database: {DESTINATION.db_name}")
        print("")

        errors: list[str] = []
        for collection in CRITICAL_COLLECTIONS:
            source_count = source_counts[collection]
            destination_count = destination_counts[collection]
            marker = "OK" if source_count == destination_count else "MISMATCH"
            print(f"{marker:8} {collection:24} source={source_count:<6} destination={destination_count:<6}")
            if source_count != destination_count:
                errors.append(
                    f"Collection count mismatch for {collection}: source={source_count}, destination={destination_count}"
                )

        errors.extend(await verify_users(source_db, destination_db))

        if errors:
            print("\nVERIFICATION FAILED")
            for error in errors:
                print(f"- {error}")
            return 1

        print("\nVERIFICATION PASSED")
        print("Critical collection counts match and employee identity/password hashes were preserved.")
        return 0
    finally:
        source_client.close()
        destination_client.close()


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(run())
    except Exception as exc:
        print(f"Verification could not complete: {exc.__class__.__name__}: {exc}", file=sys.stderr)
        exit_code = 2
    raise SystemExit(exit_code)
