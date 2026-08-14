from catalog import _public_home


def test_public_home_projection_excludes_internal_cost_and_audit_fields() -> None:
    source = {
        "id": "home-1",
        "manufacturer": "Example Builder",
        "series": "Example Series",
        "model_name": "Example Model",
        "beds": 3,
        "baths": 2,
        "sqft": 1600,
        "ehs_price": 125000,
        "msrp": 140000,
        "est_factory_cost": 82000,
        "created_by_id": "employee-1",
        "updated_by_id": "employee-2",
        "internal_note": "private",
        "active": True,
    }

    public = _public_home(source)

    assert public["id"] == "home-1"
    assert public["ehs_price"] == 125000
    assert "est_factory_cost" not in public
    assert "created_by_id" not in public
    assert "updated_by_id" not in public
    assert "internal_note" not in public
