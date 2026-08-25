"""Insert the initial verified EHS inventory set without overwriting existing data.

This script is intentionally NOT called by application startup. Run it only from
the backend directory against an explicitly selected permanent database. It
inserts missing records and never updates or deletes an existing inventory home.

Example safety-gated invocation:
    INVENTORY_IMPORT_CONFIRM=easyhomesource_production \
    PYTHONPATH=. python scripts/import_verified_home_inventory.py

The confirmation value must exactly match DB_NAME or the script aborts before a
MongoDB write is attempted.
"""
from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from uuid import uuid4

from database import get_db, ping_database


VERIFIED_INVENTORY = (
    {
        "display_name": "Paxton",
        "status": "STATUS_TO_CONFIRM",
    },
    {
        "display_name": "Boujee XL 2",
        "status": "STATUS_TO_CONFIRM",
    },
    {
        "display_name": "Hey Jude",
        "status": "STATUS_TO_CONFIRM",
    },
    {
        "display_name": "Twin Creek",
        "manufacturer": "Timber Creek Housing",
        "serial_number": "TCHAL0102812AB27",
        "floorplan_financing_balance": 184340.00,
        "status": "STATUS_TO_CONFIRM",
    },
    {
        "display_name": "White Oak",
        "manufacturer": "Timber Creek Housing",
        "serial_number": "TCHAL0102805AB27",
        "floorplan_financing_balance": 179592.00,
        "status": "STATUS_TO_CONFIRM",
    },
    {
        "display_name": "Timber Creek — Model to Confirm",
        "manufacturer": "Timber Creek Housing",
        "serial_number": "TCHAL0102739AB27",
        "floorplan_financing_balance": 163639.00,
        "status": "STATUS_TO_CONFIRM",
        "notes": "Physical inventory unit verified by serial number; exact model/name remains unconfirmed.",
    },
)


def _require_explicit_database_confirmation() -> None:
    db_name = (os.environ.get("DB_NAME") or "").strip()
    confirmation = (os.environ.get("INVENTORY_IMPORT_CONFIRM") or "").strip()
    if not db_name:
        raise RuntimeError("DB_NAME is required before the inventory import can run")
    if confirmation != db_name:
        raise RuntimeError(
            "Inventory import blocked. Set INVENTORY_IMPORT_CONFIRM to exactly match DB_NAME "
            f"after verifying the intended target database. Current DB_NAME={db_name!r}."
        )


async def main() -> None:
    _require_explicit_database_confirmation()
    await ping_database()
    db = get_db()
    now = datetime.now(timezone.utc)
    inserted = 0
    skipped = 0

    for source in VERIFIED_INVENTORY:
        serial = source.get("serial_number")
        if serial:
            existing = await db.home_inventory.find_one({"serial_number": serial}, {"_id": 0, "id": 1})
        else:
            existing = await db.home_inventory.find_one(
                {"display_name": source["display_name"], "archived": {"$ne": True}},
                {"_id": 0, "id": 1},
            )

        if existing:
            print(f"SKIP {source['display_name']}: existing record {existing.get('id')}")
            skipped += 1
            continue

        document = {
            "id": f"EHS-INV-{str(uuid4()).split('-')[0].upper()}",
            "manufacturer": None,
            "model_name": None,
            "series": None,
            "serial_number": None,
            "catalog_home_id": None,
            "lot_location": None,
            "notes": "",
            "ehs_retail_price": None,
            "factory_invoice_cost": None,
            "floorplan_financing_balance": None,
            "active": True,
            "archived": False,
            "created_at": now,
            "updated_at": now,
            "created_by_id": "controlled-verified-inventory-import",
            "updated_by_id": "controlled-verified-inventory-import",
            "verification_source": "User-verified EHS inventory list, 2026-08-24",
            **source,
        }
        await db.home_inventory.insert_one(document)
        print(f"INSERT {source['display_name']}: {document['id']}")
        inserted += 1

    print(f"Complete. inserted={inserted} skipped={skipped}")


if __name__ == "__main__":
    asyncio.run(main())
