"""Controlled import of the 2026-08-26 EHS Property Packages lead list.

Source material is the user-provided EHS WhatsApp thread plus the Apple Maps
"EHS Land/home Deals" guide. This script is intentionally NOT called by
application startup.

Safety behavior:
- requires PROPERTY_IMPORT_CONFIRM to exactly match DB_NAME;
- defaults to DRY RUN unless PROPERTY_IMPORT_APPLY=YES;
- validates every source row through the production PropertyCreate schema;
- checks all current property records before writing and skips address matches;
- inserts all new rows as INTERNAL ONLY (public_visible=False);
- attempts server-side Google geocoding when GOOGLE_MAPS_API_KEY is available;
- never updates, archives, deletes, or publishes an existing property.

Example review-only run from backend/:
    PROPERTY_IMPORT_CONFIRM=easyhomesource_production \
    PYTHONPATH=. python scripts/import_property_package_leads_20260826.py

Apply only after reviewing the printed plan:
    PROPERTY_IMPORT_CONFIRM=easyhomesource_production \
    PROPERTY_IMPORT_APPLY=YES \
    PYTHONPATH=. python scripts/import_property_package_leads_20260826.py
"""
from __future__ import annotations

import asyncio
import os
import re
from datetime import datetime, timezone
from uuid import uuid4

from database import get_db, ping_database
from delivery import _google_geocode, _maps_key
from properties import PropertyCreate


SOURCE_LABEL = "EHS WhatsApp + Apple Maps property lead list, 2026-08-26"

PROPERTY_LEADS = (
    {
        "street": "6645 W Erlen Ln",
        "city": "Homosassa",
        "state": "FL",
        "zip": "34446",
        "county": "Citrus",
        "status": "AVAILABLE",
        "property_type": "HOME",
        "lot_size": "Approx. 0.23 acres",
        "parcel_number": "1520002",
        "notes_internal": "Team note: finished home, ready on market. Public records still show the prior unimproved-land state, so operational EHS status takes precedence.",
    },
    {
        "street": "3219 Welsh St",
        "city": "Spring Hill",
        "state": "FL",
        "zip": "34606",
        "county": "Hernando",
        "status": "AVAILABLE",
        "property_type": "HOME",
        "bedrooms": 3,
        "bathrooms": 2,
        "square_feet": 1152,
        "notes_internal": "Team note: finished home, ready on market. Current public listing identifies a new 2025 Legacy Homes doublewide.",
    },
    {
        "street": "18810 Saint Paul Dr",
        "city": "Spring Hill",
        "state": "FL",
        "zip": "34610",
        "county": "Pasco",
        "status": "AVAILABLE",
        "property_type": "HOME",
        "bedrooms": 4,
        "bathrooms": 2,
        "square_feet": 1976,
        "lot_size": "Approx. 1.01 acres",
        "notes_internal": "Team note: finished home, ready on market.",
    },
    {
        "street": "18034 Ferry Ave",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34604",
        "county": "Hernando",
        "status": "UNDER_CONTRACT",
        "property_type": "HOME",
        "notes_internal": "Team note: work in progress / expected ready in a few months. Follow-up message states Ferry is under contract.",
    },
    {
        "street": "26007 Shangri Dr",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34601",
        "county": "Hernando",
        "status": "COMING_SOON",
        "property_type": "HOME",
        "lot_size": "Approx. 0.25 acres",
        "notes_internal": "Team note: flip/stick-home work in progress; expected ready in a few months.",
    },
    {
        "street": "7112 Fitzpatrick Ave",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34613",
        "county": "Hernando",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "notes_internal": "Team note: vacant lot. Apple Maps guide labels the location as Fitzpatrick Ave.",
    },
    {
        "street": "9248 Denmarsh Dr",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34613",
        "county": "Hernando",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "lot_size": "Approx. 0.16 acres",
        "parcel_number": "R27-222-18-1474-0600-0080",
        "notes_internal": "Team note: vacant lot.",
    },
    {
        "street": "9254 Denmarsh Dr",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34613",
        "county": "Hernando",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "lot_size": "Approx. 0.16 acres",
        "parcel_number": "R27-222-18-1474-0600-0090",
        "notes_internal": "Team note: vacant lot. Public records identify Brookridge Community residential land.",
    },
    {
        "street": "9868 Lake Dr",
        "city": "Weeki Wachee",
        "state": "FL",
        "zip": "34613",
        "county": "Hernando",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "notes_internal": "Team note: vacant lot. Mailing locality normalized to Weeki Wachee / 34613 for mapping.",
    },
    {
        "street": "9862 Lake Dr",
        "city": "Weeki Wachee",
        "state": "FL",
        "zip": "34613",
        "county": "Hernando",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "lot_size": "Approx. 0.27 acres",
        "notes_internal": "Team note: vacant lot. Screenshot showed an inconsistent Spring Hill / 34446 locality; verified mailing locality is Weeki Wachee, FL 34613.",
    },
    {
        "street": "26314 Glenwood Dr",
        "city": "Wesley Chapel",
        "state": "FL",
        "zip": "33544",
        "county": "Pasco",
        "status": "COMING_SOON",
        "property_type": "HOME",
        "bedrooms": 3,
        "bathrooms": 1,
        "square_feet": 1204,
        "lot_size": "Approx. 0.58 acres",
        "notes_internal": "Team note: flip/stick home about to finish or begin work. Screenshot called the city Zephyrhills; current postal/listing locality is Wesley Chapel, FL 33544.",
    },
    {
        "street": "5043 Southtowne Loop",
        "city": "New Port Richey",
        "state": "FL",
        "zip": "34652",
        "county": "Pasco",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "units": 15,
        "notes_internal": "Team note: 15 vacant lots described as on-stilts lots. Units represents the team-reported lot count; confirm parcel-by-parcel details before public marketing.",
    },
    {
        "street": "1295 S Rock Crusher Rd",
        "city": "Homosassa",
        "state": "FL",
        "zip": "34448",
        "county": "Citrus",
        "status": "AVAILABLE",
        "property_type": "LAND",
        "units": 23,
        "lot_size": "Approx. 0.5 acre per homesite (team-reported)",
        "notes_internal": "Team note: 23 vacant lots, approximately 1/2 acre each homesite. Units represents the team-reported lot count; verify legal parcel breakdown before public marketing.",
    },
    {
        "street": "5746 W Lucky Ranch Trail",
        "city": "Homosassa",
        "state": "FL",
        "zip": "34448",
        "county": "Citrus",
        "status": "STATUS_TO_CONFIRM",
        "property_type": "LAND",
        "lot_size": "Approx. 16.66 acres",
        "parcel_number": "1504619",
        "zoning": "LDRMH",
        "utilities": {"water": "Well required", "sewer": "Septic needed"},
        "notes_internal": "Apple Maps EHS Land/home Deals guide entry. Citrus County planning material references a 23-lot Lucky Ranch Trail plan at this address; confirm relationship to the separate 1295 S Rock Crusher team entry before assigning units.",
    },
    {
        "street": "716 Hazel Ave",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34601",
        "county": "Hernando",
        "status": "STATUS_TO_CONFIRM",
        "property_type": "HOME",
        "lot_size": "Approx. 0.13 acres",
        "parcel_number": "R27-222-19-3490-0000-0100",
        "notes_internal": "Apple Maps EHS Land/home Deals guide entry. Existing home / investment property; EHS deal status to confirm before public marketing.",
    },
    {
        "street": "718 Hazel Ave",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34601",
        "county": "Hernando",
        "status": "STATUS_TO_CONFIRM",
        "property_type": "HOME",
        "lot_size": "Approx. 0.13 acres",
        "notes_internal": "Apple Maps EHS Land/home Deals guide entry. Sister property to 716 Hazel Ave; EHS deal status to confirm before public marketing.",
    },
    {
        "street": "210 C St",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34601",
        "county": "Hernando",
        "status": "STATUS_TO_CONFIRM",
        "property_type": "HOME",
        "notes_internal": "Apple Maps EHS Land/home Deals guide entry. Existing investment/flip property; EHS deal status to confirm before public marketing.",
    },
)


def _norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def _address_key(record: dict) -> tuple[str, str]:
    return _norm(record.get("street")), _norm(record.get("zip"))


def _require_explicit_database_confirmation() -> None:
    db_name = (os.environ.get("DB_NAME") or "").strip()
    confirmation = (os.environ.get("PROPERTY_IMPORT_CONFIRM") or "").strip()
    if not db_name:
        raise RuntimeError("DB_NAME is required before the property import can run")
    if confirmation != db_name:
        raise RuntimeError(
            "Property import blocked. Set PROPERTY_IMPORT_CONFIRM to exactly match DB_NAME "
            f"after verifying the intended target database. Current DB_NAME={db_name!r}."
        )


def _validated_sources() -> list[dict]:
    validated: list[dict] = []
    keys: set[tuple[str, str]] = set()
    for raw in PROPERTY_LEADS:
        payload = PropertyCreate(
            **raw,
            source=SOURCE_LABEL,
            public_visible=False,
            featured=False,
            sales_rep="Unassigned",
            description="EHS Property Packages lead. Internal review required before public marketing.",
        ).model_dump()
        key = _address_key(payload)
        if key in keys:
            raise RuntimeError(f"Duplicate source address in import set: {payload['street']} {payload['zip']}")
        keys.add(key)
        validated.append(payload)
    return validated


async def _geocode(payload: dict) -> tuple[float | None, float | None, str | None]:
    key = _maps_key()
    if not key:
        return None, None, "Google Maps key not configured; record will be imported without coordinates"
    address = f"{payload['street']}, {payload['city']}, {payload['state']} {payload['zip']}"
    try:
        latitude, longitude, formatted = await asyncio.to_thread(_google_geocode, address, key)
        return latitude, longitude, formatted
    except Exception as exc:
        return None, None, f"Geocoding failed: {exc}"


async def main() -> None:
    _require_explicit_database_confirmation()
    validated = _validated_sources()
    await ping_database()
    db = get_db()

    existing = await db.properties.find({}, {"_id": 0, "id": 1, "street": 1, "city": 1, "zip": 1}).to_list(5000)
    existing_by_key = {_address_key(record): record for record in existing}

    now = datetime.now(timezone.utc)
    documents: list[dict] = []
    skipped = 0

    for payload in validated:
        key = _address_key(payload)
        match = existing_by_key.get(key)
        if match:
            print(f"SKIP {payload['street']}, {payload['zip']}: existing record {match.get('id')}")
            skipped += 1
            continue

        latitude, longitude, geocode_note = await _geocode(payload)
        if latitude is not None and longitude is not None:
            payload["latitude"] = latitude
            payload["longitude"] = longitude
            print(f"MAP  {payload['street']}: {latitude:.6f}, {longitude:.6f} ({geocode_note})")
        elif geocode_note:
            print(f"WARN {payload['street']}: {geocode_note}")

        document = {
            "id": f"EHS-PROP-{str(uuid4()).split('-')[0].upper()}",
            **payload,
            "history": [
                {
                    "id": f"log-{uuid4()}",
                    "timestamp": now.isoformat(),
                    "user": "Controlled Property Packages Import",
                    "action": "Property Created",
                }
            ],
            "archived": False,
            "created_at": now,
            "updated_at": now,
            "created_by_id": "controlled-property-package-import-20260826",
            "updated_by_id": "controlled-property-package-import-20260826",
        }
        documents.append(document)
        print(
            "PLAN "
            f"{payload['street']}, {payload['city']} {payload['zip']} | "
            f"{payload['property_type']} | {payload['status']} | units={payload['units']} | public={payload['public_visible']}"
        )

    print(f"Preflight complete. candidates={len(documents)} skipped_existing={skipped} source_total={len(validated)}")

    if (os.environ.get("PROPERTY_IMPORT_APPLY") or "").strip().upper() != "YES":
        print("DRY RUN ONLY. No MongoDB writes performed. Set PROPERTY_IMPORT_APPLY=YES to apply this reviewed plan.")
        return

    if documents:
        result = await db.properties.insert_many(documents, ordered=True)
        print(f"APPLIED inserted={len(result.inserted_ids)} skipped_existing={skipped}")
    else:
        print(f"APPLIED inserted=0 skipped_existing={skipped}; nothing new to add")


if __name__ == "__main__":
    asyncio.run(main())
