"""Persistent, authenticated quote lifecycle for the permanent EHS platform."""
from __future__ import annotations

import re
import secrets
from copy import deepcopy
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.errors import DuplicateKeyError

from auth import get_current_user
from database import get_db
from pricing import calculate_ehs_price, calculate_quote_totals, money_round
from pricing_rules import apply_pricing_rules, validate_quote
from quote_models import Quote, QuoteCreate, QuoteStatusUpdate, QuoteUpdate, new_id, now_iso
from quote_service import (
    QUOTE_PRICE_AUDIT_FIELDS,
    apply_factory_cost_pricing,
    assert_can_manage_quote,
    audit_pricing_changes,
    can_edit_quote_pricing,
    changed_historical_pricing_fields,
    enforce_line_override_audit,
    is_historical_quote,
    is_manager_or_admin,
    price_quote,
    public_render_payload,
    reset_historical_pricing_metadata,
    settings_for_quote,
)

router = APIRouter(prefix="/api/quotes", tags=["quotes"])
public_router = APIRouter(prefix="/api/public/quotes", tags=["public-quotes"])


def normalize_quote_for_read(document: dict) -> dict:
    normalized = dict(document)
    normalized.pop("_id", None)
    for key in (
        "options",
        "mandatory_services",
        "addons",
        "site_work",
        "discounts",
        "deposits",
        "suppressed_required_service_ids",
    ):
        if not isinstance(normalized.get(key), list):
            normalized[key] = []
    for key in (
        "home",
        "site",
        "financing",
        "timeline",
        "totals",
        "validation",
        "calculation_snapshot",
    ):
        if normalized.get(key) is None:
            normalized[key] = {}
    return normalized


async def generate_quote_number(associate_name: str, model_name: str | None) -> str:
    today = datetime.now(timezone.utc).strftime("%Y_%m_%d")
    last_name = re.sub(r"[^A-Z0-9_-]", "", (associate_name or "ASSOC").split()[-1].upper()) or "ASSOC"
    model = re.sub(r"[^A-Z0-9_-]", "_", (model_name or "QUOTE").upper().replace("/", "-"))[:24] or "QUOTE"
    base = f"{today}_{last_name}_{model}"
    candidate = base
    suffix = 1
    while await get_db().quotes.find_one({"quote_number": candidate}, {"_id": 1}):
        suffix += 1
        candidate = f"{base}_{suffix}"
    return candidate


async def customer_snapshot(customer_id: str | None) -> dict | None:
    if not customer_id:
        return None
    return await get_db().customers.find_one({"id": customer_id}, {"_id": 0})


def normalize_update_data(payload: QuoteUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)
    for key in ("home", "site", "financing", "timeline"):
        value = data.get(key)
        if value is not None and hasattr(value, "model_dump"):
            data[key] = value.model_dump()
    return data


@router.get("")
async def list_quotes(
    q: str | None = Query(default=None, max_length=160),
    quote_status: str | None = Query(default=None, alias="status", max_length=80),
    associate_id: str | None = Query(default=None, max_length=160),
    _user: dict = Depends(get_current_user),
) -> list[dict]:
    query: dict = {}
    if quote_status:
        query["status"] = quote_status
    if associate_id and associate_id.lower() != "all":
        query["associate_id"] = associate_id
    if q and q.strip():
        escaped = re.escape(q.strip())
        query["$or"] = [
            {"quote_number": {"$regex": escaped, "$options": "i"}},
            {"customer_snapshot.first_name": {"$regex": escaped, "$options": "i"}},
            {"customer_snapshot.last_name": {"$regex": escaped, "$options": "i"}},
            {"customer_snapshot.name": {"$regex": escaped, "$options": "i"}},
            {"home.model_name": {"$regex": escaped, "$options": "i"}},
        ]
    documents = await get_db().quotes.find(query, {"_id": 0}).sort("updated_at", -1).to_list(1000)
    return [normalize_quote_for_read(document) for document in documents]


@router.get("/stats")
async def quote_stats(user: dict = Depends(get_current_user)) -> dict:
    status_pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total": {"$sum": "$totals.grand_total"},
            }
        }
    ]
    rows = await get_db().quotes.aggregate(status_pipeline).to_list(50)
    by_status = {
        str(row.get("_id") or "unknown"): {
            "count": row.get("count", 0),
            "total": row.get("total", 0) or 0,
        }
        for row in rows
    }
    mine_rows = await get_db().quotes.aggregate(
        [
            {"$match": {"associate_id": user["id"]}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]
    ).to_list(50)
    return {
        "by_status": by_status,
        "total": sum(item["count"] for item in by_status.values()),
        "mine": {str(row.get("_id") or "unknown"): row["count"] for row in mine_rows},
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_quote(
    payload: QuoteCreate,
    user: dict = Depends(get_current_user),
) -> dict:
    if not can_edit_quote_pricing(user):
        raise HTTPException(status_code=403, detail="Quote pricing access is required.")

    associate_name = user.get("name") or user.get("email") or "Associate"
    settings = await settings_for_quote()
    canonical_snapshot = await customer_snapshot(payload.customer_id)
    snapshot = canonical_snapshot or payload.customer_snapshot
    quote_number = payload.quote_number or await generate_quote_number(
        associate_name, payload.home.model_name if payload.home else None
    )

    quote = Quote(
        id=payload.id or new_id(),
        quote_number=quote_number,
        quote_date=payload.quote_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        status=payload.status or "draft",
        associate_id=user["id"],
        associate_name=associate_name,
        associate_email=user.get("email"),
        associate_phone=user.get("phone"),
        customer_id=payload.customer_id,
        customer_snapshot=snapshot,
        home=payload.home,
        site=payload.site,
        base_price=payload.base_price,
        factory_cost=payload.factory_cost,
        options=payload.options,
        mandatory_services=payload.mandatory_services,
        suppressed_required_service_ids=payload.suppressed_required_service_ids,
        addons=payload.addons,
        site_work=payload.site_work,
        discounts=payload.discounts,
        deposits=payload.deposits,
        sales_tax_rate=payload.sales_tax_rate,
        ehs_loan_used=payload.ehs_loan_used,
        financing=payload.financing,
        timeline=payload.timeline,
        notes_internal=payload.notes_internal,
        notes_customer=payload.notes_customer,
        next_steps=payload.next_steps or settings.get("default_next_steps"),
        disclaimer=payload.disclaimer or settings.get("default_disclaimer"),
    ).model_dump()
    quote["created_by_id"] = user["id"]
    quote["updated_by_id"] = user["id"]
    if payload.ehs_price_override_reason:
        quote["ehs_price_override_reason"] = payload.ehs_price_override_reason

    before = {field: None for field in QUOTE_PRICE_AUDIT_FIELDS}
    await price_quote(quote, user)
    enforce_line_override_audit(quote, user)

    try:
        await get_db().quotes.insert_one(quote)
    except DuplicateKeyError as exc:
        if payload.id or payload.quote_number:
            raise HTTPException(status_code=409, detail="Quote already exists") from exc
        quote["quote_number"] = await generate_quote_number(
            associate_name, (quote.get("home") or {}).get("model_name")
        )
        await get_db().quotes.insert_one(quote)

    await audit_pricing_changes(quote["id"], before, quote, user)
    return normalize_quote_for_read(quote)


@router.get("/{quote_id}")
async def get_quote(
    quote_id: str,
    _user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one(
        {"$or": [{"id": quote_id}, {"quote_number": quote_id}]}, {"_id": 0}
    )
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    return normalize_quote_for_read(document)


@router.patch("/{quote_id}")
async def update_quote(
    quote_id: str,
    payload: QuoteUpdate,
    user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(document, user)

    raw_update = normalize_update_data(payload)
    raw_update.pop("id", None)
    raw_update.pop("quote_number", None)
    requested_pricing_fields = set(raw_update) & QUOTE_PRICE_AUDIT_FIELDS
    if requested_pricing_fields and not can_edit_quote_pricing(user):
        raise HTTPException(status_code=403, detail="Quote pricing access is required.")

    before = deepcopy(document)
    migrate_pricing = bool(raw_update.pop("migrate_pricing", False))
    raw_update.pop("quote_updates", None)
    if migrate_pricing and not is_manager_or_admin(user):
        raise HTTPException(status_code=403, detail="Only managers and admins can migrate historical pricing.")

    if "customer_id" in raw_update:
        canonical_snapshot = await customer_snapshot(raw_update.get("customer_id"))
        if canonical_snapshot is not None:
            raw_update["customer_snapshot"] = canonical_snapshot

    historical_without_migration = is_historical_quote(document) and not migrate_pricing
    if historical_without_migration:
        blocked = changed_historical_pricing_fields(raw_update, document)
        if blocked:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Historical quote pricing fields require migrate_pricing=true",
                    "fields": blocked,
                },
            )

    preserved_totals = deepcopy(document.get("totals") or {})
    reset_override = bool(raw_update.pop("reset_ehs_price_override", False))
    if reset_override:
        document["ehs_price_override"] = {"active": False}
        document.pop("ehs_price_override_reason", None)
        raw_update.pop("ehs_price_override_reason", None)
        if document.get("factory_cost"):
            document["base_price"] = money_round(
                calculate_ehs_price(float(document.get("factory_cost") or 0))
            )

    document.update(raw_update)
    document["updated_by_id"] = user["id"]
    document["updated_at"] = now_iso()

    if "factory_cost" in raw_update and "base_price" not in raw_update:
        document["ehs_price_override"] = {"active": False}
        document["base_price"] = 0

    if historical_without_migration:
        document["totals"] = preserved_totals
        document["pricing_preserved"] = True
    else:
        requested_base_price = (
            raw_update.get("base_price")
            if migrate_pricing and "base_price" in raw_update
            else None
        )
        if requested_base_price is not None:
            document["ehs_price_override"] = {
                "active": True,
                "reason": document.get("ehs_price_override_reason") or "historical pricing migration",
                "original_calculated_ehs_price": money_round(
                    calculate_ehs_price(float(document.get("factory_cost") or 0))
                ),
                "overridden_customer_price": money_round(requested_base_price),
                "user": {
                    "id": user.get("id"),
                    "name": user.get("name") or user.get("email"),
                    "email": user.get("email"),
                },
                "timestamp": now_iso(),
            }
        await price_quote(document, user)
        if requested_base_price is not None:
            document["base_price"] = money_round(requested_base_price)
            document["totals"] = calculate_quote_totals(
                document, await settings_for_quote()
            )

    enforce_line_override_audit(document, user)
    await get_db().quotes.replace_one({"id": quote_id}, document)
    await audit_pricing_changes(
        quote_id,
        before,
        document,
        user,
        requested_pricing_fields or None,
    )
    return normalize_quote_for_read(document)


@router.delete("/{quote_id}")
async def delete_quote(
    quote_id: str,
    user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(document, user)
    result = await get_db().quotes.delete_one({"id": quote_id})
    return {"ok": result.deleted_count == 1}


@router.post("/{quote_id}/duplicate")
async def duplicate_quote(
    quote_id: str,
    user: dict = Depends(get_current_user),
) -> dict:
    source = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not source:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(source, user)

    associate_name = user.get("name") or user.get("email") or "Associate"
    duplicate = deepcopy(source)
    duplicate["id"] = new_id()
    duplicate["quote_number"] = await generate_quote_number(
        associate_name, (source.get("home") or {}).get("model_name")
    )
    duplicate["status"] = "draft"
    duplicate["created_at"] = now_iso()
    duplicate["updated_at"] = now_iso()
    duplicate["sent_at"] = None
    duplicate["share_token"] = None
    duplicate["share_enabled"] = False
    duplicate["associate_id"] = user["id"]
    duplicate["associate_name"] = associate_name
    duplicate["associate_email"] = user.get("email")
    duplicate["associate_phone"] = user.get("phone")
    duplicate["created_by_id"] = user["id"]
    duplicate["updated_by_id"] = user["id"]
    await get_db().quotes.insert_one(duplicate)
    return normalize_quote_for_read(duplicate)


@router.post("/{quote_id}/duplicate-and-reprice")
async def duplicate_and_reprice_quote(
    quote_id: str,
    payload: QuoteUpdate | None = None,
    user: dict = Depends(get_current_user),
) -> dict:
    source = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not source:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(source, user)

    associate_name = user.get("name") or user.get("email") or "Associate"
    updates = normalize_update_data(payload) if payload else {}
    updates.pop("id", None)
    updates.pop("quote_number", None)
    updates.pop("migrate_pricing", None)
    updates.pop("quote_updates", None)
    updates.pop("reset_ehs_price_override", None)

    duplicate = deepcopy(source)
    duplicate.update(updates)
    reset_historical_pricing_metadata(duplicate)
    duplicate["id"] = new_id()
    duplicate["quote_number"] = await generate_quote_number(
        associate_name, (duplicate.get("home") or {}).get("model_name")
    )
    duplicate["status"] = "draft"
    duplicate["created_at"] = now_iso()
    duplicate["updated_at"] = now_iso()
    duplicate["sent_at"] = None
    duplicate["share_token"] = None
    duplicate["share_enabled"] = False
    duplicate["associate_id"] = user["id"]
    duplicate["associate_name"] = associate_name
    duplicate["associate_email"] = user.get("email")
    duplicate["associate_phone"] = user.get("phone")
    duplicate["created_by_id"] = user["id"]
    duplicate["updated_by_id"] = user["id"]

    if "customer_id" in updates:
        canonical_snapshot = await customer_snapshot(updates.get("customer_id"))
        if canonical_snapshot is not None:
            duplicate["customer_snapshot"] = canonical_snapshot

    requested_base_price = updates.get("base_price") if "base_price" in updates else None
    if requested_base_price is not None:
        duplicate["ehs_price_override"] = {
            "active": True,
            "reason": duplicate.get("ehs_price_override_reason") or "duplicate and reprice adjustment",
            "original_calculated_ehs_price": money_round(
                calculate_ehs_price(float(duplicate.get("factory_cost") or 0))
            ),
            "overridden_customer_price": money_round(requested_base_price),
            "user": {
                "id": user.get("id"),
                "name": user.get("name") or user.get("email"),
                "email": user.get("email"),
            },
            "timestamp": now_iso(),
        }

    await price_quote(duplicate, user)
    if requested_base_price is not None:
        duplicate["base_price"] = money_round(requested_base_price)
        duplicate["totals"] = calculate_quote_totals(
            duplicate, await settings_for_quote()
        )
    await get_db().quotes.insert_one(duplicate)
    return normalize_quote_for_read(duplicate)


@router.post("/{quote_id}/share")
async def enable_share(
    quote_id: str,
    user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(document, user)
    share_token = document.get("share_token") or secrets.token_urlsafe(32)
    await get_db().quotes.update_one(
        {"id": quote_id},
        {
            "$set": {
                "share_token": share_token,
                "share_enabled": True,
                "updated_at": now_iso(),
                "updated_by_id": user["id"],
            }
        },
    )
    return {"share_token": share_token, "share_enabled": True}


@router.delete("/{quote_id}/share")
async def disable_share(
    quote_id: str,
    user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(document, user)
    await get_db().quotes.update_one(
        {"id": quote_id},
        {
            "$set": {
                "share_enabled": False,
                "updated_at": now_iso(),
                "updated_by_id": user["id"],
            }
        },
    )
    return {"ok": True, "share_enabled": False}


@router.post("/{quote_id}/status")
async def update_status(
    quote_id: str,
    payload: QuoteStatusUpdate,
    user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    assert_can_manage_quote(document, user)
    if payload.status not in {"draft", "sent", "accepted", "declined", "expired"}:
        raise HTTPException(status_code=400, detail="Invalid status")

    if payload.status in {"sent", "accepted"}:
        validation = validate_quote(apply_pricing_rules(document), finalizing=True)
        if validation.get("errors"):
            raise HTTPException(
                status_code=400,
                detail={"message": "Quote is not ready to finalize", "validation": validation},
            )

    update = {
        "status": payload.status,
        "updated_at": now_iso(),
        "updated_by_id": user["id"],
    }
    if payload.status == "sent":
        update["sent_at"] = now_iso()
    result = await get_db().quotes.find_one_and_update(
        {"id": quote_id}, {"$set": update}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Quote not found")
    return normalize_quote_for_read(result)


@router.get("/{quote_id}/render")
async def render_quote(
    quote_id: str,
    _user: dict = Depends(get_current_user),
) -> dict:
    document = await get_db().quotes.find_one({"id": quote_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    return await public_render_payload(document)


@public_router.get("/{share_token}")
async def public_quote_view(share_token: str) -> dict:
    if len(share_token) < 32:
        raise HTTPException(status_code=404, detail="Quote not found")
    document = await get_db().quotes.find_one(
        {"share_token": share_token, "share_enabled": True}, {"_id": 0}
    )
    if not document:
        raise HTTPException(status_code=404, detail="Quote not found")
    return await public_render_payload(document)
