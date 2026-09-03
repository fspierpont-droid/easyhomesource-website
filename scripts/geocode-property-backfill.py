#!/usr/bin/env python3
"""One-time audited geocode backfill for current EHS land/home property records.

This script does not write production data. It resolves the known production
property addresses using the U.S. Census geocoder first and OpenStreetMap
Nominatim only as a throttled fallback, then emits a JSON report for human
review before MongoDB is updated.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

TARGETS = [
    {"id": "EHS-PROP-20260830-001", "street": "6645 W Erlen Ln", "city": "Homosassa", "state": "FL", "zip": "34446"},
    {"id": "EHS-PROP-20260830-002", "street": "3219 Welsh St", "city": "Spring Hill", "state": "FL", "zip": "34606"},
    {"id": "EHS-PROP-20260830-003", "street": "18810 St Paul Dr", "city": "Spring Hill", "state": "FL", "zip": "34610"},
    {"id": "EHS-PROP-20260830-004", "street": "18034 Ferry Ave", "city": "Brooksville", "state": "FL", "zip": "34604"},
    {"id": "EHS-PROP-20260830-005", "street": "26007 Shangri Dr", "city": "Brooksville", "state": "FL", "zip": "34601"},
    {"id": "EHS-PROP-20260830-006", "street": "7112 Fitzpatrick Ave", "city": "Brooksville", "state": "FL", "zip": "34613"},
    {"id": "EHS-PROP-20260830-007", "street": "9248 Denmarsh Dr", "city": "Brooksville", "state": "FL", "zip": "34613"},
    {"id": "EHS-PROP-20260830-008", "street": "9254 Denmarsh Dr", "city": "Brooksville", "state": "FL", "zip": "34613"},
    {"id": "EHS-PROP-20260830-009", "street": "9868 Lake Dr", "city": "Weeki Wachee", "state": "FL", "zip": "34613"},
    {"id": "EHS-PROP-20260830-010", "street": "9862 Lake Dr", "city": "Weeki Wachee", "state": "FL", "zip": "34613"},
    {"id": "EHS-PROP-20260830-011", "street": "26314 Glenwood Dr", "city": "Zephyrhills", "state": "FL", "zip": "33544"},
    {"id": "EHS-PROP-20260830-012", "street": "5043 Southtowne Loop", "city": "New Port Richey", "state": "FL", "zip": "34652"},
    {"id": "EHS-PROP-20260830-013", "street": "1295 S Rock Crusher Rd", "city": "Homosassa", "state": "FL", "zip": "34448"},
    {"id": "EHS-PROP-20260830-014", "street": "5746 W Lucky Ranch Trail", "city": "Homosassa", "state": "FL", "zip": "34448"},
    {"id": "EHS-PROP-20260830-015", "street": "716 Hazel Ave", "city": "Brooksville", "state": "FL", "zip": "34601"},
    {"id": "EHS-PROP-20260830-016", "street": "718 Hazel Ave", "city": "Brooksville", "state": "FL", "zip": "34601"},
    {"id": "EHS-PROP-20260830-017", "street": "210 C St", "city": "Brooksville", "state": "FL", "zip": "34601"},
]

OUT = Path("tmp/property-geocode-report.json")
USER_AGENT = "EasyHomeSourcePropertyAudit/1.0 (admin@easyhomesource.com)"


def get_json(url: str, timeout: int = 20):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def florida_coordinate(lat: float, lon: float) -> bool:
    return 24.0 <= lat <= 32.0 and -88.0 <= lon <= -79.0


def census(address: str):
    params = urllib.parse.urlencode({
        "address": address,
        "benchmark": "Public_AR_Current",
        "format": "json",
    })
    payload = get_json(f"https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?{params}")
    matches = payload.get("result", {}).get("addressMatches", [])
    if not matches:
        return None
    match = matches[0]
    coords = match.get("coordinates") or {}
    lat, lon = float(coords["y"]), float(coords["x"])
    if not florida_coordinate(lat, lon):
        return None
    return {
        "latitude": lat,
        "longitude": lon,
        "matched_address": match.get("matchedAddress"),
        "source": "US Census Geocoder",
    }


def nominatim(address: str):
    params = urllib.parse.urlencode({"q": address, "format": "jsonv2", "limit": 1, "countrycodes": "us"})
    payload = get_json(f"https://nominatim.openstreetmap.org/search?{params}")
    if not payload:
        return None
    match = payload[0]
    lat, lon = float(match["lat"]), float(match["lon"])
    if not florida_coordinate(lat, lon):
        return None
    return {
        "latitude": lat,
        "longitude": lon,
        "matched_address": match.get("display_name"),
        "source": "OpenStreetMap Nominatim",
    }


def main():
    results = []
    for target in TARGETS:
        address = f"{target['street']}, {target['city']}, {target['state']} {target['zip']}"
        result = None
        errors = []
        try:
            result = census(address)
        except Exception as exc:  # audit script: preserve provider error in report
            errors.append(f"Census: {exc}")
        if result is None:
            time.sleep(1.1)
            try:
                result = nominatim(address)
            except Exception as exc:
                errors.append(f"Nominatim: {exc}")
        row = {**target, "query_address": address, "resolved": bool(result), "errors": errors}
        if result:
            row.update(result)
        results.append(row)
        print(json.dumps(row, sort_keys=True))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    resolved = sum(1 for row in results if row["resolved"])
    print(f"Resolved {resolved}/{len(results)} property addresses")
    if resolved < len(results):
        print("Unresolved records require manual address/parcel review; no approximate pins are generated.")


if __name__ == "__main__":
    main()
