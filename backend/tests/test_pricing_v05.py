from pricing_v05 import calculate_portal_v05_quote_totals


def test_portal_v05_totals_match_frontend_formula_exactly():
    quote = {
        "pricing_mode": "portal_v05",
        "base_price": 100000,
        "factory_cost": 70000,
        "site": {
            "land_price": 50000,
            "delivery_price": 4000,
            "delivery_cost": 3500,
        },
        "mandatory_services": [
            {"description": "Visible site work", "qty": 1, "unit_price": 30000, "cost": 22500}
        ],
        "site_work": [],
        "addons": [
            {"description": "Visible add-on", "qty": 1, "unit_price": 5000, "cost": 3500}
        ],
        "options": [],
        "discounts": [{"description": "Discount", "amount": 1000}],
        "deposits": [],
        "sales_tax_rate": 0.03,
    }

    totals = calculate_portal_v05_quote_totals(quote)

    assert totals["home_subtotal"] == 100000.0
    assert totals["land_subtotal"] == 50000.0
    assert totals["delivery_total"] == 4000.0
    assert totals["site_work_total"] == 30000.0
    assert totals["addons_total"] == 5000.0
    assert totals["discounts_total"] == 1000.0
    assert totals["subtotal"] == 188000.0
    assert totals["tax_basis"] == 188000.0
    assert totals["sales_tax_total"] == 5640.0
    assert totals["estimated_total"] == 193640.0

    # Verified Master Quote 5 internal formula:
    # gross margin 30,000 - 5% admin (1,500) = 28,500 commissionable;
    # salesperson commission = 20% of 28,500 = 5,700.
    assert totals["house_gross_margin"] == 30000.0
    assert totals["commissionable_house_margin"] == 28500.0
    assert totals["salesperson_commission"] == 5700.0
    assert totals["service_profit"] == 9500.0
    assert totals["admin_fee"] == 1500.0
    assert totals["net_take_home"] == 32300.0


def test_portal_v05_does_not_require_hidden_default_lines_for_totals():
    quote = {
        "pricing_mode": "portal_v05",
        "base_price": 100000,
        "factory_cost": 70000,
        "site": {"land_price": 0, "delivery_price": 0, "delivery_cost": 0},
        "mandatory_services": [],
        "site_work": [],
        "addons": [],
        "options": [],
        "discounts": [],
        "deposits": [],
        "sales_tax_rate": 0.03,
    }

    totals = calculate_portal_v05_quote_totals(quote)
    assert totals["subtotal"] == 100000.0
    assert totals["estimated_total"] == 103000.0
