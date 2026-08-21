from quote_models import QuoteCreate


def test_quote_create_accepts_portal_identity_and_customer_snapshot():
    payload = QuoteCreate(
        id="portal-quote-123",
        quote_number="Q-PORTAL-123",
        customer_snapshot={
            "name": "Test Customer",
            "phone": "352-555-0100",
            "email": "test@example.com",
            "address": "Brooksville, FL",
        },
        home={"model_name": "Test Home", "manufacturer": "Test Builder"},
        site={"delivery_address": "123 Test Rd"},
        base_price=100000,
        factory_cost=70000,
        status="DRAFT",
    )
    data = payload.model_dump()
    assert data["id"] == "portal-quote-123"
    assert data["quote_number"] == "Q-PORTAL-123"
    assert data["customer_snapshot"]["name"] == "Test Customer"
    assert data["home"]["model_name"] == "Test Home"


def test_quote_create_accepts_complete_modern_portal_payload_without_dropping_deal_fields():
    payload = QuoteCreate(
        id="portal-quote-full",
        quote_number="Q-2026-999999",
        quote_date="2026-08-21",
        pricing_mode="portal_v05",
        customer_snapshot={
            "name": "Persistence Test",
            "phone": "352-555-0102",
            "email": "persist@example.com",
            "address": "100 Test Ave, Brooksville, FL",
        },
        home={
            "model_name": "Atmos 28603N",
            "manufacturer": "CAVCO Plant City",
            "beds": 3,
            "baths": 2,
            "width": 28,
            "length": 60,
            "dimensions": "28 x 60",
        },
        site={
            "delivery_address": "100 Test Ave, Brooksville, FL",
            "land_price": 49900,
            "delivery_price": 3850,
            "delivery_cost": 3100,
            "delivery_miles": 42,
            "delivery_route_type": "dealer_to_customer",
            "escorts_count": 1,
        },
        base_price=159324.27,
        factory_cost=111000,
        land_price=49900,
        delivery_price=3850,
        delivery_cost=3100,
        mandatory_services=[
            {
                "description": "Block & Tie-Down",
                "qty": 1,
                "unit_price": 12195,
                "cost": 8500,
                "portal_category": "mandatory_services",
            }
        ],
        site_work=[
            {
                "description": "Dirt Pad",
                "qty": 2,
                "unit_price": 1350,
                "cost": 900,
                "portal_category": "site_work",
            }
        ],
        addons=[
            {
                "description": "Customer Upgrade",
                "qty": 1,
                "unit_price": 2500,
                "cost": 1500,
                "portal_category": "addons",
            }
        ],
        discounts=[{"description": "Quote Discount", "amount": 1000}],
        deposits=[
            {
                "label": "Initial Deposit",
                "amount_required": 5000,
                "amount_paid": 5000,
                "status": "received",
                "received_at": "2026-08-21",
                "portal_id": "deposit-1",
            }
        ],
        sales_tax_rate=0.03,
        ehs_loan_used=True,
        financing={
            "purchase_type": "financing",
            "financing_status": "preapproved",
            "pre_approval_amount": 300000,
            "target_budget": 250000,
            "ehs_loan_used": True,
            "active_loan_fee": 1000,
        },
        timeline={
            "loan_approval": "2026-08-21",
            "delivery": "2026-10-15",
            "move_in": "2026-11-01",
        },
        notes_customer="Customer-facing note",
        notes_internal="Internal note",
        status="DRAFT",
    )

    data = payload.model_dump()

    assert data["id"] == "portal-quote-full"
    assert data["quote_number"] == "Q-2026-999999"
    assert data["land_price"] == 49900
    assert data["delivery_price"] == 3850
    assert data["delivery_cost"] == 3100
    assert data["site"]["delivery_miles"] == 42
    assert data["site"]["delivery_route_type"] == "dealer_to_customer"
    assert data["mandatory_services"][0]["unit_price"] == 12195
    assert data["mandatory_services"][0]["portal_category"] == "mandatory_services"
    assert data["site_work"][0]["qty"] == 2
    assert data["addons"][0]["unit_price"] == 2500
    assert data["discounts"][0]["amount"] == 1000
    assert data["deposits"][0]["amount_paid"] == 5000
    assert data["deposits"][0]["portal_id"] == "deposit-1"
    assert data["sales_tax_rate"] == 0.03
    assert data["ehs_loan_used"] is True
    assert data["financing"]["active_loan_fee"] == 1000
    assert data["timeline"]["delivery"] == "2026-10-15"
    assert data["notes_customer"] == "Customer-facing note"
    assert data["notes_internal"] == "Internal note"


def test_quote_create_defaults_to_server_generated_identity_when_not_supplied():
    payload = QuoteCreate(base_price=100000, factory_cost=70000)
    data = payload.model_dump()
    assert data["id"] is None
    assert data["quote_number"] is None
