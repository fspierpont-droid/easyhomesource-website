"""Apply source-verified operational corrections to the six imported inventory homes.

This script never creates inventory records and is never called by application
startup. It performs a full preflight of all six target records before making
its first write. It must be run from the backend directory against an explicitly
confirmed permanent database.

Example safety-gated invocation:
    INVENTORY_OPERATIONS_CONFIRM=easyhomesource_production \
    PYTHONPATH=. python scripts/correct_verified_home_inventory_operations.py

The confirmation value must exactly match DB_NAME or the script aborts before a
MongoDB write is attempted.
"""
from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone

from database import get_db, ping_database


VERIFICATION_SOURCE = (
    "EHS Monday Inventory — Actual Homes screenshots plus manufacturer documents "
    "reviewed 2026-08-25"
)

CORRECTIONS = (
    {
        "label": "Paxton",
        "lookup": {"display_name": "Paxton"},
        "expected_current_names": {"Paxton"},
        "set": {
            "status": "ON_LOT",
            "invoice_without_freight": 115726.20,
            "freight_financed": 0.0,
            "freight_paid": 0.0,
            "final_invoice_total": 115726.20,
            "financing_provider": "CountryPlace",
            "ordered_date": "2025-08-29",
            "delivered_date": "2025-12-02",
            "estimated_offline_date": "2025-12-02",
        },
    },
    {
        "label": "Boujee XL 2",
        "lookup": {"display_name": "Boujee XL 2"},
        "expected_current_names": {"Boujee XL 2"},
        "set": {
            "manufacturer": "Southern Energy Homes, Inc.",
            "model_name": "44BOU28724BH26",
            "series": "Boujee XL 2",
            "serial_number": "SOU020584ALAB",
            "status": "ON_LOT",
            "invoice_without_freight": 103599.00,
            "freight_financed": 0.0,
            "freight_paid": 11860.00,
            "final_invoice_total": 115459.00,
            "financing_provider": "Triad",
            "ordered_date": "2025-08-29",
            "delivered_date": "2025-11-12",
            "estimated_offline_date": "2025-11-07",
        },
    },
    {
        "label": "Hey Jude",
        "lookup": {"display_name": "Hey Jude"},
        "expected_current_names": {"Hey Jude"},
        "set": {
            "manufacturer": "Southern Energy Homes, Inc.",
            "model_name": "44TPO28724AH26",
            "series": "Tempo Series",
            "serial_number": "SOU020585ALAB",
            "status": "ON_LOT",
            "invoice_without_freight": 88115.00,
            "freight_financed": 11008.00,
            "freight_paid": 0.0,
            "final_invoice_total": 99123.00,
            "financing_provider": "Triad",
            "ordered_date": "2025-08-29",
            "delivered_date": "2025-11-14",
            "estimated_offline_date": "2025-11-11",
        },
    },
    {
        "label": "Twin Creek",
        "lookup": {"serial_number": "TCHAL0102812AB27"},
        "expected_current_names": {"Twin Creek"},
        "set": {
            "status": "ON_LOT",
            "invoice_without_freight": 166594.00,
            "freight_financed": 14440.00,
            "freight_paid": 14440.00,
            "final_invoice_total": 195474.00,
            "financing_provider": "TBD",
        },
    },
    {
        "label": "Delilah",
        "lookup": {"serial_number": "TCHAL0102739AB27"},
        "expected_current_names": {"Timber Creek — Model to Confirm", "Delilah"},
        "set": {
            "display_name": "Delilah",
            "status": "ON_LOT",
            "invoice_without_freight": 148249.00,
            "freight_financed": 15390.00,
            "freight_paid": 0.0,
            "final_invoice_total": 163639.00,
            "financing_provider": "TBD",
        },
    },
    {
        "label": "White Oak",
        "lookup": {"serial_number": "TCHAL0102805AB27"},
        "expected_current_names": {"White Oak"},
        "set": {
            "status": "ON_LOT",
            "invoice_without_freight": 161846.00,
            "freight_financed": 0.0,
            "freight_paid": 15390.00,
            "final_invoice_total": 177236.00,
            "financing_provider": "TBD",
        },
    },
)


def _require_explicit_correction_confirmation() -> None:
    db_name = (os.environ.get("DB_NAME") or "").strip()
    confirmation = (os.environ.get("INVENTORY_OPERATIONS_CONFIRM") or "").strip()
    if not db_name:
        raise RuntimeError("DB_NAME is required before inventory corrections can run")
    if confirmation != db_name:
        raise RuntimeError(
            "Inventory correction blocked. Set INVENTORY_OPERATIONS_CONFIRM to exactly match "
            f"DB_NAME after verifying the intended target database. Current DB_NAME={db_name!r}."
        )


def _validate_cost_breakdown(fields: dict) -> None:
    invoice = float(fields["invoice_without_freight"])
    financed = float(fields["freight_financed"])
    paid = float(fields["freight_paid"])
    final = float(fields["final_invoice_total"])
    if abs((invoice + financed + paid) - final) > 0.01:
        raise RuntimeError(
            "Verified cost breakdown does not reconcile: "
            f"{invoice} + {financed} + {paid} != {final}"
        )


async def _preflight(db) -> list[tuple[dict, dict]]:
    resolved: list[tuple[dict, dict]] = []
    seen_ids: set[str] = set()

    for correction in CORRECTIONS:
        _validate_cost_breakdown(correction["set"])
        query = {**correction["lookup"], "archived": {"$ne": True}}
        matches = await db.home_inventory.find(query, {"_id": 0}).to_list(3)
        if len(matches) != 1:
            raise RuntimeError(
                f"Preflight failed for {correction['label']}: expected exactly one active record, "
                f"found {len(matches)}"
            )

        record = matches[0]
        record_id = str(record.get("id") or "")
        if not record_id or record_id in seen_ids:
            raise RuntimeError(f"Preflight failed for {correction['label']}: invalid or duplicate record id")
        seen_ids.add(record_id)

        current_name = str(record.get("display_name") or "")
        if current_name not in correction["expected_current_names"]:
            raise RuntimeError(
                f"Preflight failed for {correction['label']}: unexpected current name {current_name!r}"
            )

        desired_serial = correction["set"].get("serial_number")
        if desired_serial:
            current_serial = record.get("serial_number")
            if current_serial not in (None, "", desired_serial):
                raise RuntimeError(
                    f"Preflight failed for {correction['label']}: current serial {current_serial!r} "
                    f"does not match verified serial {desired_serial!r}"
                )
            conflict = await db.home_inventory.find_one(
                {
                    "serial_number": desired_serial,
                    "id": {"$ne": record_id},
                    "archived": {"$ne": True},
                },
                {"_id": 0, "id": 1, "display_name": 1},
            )
            if conflict:
                raise RuntimeError(
                    f"Preflight failed for {correction['label']}: verified serial already belongs to "
                    f"{conflict.get('display_name') or conflict.get('id')}"
                )

        resolved.append((record, correction))

    return resolved


async def main() -> None:
    _require_explicit_correction_confirmation()
    await ping_database()
    db = get_db()
    resolved = await _preflight(db)

    print(f"Preflight complete. verified_targets={len(resolved)} writes=0")
    now = datetime.now(timezone.utc)

    for record, correction in resolved:
        update = {
            **correction["set"],
            "updated_at": now,
            "updated_by_id": "controlled-inventory-operations-correction",
            "operations_verification_source": VERIFICATION_SOURCE,
            "operations_verified_at": now,
        }
        result = await db.home_inventory.update_one({"id": record["id"]}, {"$set": update})
        if result.matched_count != 1:
            raise RuntimeError(
                f"Write failed for {correction['label']}: target record changed after preflight"
            )
        print(f"UPDATE {correction['label']}: {record['id']}")

    print(f"Complete. updated={len(resolved)} created=0 deleted=0")


if __name__ == "__main__":
    asyncio.run(main())
