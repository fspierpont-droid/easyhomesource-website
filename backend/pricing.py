"""Easy HomeSource quote pricing calculations.

This module preserves the established EHS pricing math while removing legacy
startup/router side effects from the old staging backend.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Any

CURVE_MULTIPLIER = 0.454
PRICE_MULTIPLIER = 85.0
TAKE_HOME_FLOOR_NUMERATOR = 27368.0
MSRP_MARKUP_OVER_COST = 0.15

DEFAULT_SETTINGS: dict[str, Any] = {
    "admin_fee_pct": 0.05,
    "agent_comm_pct": 0.20,
    "loan_fee": 1000.0,
    "take_home_floor": 20000.0,
    "msrp_markup_over_cost": 0.15,
    "sales_tax_rate": 0.03,
    "material_surcharge": 2000.0,
    "state_dues_per_floor": 200.0,
    "national_mhi_dues": 35.0,
    "company_name": "Easy HomeSource",
    "company_address": "9011 McIntyre Rd, Brooksville, FL 34601",
    "company_phone": "(352) 558-8888",
    "company_email": "info@easyhomesource.com",
    "company_tagline": "Your trusted manufactured home dealership",
    "default_disclaimer": (
        "Site development pricing is an estimate based on visible conditions. "
        "Final pricing is subject to change based on actual site-specific requirements "
        "during installation. Prices are valid for 30 days from the quote date."
    ),
    "default_next_steps": (
        "1. Review this quote and contact your associate with any questions.\n"
        "2. Sign the deposit agreement to reserve your home.\n"
        "3. Schedule your site visit and begin the financing process."
    ),
}


def money_round(value: Any) -> float:
    return float(
        Decimal(str(value or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    )


def pricing_multiplier(unit_factory_cost: float) -> float:
    if unit_factory_cost <= 0:
        return 0.0
    floor = TAKE_HOME_FLOOR_NUMERATOR / unit_factory_cost
    curve = PRICE_MULTIPLIER * (unit_factory_cost ** (-CURVE_MULTIPLIER))
    return max(floor, curve)


def calculate_ehs_price(unit_factory_cost: float) -> float:
    if unit_factory_cost <= 0:
        return 0.0
    return unit_factory_cost * (1.0 + pricing_multiplier(unit_factory_cost))


def calculate_msrp(
    unit_factory_cost: float, ehs_price: float | None = None
) -> float:
    if ehs_price is None:
        ehs_price = calculate_ehs_price(unit_factory_cost)
    return ehs_price + MSRP_MARKUP_OVER_COST * unit_factory_cost


def _line_total(items: list[dict[str, Any]], price_key: str = "unit_price") -> float:
    return sum(
        float(item.get("qty", 1) or 0) * float(item.get(price_key, 0) or 0)
        for item in items or []
    )


def _line_cost_total(items: list[dict[str, Any]]) -> float:
    return sum(
        float(item.get("qty", 1) or 0) * float(item.get("cost", 0) or 0)
        for item in items or []
    )


def calculate_quote_totals(
    quote: dict[str, Any], settings: dict[str, Any] | None = None
) -> dict[str, Any]:
    s = {**DEFAULT_SETTINGS, **(settings or {})}

    base_price = float(quote.get("base_price") or 0)
    factory_cost = float(quote.get("factory_cost") or 0)
    options = quote.get("options") or []
    mandatory = quote.get("mandatory_services") or []
    addons = quote.get("addons") or []
    site_work = quote.get("site_work") or []
    discounts = quote.get("discounts") or []
    deposits = quote.get("deposits") or []

    options_subtotal = _line_total(options)
    mandatory_subtotal = _line_total(mandatory)
    addons_subtotal = _line_total(addons)
    site_work_subtotal = _line_total(site_work)
    discounts_total = sum(float(d.get("amount", 0) or 0) for d in discounts)

    home_subtotal = base_price + options_subtotal
    services_subtotal = mandatory_subtotal + addons_subtotal + site_work_subtotal

    financed_subtotal = base_price
    non_financed_subtotal = 0.0
    for section_items in (options, mandatory, addons, site_work):
        for item in section_items:
            line_amount = float(item.get("qty", 1) or 0) * float(
                item.get("unit_price", 0) or 0
            )
            if item.get("included_in_financing") is False:
                non_financed_subtotal += line_amount
            else:
                financed_subtotal += line_amount

    subtotal = max(0.0, home_subtotal + services_subtotal - discounts_total)
    tax_rate_val = quote.get("sales_tax_rate")
    if tax_rate_val is None:
        tax_rate_val = s["sales_tax_rate"]
    tax_rate = float(tax_rate_val)

    rounded_subtotal = money_round(subtotal)
    tax_basis = max(0.0, financed_subtotal - discounts_total)
    sales_tax = money_round(tax_basis * tax_rate)
    grand_total = money_round(rounded_subtotal + sales_tax)
    deposits_paid = money_round(
        sum(float(d.get("amount_paid", 0) or 0) for d in deposits)
    )
    balance_due = money_round(grand_total - deposits_paid)

    options_cost = _line_cost_total(options)
    services_cost = (
        _line_cost_total(mandatory)
        + _line_cost_total(addons)
        + _line_cost_total(site_work)
    )
    total_services_profit = services_subtotal - services_cost

    gross_margin = base_price - factory_cost if factory_cost > 0 else 0.0
    gross_margin += options_subtotal - options_cost
    admin_fee = gross_margin * float(s["admin_fee_pct"]) if gross_margin > 0 else 0.0
    loan_fee = float(s["loan_fee"]) if quote.get("ehs_loan_used") else 0.0
    agent_commission = max(
        0.0,
        (gross_margin - admin_fee - loan_fee) * float(s["agent_comm_pct"]),
    )
    net_take_home = gross_margin - admin_fee - loan_fee - agent_commission

    ehs_price_calculated = (
        calculate_ehs_price(factory_cost) if factory_cost > 0 else 0.0
    )
    msrp_calculated = (
        calculate_msrp(factory_cost, ehs_price_calculated)
        if factory_cost > 0
        else 0.0
    )
    target_met = net_take_home >= float(s["take_home_floor"])

    home_total = money_round(home_subtotal)
    delivery_total = money_round(site_work_subtotal)
    site_work_total = money_round(mandatory_subtotal)
    addons_total = money_round(addons_subtotal)

    internal_only = {
        "factory_cost": money_round(factory_cost),
        "ehs_price_calculated": money_round(ehs_price_calculated),
        "msrp_calculated": money_round(msrp_calculated),
        "gross_margin": money_round(gross_margin),
        "house_gross_margin": money_round(gross_margin),
        "commissionable_house_margin": money_round(gross_margin - admin_fee - loan_fee),
        "service_profit": money_round(total_services_profit),
        "admin_fee": money_round(admin_fee),
        "loan_fee": money_round(loan_fee),
        "agent_commission": money_round(agent_commission),
        "salesperson_commission": money_round(agent_commission),
        "net_take_home": money_round(net_take_home),
        "take_home_floor": float(s["take_home_floor"]),
        "target_met": bool(target_met),
        "total_services_cost": money_round(services_cost),
        "total_services_profit": money_round(total_services_profit),
    }

    return {
        "home_total": home_total,
        "delivery_total": delivery_total,
        "site_work_total": site_work_total,
        "addons_total": addons_total,
        "customer_subtotal": rounded_subtotal,
        "tax_basis": money_round(tax_basis),
        "sales_tax_rate": tax_rate,
        "sales_tax_total": sales_tax,
        "estimated_total": grand_total,
        "financed_subtotal": money_round(financed_subtotal),
        "non_financed_subtotal": money_round(non_financed_subtotal),
        "internal_only": internal_only,
        "home_subtotal": home_total,
        "base_price": money_round(base_price),
        "options_subtotal": money_round(options_subtotal),
        "mandatory_services_subtotal": money_round(mandatory_subtotal),
        "addons_subtotal": money_round(addons_subtotal),
        "site_work_subtotal": money_round(site_work_subtotal),
        "services_subtotal": money_round(services_subtotal),
        "discounts_total": money_round(discounts_total),
        "subtotal": rounded_subtotal,
        "sales_tax": sales_tax,
        "grand_total": grand_total,
        "deposits_paid": deposits_paid,
        "balance_due": balance_due,
        **internal_only,
    }


INTERNAL_FIELDS = {
    "factory_cost",
    "ehs_price_calculated",
    "msrp_calculated",
    "gross_margin",
    "salesperson_commission",
    "service_profit",
    "commissionable_house_margin",
    "house_gross_margin",
    "admin_fee",
    "loan_fee",
    "agent_commission",
    "net_take_home",
    "take_home_floor",
    "target_met",
    "total_services_cost",
    "total_services_profit",
    "internal_only",
}


def public_totals(totals: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in totals.items() if key not in INTERNAL_FIELDS}


def public_quote(quote: dict[str, Any]) -> dict[str, Any]:
    """Return a customer-safe quote with all internal cost/margin data removed."""
    blocked_top_level = {
        "factory_cost",
        "internal_notes",
        "notes_internal",
        "ehs_loan_used",
        "ehs_price_override",
        "ehs_price_override_reason",
        "calculation_snapshot",
        "validation",
        "created_by_id",
        "updated_by_id",
        "owner_id",
    }
    safe = {
        key: value for key, value in quote.items() if key not in blocked_top_level
    }

    def strip_costs(items: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
        blocked_line_fields = {
            "cost",
            "calculation_snapshot",
            "override_audit",
            "override_reason",
        }
        return [
            {
                key: value
                for key, value in item.items()
                if key not in blocked_line_fields
            }
            for item in items or []
        ]

    for section in ("options", "mandatory_services", "addons", "site_work"):
        safe[section] = strip_costs(safe.get(section))

    if isinstance(safe.get("totals"), dict):
        safe["totals"] = public_totals(safe["totals"])
    return safe
