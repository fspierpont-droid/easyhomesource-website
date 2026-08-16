from properties import _public_property


def test_public_property_projection_does_not_leak_internal_fields() -> None:
    source = {
        "id": "EHS-TEST",
        "street": "100 Example Rd",
        "city": "Brooksville",
        "state": "FL",
        "zip": "34601",
        "county": "Hernando",
        "status": "Available Now",
        "property_type": "Vacant Lot / Land",
        "units": 1,
        "lot_size": "1 acre",
        "package_price": 150000,
        "notes_public": "Public note",
        "notes_internal": "Never expose this",
        "sales_rep": "Internal Rep",
        "source": "Internal source",
        "created_by_id": "employee-1",
        "updated_by_id": "employee-2",
        "featured": True,
        "compatible_home_ids": ["home-1"],
        "display_order": 1,
    }

    public = _public_property(source)

    assert public["id"] == "EHS-TEST"
    assert public["notes_public"] == "Public note"
    assert "notes_internal" not in public
    assert "sales_rep" not in public
    assert "source" not in public
    assert "created_by_id" not in public
    assert "updated_by_id" not in public
