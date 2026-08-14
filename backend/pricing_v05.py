"""Exact persistence-side parity for the current portal V05 quote builder.

This module intentionally mirrors data/pricingSpreadsheet.ts
calculateComprehensiveQuoteTotals. It does not add hidden services or mutate the
salesperson's visible quote composition.
"""
from __future__ import annotations

from typing import Any

from pricing import money_round

PORTAL_V05_PRICING_MODE = "portal_v05"
PORTAL_V05_PRICING_VERSION = "ERP-V05-PORTAL"


def _line_total(items: list[dict[str, Any]], key: str) -> float:
    return sum(
        float(item.get("qty", 1) or 0) * float(item.get(key, 0) or 0)
        for item in items or []
    )


def calculate_portal_v05_quote_totals(
    quote: dict[str, Any], settings: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Mirror the current frontend quote-builder math exactly."""
    settings = settings or {}
    home_subtotal = float(quote.get("base_price") or 0)
    land_subtotal = float(quote.get("land_price") or 0)
    delivery_total = float(quote.get("delivery_price") or 0)
    delivery_cost = float(quote.get("delivery_cost") or 0)

    mandatory = quote.get("mandatory_services") or []
    site_work = quote.get("site_work") or []
    addons = quote.get("addons") or []
    options = quote.get("options") or []

    site_work_total = _line_total(mandatory, "unit_price") + _line_total(site_work, "unit_price")
    addons_total = _line_total(addons, "unit_price") + _line_total(options, "unit_price")
    site_work_cost = _line_total(mandatory, "cost") + _line_total(site_work, "cost")
    addons_cost = _line_total(addons, "cost") + _line_total(options, "cost")

    discounts_total = sum(float(item.get("amount", 0) or 0) for item in quote.get("discounts") or [])
    subtotal = home_subtotal + land_subtotal + delivery_total + site_work_total + addons_total - discounts_total
    financed_subtotal = subtotal
    non_financed_subtotal = 0.0
    tax_basis = subtotal

    tax_rate_value = quote.get("sales_tax_rate")
    tax_rate = float(tax_rate_value if tax_rate_value is not None else settings.get("sales_tax_rate", 0.03))
    sales_tax = money_round(tax_basis * tax_rate)
    estimated_total = money_round(subtotal + sales_tax)

    factory_cost = float(quote.get("factory_cost") or 0)
    if factory_cost <= 0 and home_subtotal > 0:
        factory_cost = round(home_subtotal * 0.72)

    house_gross_margin = home_subtotal - factory_cost
    commissionable_house_margin = max(0.0, house_gross_margin - 1000.0)
    service_profit = (delivery_total - delivery_cost) + (site_work_total - site_work_cost) + (addons_total - addons_cost)
    admin_fee = money_round(subtotal * float(settings.get("admin_fee_pct", 0.05)))

    # calculateComprehensiveQuoteTotals currently records loan_fee as zero. The
    # builder displays its optional $1,000 loan-officer deduction separately.
    loan_fee = 0.0
    salesperson_commission = money_round(
        commissionable_house_margin * float(settings.get("agent_comm_pct", 0.20))
    ) if commissionable_house_margin > 0 else 0.0
    net_take_home = house_gross_margin + service_profit - admin_fee - loan_fee - salesperson_commission
    take_home_floor = float(settings.get("take_home_floor", 20000.0))

    deposits_paid = money_round(
        sum(float(item.get("amount_paid", 0) or 0) for item in quote.get("deposits") or [])
    )
    balance_due = money_round(estimated_total - deposits_paid)

    internal_only = {
        "factory_cost": money_round(factory_cost),
        "ehs_price_calculated": money_round(home_subtotal),
        "house_gross_margin": money_round(house_gross_margin),
        "gross_margin": money_round(house_gross_margin),
        "commissionable_house_margin": money_round(commissionable_house_margin),
        "service_profit": money_round(service_profit),
        "admin_fee": admin_fee,
        "loan_fee": loan_fee,
        "agent_commission": salesperson_commission,
        "salesperson_commission": salesperson_commission,
        "net_take_home": money_round(net_take_home),
        "take_home_floor": take_home_floor,
        "target_met": net_take_home >= take_home_floor,
        "total_services_cost": money_round(delivery_cost + site_work_cost + addons_cost),
        "total_services_profit": money_round(service_profit),
    }

    return {
        "pricing_mode": PORTAL_V05_PRICING_MODE,
        "pricing_version": PORTAL_V05_PRICING_VERSION,
        "home_total": money_round(home_subtotal),
        "home_subtotal": money_round(home_subtotal),
        "land_subtotal": money_round(land_subtotal),
        "delivery_total": money_round(delivery_total),
        "site_work_total": money_round(site_work_total),
        "site_work_subtotal": money_round(site_work_total),
        "addons_total": money_round(addons_total),
        "addons_subtotal": money_round(addons_total),
        "discounts_total": money_round(discounts_total),
        "customer_subtotal": money_round(subtotal),
        "subtotal": money_round(subtotal),
        "financed_subtotal": money_round(financed_subtotal),
        "non_financed_subtotal": money_round(non_financed_subtotal),
        "tax_basis": money_round(tax_basis),
        "sales_tax_rate": tax_rate,
        "sales_tax_total": sales_tax,
        "sales_tax": sales_tax,
        "estimated_total": estimated_total,
        "grand_total": estimated_total,
        "deposits_paid": deposits_paid,
        "balance_due": balance_due,
        "internal_only": internal_only,
        **internal_only,
    }
