from properties import PropertyCreate, PropertyUpdate, _public_property


def test_property_create_preserves_map_and_sales_fields():
    payload = PropertyCreate(
        street="123 Test Rd",
        city="Brooksville",
        county="Hernando",
        latitude=28.55,
        longitude=-82.39,
        status="AVAILABLE",
        property_type="LAND_HOME_PACKAGE",
        builder="Test Builder",
        community="Test Community",
        price=199900,
        bedrooms=3,
        bathrooms=2,
        square_feet=1400,
        lot_size="0.50 acres",
        parcel_number="TEST-123",
        zoning="R-1M",
        flood_zone="Zone X",
        utilities={"water": "WELL", "sewer": "SEPTIC", "electric": "DUKE"},
        public_visible=True,
    )
    data = payload.model_dump()
    assert data["latitude"] == 28.55
    assert data["longitude"] == -82.39
    assert data["property_type"] == "LAND_HOME_PACKAGE"
    assert data["parcel_number"] == "TEST-123"
    assert data["utilities"]["water"] == "WELL"


def test_property_update_keeps_explicit_nulls_for_clearing_optional_fields():
    payload = PropertyUpdate(builder=None, price=None)
    data = payload.model_dump(exclude_unset=True)
    assert "builder" in data and data["builder"] is None
    assert "price" in data and data["price"] is None


def test_public_projection_excludes_internal_notes_and_employee_metadata():
    projected = _public_property(
        {
            "id": "EHS-PROP-1",
            "street": "123 Test Rd",
            "city": "Brooksville",
            "state": "FL",
            "zip": "34601",
            "county": "Hernando",
            "latitude": 28.55,
            "longitude": -82.39,
            "status": "AVAILABLE",
            "property_type": "HOME",
            "price": 189900,
            "notes_public": "Customer-safe note",
            "notes_internal": "Never expose this",
            "created_by_id": "secret-user-id",
            "updated_by_id": "secret-user-id",
        }
    )
    assert projected["notes_public"] == "Customer-safe note"
    assert "notes_internal" not in projected
    assert "created_by_id" not in projected
    assert "updated_by_id" not in projected
