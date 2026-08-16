from pricing import calculate_ehs_price, calculate_quote_totals, public_quote
from pricing_rules import apply_pricing_rules, validate_quote


def test_factory_cost_formula_produces_customer_price_above_cost() -> None:
    factory_cost = 80000.0
    price = calculate_ehs_price(factory_cost)
    assert price > factory_cost


def test_required_services_and_dirt_pad_are_applied_once() -> None:
    quote = {
        "base_price": 100000,
        "factory_cost": 70000,
        "home": {"model_name": "Test Home"},
        "site": {"dirt_pad_needed": True, "dirt_pad_loads": 3},
        "options": [],
        "mandatory_services": [],
        "addons": [],
        "site_work": [],
        "suppressed_required_service_ids": [],
    }

    priced = apply_pricing_rules(quote)
    ids = [item.get("service_id") for item in priced["mandatory_services"]]

    assert ids.count("SITE-STEPS-2SET") == 1
    assert ids.count("SITE-PERMIT-PLAN") == 1
    assert ids.count("SITE-DIRT") == 1


def test_quote_totals_match_expected_tax_basis() -> None:
    quote = {
        "base_price": 100000,
        "factory_cost": 70000,
        "options": [{"description": "Option", "qty": 1, "unit_price": 5000, "cost": 2500}],
        "mandatory_services": [{"description": "Permit", "qty": 1, "unit_price": 2000, "cost": 500}],
        "addons": [{"description": "Non-financed", "qty": 1, "unit_price": 1000, "cost": 500, "included_in_financing": False}],
        "site_work": [],
        "discounts": [{"description": "Discount", "amount": 1000}],
        "deposits": [{"label": "Deposit", "amount_paid": 2000}],
        "sales_tax_rate": 0.03,
        "ehs_loan_used": False,
    }

    totals = calculate_quote_totals(quote)

    assert totals["subtotal"] == 107000.0
    assert totals["tax_basis"] == 106000.0
    assert totals["sales_tax"] == 3180.0
    assert totals["grand_total"] == 110180.0
    assert totals["balance_due"] == 108180.0


def test_public_quote_redacts_internal_pricing_data() -> None:
    quote = {
        "id": "quote-1",
        "factory_cost": 70000,
        "base_price": 100000,
        "notes_internal": "private note",
        "options": [
            {
                "description": "Option",
                "qty": 1,
                "unit_price": 5000,
                "cost": 2500,
                "override_reason": "internal",
            }
        ],
        "mandatory_services": [],
        "addons": [],
        "site_work": [],
        "totals": {
            "grand_total": 105000,
            "factory_cost": 70000,
            "gross_margin": 30000,
            "internal_only": {"net_take_home": 20000},
        },
    }

    public = public_quote(quote)

    assert "factory_cost" not in public
    assert "notes_internal" not in public
    assert "cost" not in public["options"][0]
    assert "override_reason" not in public["options"][0]
    assert "factory_cost" not in public["totals"]
    assert "gross_margin" not in public["totals"]
    assert "internal_only" not in public["totals"]


def test_finalization_blocks_unresolved_bid_line() -> None:
    quote = {
        "home": {"model_name": "Test Home"},
        "base_price": 100000,
        "factory_cost": 70000,
        "site": {"dirt_pad_needed": True, "dirt_pad_loads": 0},
        "mandatory_services": [
            {
                "description": "Bid item",
                "qty": 1,
                "unit_price": 0,
                "cost": 0,
                "requires_bid": True,
            }
        ],
        "options": [],
        "addons": [],
        "site_work": [],
    }

    validation = validate_quote(quote, finalizing=True)

    assert validation["errors"]
