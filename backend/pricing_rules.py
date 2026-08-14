"""Versioned backend pricing rules for the permanent EHS Pricing Engine."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

PRICING_ENGINE_VERSION = "EHS-PRICING-1.0"

DIRT_PAD_LOAD_TABLE: dict[int, dict[str, float]] = {
    1: {"cost": 1000.0, "price": 1500.0},
    2: {"cost": 1800.0, "price": 2700.0},
    3: {"cost": 2400.0, "price": 3600.0},
    4: {"cost": 2900.0, "price": 4350.0},
    5: {"cost": 3400.0, "price": 5100.0},
    6: {"cost": 3900.0, "price": 5850.0},
    7: {"cost": 4400.0, "price": 6600.0},
    8: {"cost": 4900.0, "price": 7350.0},
    9: {"cost": 5400.0, "price": 8100.0},
    10: {"cost": 5900.0, "price": 8850.0},
    11: {"cost": 6400.0, "price": 9600.0},
    12: {"cost": 6900.0, "price": 10350.0},
    13: {"cost": 7400.0, "price": 11100.0},
    14: {"cost": 7900.0, "price": 11850.0},
    15: {"cost": 8400.0, "price": 12600.0},
    16: {"cost": 8900.0, "price": 13350.0},
    17: {"cost": 9400.0, "price": 14100.0},
    18: {"cost": 9900.0, "price": 14850.0},
    19: {"cost": 10400.0, "price": 15600.0},
    20: {"cost": 10900.0, "price": 16350.0},
}

CANONICAL_REQUIRED_SERVICES: dict[str, dict[str, Any]] = {
    "SITE-STEPS-2SET": {
        "description": "Wooden Steps — Two Sets",
        "qty": 1,
        "unit_price": 2500.0,
        "cost": 1000.0,
        "service_id": "SITE-STEPS-2SET",
        "calc_type": "required_service",
        "pricing_source": "EHS Pricing Engine v1.0 standard quote default",
        "included_in_financing": True,
        "requires_bid": False,
        "default_service": True,
    },
    "SITE-PERMIT-PLAN": {
        "description": "Permit & Site Plan",
        "qty": 1,
        "unit_price": 2000.0,
        "cost": 500.0,
        "service_id": "SITE-PERMIT-PLAN",
        "calc_type": "required_service",
        "pricing_source": "EHS Pricing Engine v1.0 standard quote default",
        "included_in_financing": True,
        "requires_bid": False,
        "default_service": True,
    },
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def line_identity(item: dict[str, Any]) -> str:
    return str(
        item.get("service_id")
        or item.get("catalog_template_id")
        or item.get("description")
        or ""
    ).strip()


def dirt_pad_price(loads: int) -> dict[str, float] | None:
    return DIRT_PAD_LOAD_TABLE.get(loads)


def build_snapshot(
    service_id: str, inputs: dict[str, Any], result: dict[str, Any]
) -> dict[str, Any]:
    return {
        "pricing_version": PRICING_ENGINE_VERSION,
        "service_id": service_id,
        "inputs": inputs,
        "result": result,
        "calculated_at": now_iso(),
    }


def with_pricing_metadata(
    line: dict[str, Any], snapshot: dict[str, Any]
) -> dict[str, Any]:
    enriched = dict(line)
    enriched.setdefault("included_in_financing", True)
    enriched.setdefault("requires_bid", False)
    enriched["pricing_version"] = PRICING_ENGINE_VERSION
    enriched["calculation_snapshot"] = snapshot
    enriched["calculated_at"] = snapshot["calculated_at"]
    return enriched


def calculate_dirt_pad_line(site: dict[str, Any] | None) -> dict[str, Any] | None:
    site = site or {}
    needed = site.get("dirt_pad_needed")
    if needed is False:
        return None
    if needed is not True and not any(
        key in site
        for key in (
            "dirt_pad_loads",
            "dirt_pad_cost_override",
            "dirt_pad_price_override",
        )
    ):
        return None

    loads = int(float(site.get("dirt_pad_loads") or 0))
    manual_cost = float(site.get("dirt_pad_cost_override") or 0)
    manual_price = float(site.get("dirt_pad_price_override") or 0)
    inputs = {
        "dirt_pad_needed": needed,
        "dirt_pad_loads": loads,
        "manual_cost_override": manual_cost,
        "manual_price_override": manual_price,
    }

    row = dirt_pad_price(loads)
    reason = site.get("dirt_pad_override_reason")

    if not row:
        complete_override = (
            manual_cost > 0
            and manual_price > 0
            and bool(str(reason or "").strip())
        )
        line = {
            "description": "Dirt Pad",
            "qty": 1,
            "unit_price": manual_price if complete_override else 0,
            "cost": manual_cost if complete_override else 0,
            "service_id": "SITE-DIRT",
            "calc_type": "load_count_calculator",
            "pricing_source": (
                "authorized bid override" if complete_override else "V05 SITE-DIRT load table"
            ),
            "manual_override": complete_override,
            "override_reason": reason if complete_override else None,
            "requires_bid": not complete_override,
        }
        snapshot = build_snapshot("SITE-DIRT", inputs, line)
        snapshot["original"] = {"cost": None, "unit_price": None}
        snapshot["overridden"] = {
            "cost": line["cost"],
            "unit_price": line["unit_price"],
        }
        return with_pricing_metadata(line, snapshot)

    original = {"cost": row["cost"], "unit_price": row["price"]}
    override_applied = manual_cost > 0 or manual_price > 0
    line = {
        "description": (
            f"Dirt Pad ({loads} load{'s' if loads != 1 else ''})"
            if not override_applied
            else "Dirt Pad"
        ),
        "qty": 1,
        "unit_price": manual_price if manual_price > 0 else row["price"],
        "cost": manual_cost if manual_cost > 0 else row["cost"],
        "service_id": "SITE-DIRT",
        "calc_type": "load_count_calculator",
        "pricing_source": "manual override" if override_applied else "V05 SITE-DIRT load table",
        "manual_override": override_applied,
        "override_reason": reason if override_applied else None,
        "requires_bid": False,
    }
    snapshot = build_snapshot("SITE-DIRT", inputs, line)
    snapshot["original"] = original
    snapshot["overridden"] = {
        "cost": line["cost"],
        "unit_price": line["unit_price"],
    }
    return with_pricing_metadata(line, snapshot)


def ensure_required_services(quote: dict[str, Any]) -> dict[str, Any]:
    updated = deepcopy(quote or {})
    services = []
    seen_ids: set[str] = set()
    suppressed = {
        str(service_id).strip()
        for service_id in updated.get("suppressed_required_service_ids") or []
        if str(service_id).strip() in CANONICAL_REQUIRED_SERVICES
    }

    for item in updated.get("mandatory_services") or []:
        service_id = line_identity(item)
        if service_id in CANONICAL_REQUIRED_SERVICES:
            if service_id in seen_ids:
                continue
            preserved = deepcopy(item)
            preserved.setdefault("default_service", True)
            services.append(preserved)
            suppressed.discard(service_id)
            seen_ids.add(service_id)
        else:
            services.append(item)
            if service_id:
                seen_ids.add(service_id)

    for service_id, line in CANONICAL_REQUIRED_SERVICES.items():
        if service_id not in seen_ids and service_id not in suppressed:
            canonical = deepcopy(line)
            services.append(
                with_pricing_metadata(
                    canonical,
                    build_snapshot(
                        service_id,
                        {"source": "standard_quote_default"},
                        canonical,
                    ),
                )
            )

    updated["mandatory_services"] = services
    updated["suppressed_required_service_ids"] = sorted(suppressed)
    return updated


def _without_service(
    items: list[dict[str, Any]], service_id: str, phrase: str
) -> list[dict[str, Any]]:
    phrase = phrase.lower()
    return [
        item
        for item in items
        if str(item.get("service_id") or "").strip() != service_id
        and phrase not in str(item.get("description") or "").lower()
    ]


def _dedupe_canonical_ids_across_groups(
    quote: dict[str, Any]
) -> dict[str, Any]:
    canonical_ids = {"SITE-DIRT", *CANONICAL_REQUIRED_SERVICES.keys()}
    seen: set[str] = set()
    for section in ("mandatory_services", "addons", "site_work", "options"):
        deduped = []
        for item in quote.get(section) or []:
            service_id = str(item.get("service_id") or "").strip()
            if service_id in canonical_ids:
                if service_id in seen:
                    continue
                seen.add(service_id)
            deduped.append(item)
        quote[section] = deduped
    return quote


def apply_pricing_rules(quote: dict[str, Any]) -> dict[str, Any]:
    updated = ensure_required_services(deepcopy(quote or {}))
    for section in ("mandatory_services", "addons", "site_work", "options"):
        updated[section] = _without_service(
            updated.get(section) or [], "SITE-DIRT", "dirt pad"
        )

    dirt_line = calculate_dirt_pad_line(updated.get("site"))
    if dirt_line is not None:
        updated.setdefault("mandatory_services", []).append(dirt_line)

    updated = _dedupe_canonical_ids_across_groups(updated)
    updated["pricing_version"] = PRICING_ENGINE_VERSION
    updated["calculated_at"] = now_iso()
    snapshot = dict(updated.get("calculation_snapshot") or {})
    snapshot.update(
        {
            "pricing_version": PRICING_ENGINE_VERSION,
            "default_service_ids": sorted(CANONICAL_REQUIRED_SERVICES),
            "dirt_pad": (dirt_line or {}).get("calculation_snapshot"),
        }
    )
    updated["calculation_snapshot"] = snapshot
    updated["validation"] = validate_quote(updated)
    return updated


def financed_subtotal(quote: dict[str, Any]) -> float:
    total = float(quote.get("base_price") or 0)
    for section in ("options", "mandatory_services", "addons", "site_work"):
        for item in quote.get(section) or []:
            if item.get("included_in_financing") is False:
                continue
            total += float(item.get("qty", 1) or 0) * float(
                item.get("unit_price", 0) or 0
            )
    return round(total, 2)


def validate_quote(
    quote: dict[str, Any], finalizing: bool = False
) -> dict[str, list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    home = quote.get("home") or {}
    site = quote.get("site") or {}
    all_lines = []
    for section in ("options", "mandatory_services", "addons", "site_work"):
        all_lines.extend(quote.get(section) or [])

    if not home:
        warnings.append("Home must be selected before quote is finalized.")
    if not float(quote.get("factory_cost") or 0):
        warnings.append("Factory cost is missing.")
    if not float(quote.get("base_price") or 0):
        warnings.append("Base/EHS price is missing.")
    if site.get("dirt_pad_needed") is None:
        warnings.append("Dirt-pad Yes/No decision is not recorded.")
    if site.get("dirt_pad_needed") is True and not site.get("dirt_pad_loads"):
        (errors if finalizing else warnings).append(
            "Dirt-pad load count is required when Dirt Pad is needed."
        )
    if any(item.get("requires_bid") for item in all_lines):
        (errors if finalizing else warnings).append(
            "Quote contains a line that requires bid resolution."
        )
    return {"errors": errors, "warnings": warnings}
