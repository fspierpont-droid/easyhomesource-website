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


def test_quote_create_defaults_to_server_generated_identity_when_not_supplied():
    payload = QuoteCreate(base_price=100000, factory_cost=70000)
    data = payload.model_dump()
    assert data["id"] is None
    assert data["quote_number"] is None
