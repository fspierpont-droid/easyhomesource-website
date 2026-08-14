"""Quote-domain services shared by the permanent quote API."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import HTTPException

from database import get_db
from pricing import (
    DEFAULT_SETTINGS,
    calculate_ehs_price,
    calculate_msrp,
    calculate_quote_totals,
    money_round,
    pricing_multiplier,
    public_quote,
)
from pricing_rules import PRICING_ENGINE_VERSION, apply_pricing_rules

MANAGER_ROLES = {"admin", "manager"}
QUOTE_PRICING_ROLES = {
    "admin",
    "manager",
    "salesperson",
    "sales",
    "quote",
    "quote_user",
    "sales_quote",
    "associate",
}
QUOTE_PRICE_AUDIT_FIELDS = {
    "base_price",
    "factory_cost",
    "mandatory_services",
    "suppressed_required_service_ids",
    "addons",
    "site_work",
    "discounts",
    "deposits",
    "sales_tax_rate",
    "ehs_loan_used",
    "financing",
    "options",
}
HISTORICAL_PRICING_FIELDS = {
    "base_price",
    "factory_cost",
    "options",
    "mandatory_services",
    "addons",
    "site_work",
    "discounts",
    "deposits",
    "sales_tax_rate",
    "ehs_loan_used",
    "financing",
    "home",
    "site",
    "quote_updates",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_manager_or_admin(user: dict) -> bool:
    return (user.get("role") or "").lower() in MANAGER_ROLES


def can_edit_quote_pricing(user: dict) -> bool:
    return (user.get("role") or "").lower() in QUOTE_PRICING_ROLES


def assert_can_manage_quote(quote: dict, user: dict) -> None:
    """Preserve current EHS team behavior: quote-capable staff may edit quotes."""
    if is_manager_or_admin(user) or can_edit_quote_pricing(user):
        return
    if quote.get("associate_id") == user.get("id"):
        return
    raise HTTPException(status_code=403, detail="You do not have permission to modify this quote.")


def jsonish_equal(left: Any, right: Any) -> bool:
    if isinstance(left, (int, float)) or isinstance(right, (int, float)):
        try:
            return abs(float(left or 0) - float(right or 0)) < 0.005
        except (TypeError, ValueError):
            pass
    if isinstance(left, dict) and isinstance(right, dict):
        keys = set(left) | set(right)
        return all(jsonish_equal(left.get(key), right.get(key)) for key in keys)
    if isinstance(left, list) and isinstance(right, list):
        return len(left) == len(right) and all(
            jsonish_equal(a, b) for a, b in zip(left, right)
        )
    return (left or None) == (right or None)


def changed_historical_pricing_fields(update: dict, stored: dict) -> list[str]:
    return sorted(
        key
        for key in update
        if key in HISTORICAL_PRICING_FIELDS
        and not jsonish_equal(update.get(key), stored.get(key))
    )


def is_historical_quote(quote: dict) -> bool:
    return bool(quote.get("id")) and not quote.get("pricing_engine_version")


async def settings_for_quote() -> dict[str, Any]:
    """Read copied EHS settings without writing defaults into the new database."""
    stored = await get_db().settings.find_one({"id": "global"}, {"_id": 0})
    return {**DEFAULT_SETTINGS, **(stored or {})}


def apply_factory_cost_pricing(
    quote: dict,
    user: dict | None = None,
    *,
    persist_override: bool = True,
) -> dict:
    factory_cost = float(quote.get("factory_cost") or 0)
    if factory_cost <= 0:
        return quote

    calculated = money_round(calculate_ehs_price(factory_cost))
    msrp = money_round(calculate_msrp(factory_cost, calculated))
    markup = pricing_multiplier(factory_cost)
    override = quote.get("ehs_price_override") or {}
    base_present = float(quote.get("base_price") or 0) > 0

    if override.get("active"):
        quote["base_price"] = money_round(
            override.get("overridden_customer_price")
            or quote.get("base_price")
            or calculated
        )
    elif base_present and abs(float(quote.get("base_price") or 0) - calculated) >= 0.005:
        entered_price = money_round(quote.get("base_price"))
        reason = str(quote.get("ehs_price_override_reason") or "").strip()
        if persist_override:
            quote["ehs_price_override"] = {
                "active": True,
                "reason": reason,
                "original_calculated_ehs_price": calculated,
                "overridden_customer_price": entered_price,
                "user": {
                    "id": (user or {}).get("id"),
                    "name": (user or {}).get("name") or (user or {}).get("email"),
                    "email": (user or {}).get("email"),
                },
                "timestamp": now_iso(),
            }
        quote["base_price"] = entered_price
    else:
        if not base_present:
            quote["base_price"] = calculated
        quote["ehs_price_override"] = {"active": False}

    snapshot = dict(quote.get("calculation_snapshot") or {})
    snapshot["home_price_formula"] = {
        "version": PRICING_ENGINE_VERSION,
        "factory_cost": money_round(factory_cost),
        "markup_pct": markup,
        "ehs_price_calculated": calculated,
        "base_price": money_round(quote.get("base_price")),
        "msrp_calculated": msrp,
        "calculated_at": now_iso(),
        "overridden": bool((quote.get("ehs_price_override") or {}).get("active")),
    }
    quote["calculation_snapshot"] = snapshot
    return quote


def _requires_override_audit(item: dict) -> bool:
    source = str(
        item.get("pricing_source")
        or item.get("calc_source")
        or item.get("source")
        or ""
    ).lower()
    return bool(
        item.get("manual_override")
        or item.get("price_overridden")
        or item.get("cost_overridden")
        or "manual override" in source
    )


def enforce_line_override_audit(quote: dict, user: dict) -> None:
    audit_at = now_iso()
    actor = {
        "id": user.get("id"),
        "name": user.get("name") or user.get("email"),
        "email": user.get("email"),
    }
    for section in ("options", "mandatory_services", "addons", "site_work"):
        for item in quote.get(section) or []:
            if not isinstance(item, dict) or not _requires_override_audit(item):
                continue
            snapshot = item.get("calculation_snapshot") or {}
            original = snapshot.get("original") or {
                "cost": item.get("cost"),
                "unit_price": item.get("unit_price"),
            }
            overridden = snapshot.get("overridden") or {
                "cost": item.get("cost"),
                "unit_price": item.get("unit_price"),
            }
            item.setdefault("override_audit", {})
            item["override_audit"].update(
                {
                    "updated_at": audit_at,
                    "updated_by": actor,
                    "reason": str(item.get("override_reason") or "").strip(),
                    "original": original,
                    "new": overridden,
                }
            )


async def price_quote(quote: dict, user: dict | None = None) -> dict:
    """Apply authoritative pricing rules and totals to a mutable quote document."""
    apply_factory_cost_pricing(quote, user)
    priced = apply_pricing_rules(deepcopy(quote))
    for key in (
        "mandatory_services",
        "suppressed_required_service_ids",
        "addons",
        "site_work",
        "options",
        "pricing_version",
        "calculation_snapshot",
        "calculated_at",
        "validation",
    ):
        if key in priced:
            quote[key] = priced[key]
    apply_factory_cost_pricing(quote, user)
    quote["totals"] = calculate_quote_totals(quote, await settings_for_quote())
    quote["pricing_engine_version"] = PRICING_ENGINE_VERSION
    quote["pricing_engine_calculated_at"] = now_iso()
    quote["updated_at"] = now_iso()
    if user:
        enforce_line_override_audit(quote, user)
    return quote


async def audit_pricing_changes(
    quote_id: str,
    before: dict,
    after: dict,
    user: dict,
    fields: set[str] | None = None,
) -> None:
    actor = {
        "id": user.get("id"),
        "name": user.get("name") or user.get("email"),
        "email": user.get("email"),
    }
    audit_at = now_iso()
    documents: list[dict[str, Any]] = []
    for field in sorted(fields or QUOTE_PRICE_AUDIT_FIELDS):
        if field not in QUOTE_PRICE_AUDIT_FIELDS:
            continue
        old_value = before.get(field)
        new_value = after.get(field)
        if jsonish_equal(old_value, new_value):
            continue
        documents.append(
            {
                "audit_id": str(uuid4()),
                "timestamp": audit_at,
                "action": "quote_pricing_changed",
                "resource_type": "quote",
                "resource_id": quote_id,
                "quote_id": quote_id,
                "actor_user_id": actor["id"],
                "actor_name": actor["name"],
                "actor_email": actor["email"],
                "field": field,
                "old_value": old_value,
                "new_value": new_value,
            }
        )
    if documents:
        await get_db().audit_logs.insert_many(documents)


def reset_historical_pricing_metadata(quote: dict) -> None:
    for key in (
        "pricing_preserved",
        "pricing_engine_version",
        "pricing_engine_calculated_at",
        "pricing_version",
        "calculation_snapshot",
        "calculated_at",
        "validation",
    ):
        quote.pop(key, None)


async def public_render_payload(quote: dict) -> dict:
    """Recalculate customer totals and redact every internal pricing field."""
    working = deepcopy(quote)
    working["totals"] = calculate_quote_totals(working, await settings_for_quote())
    return public_quote(working)
