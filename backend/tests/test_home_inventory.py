from pydantic import ValidationError

from home_inventory import MAX_PDF_BYTES, InventoryCreate, InventoryUpdate, _normalized_serial
from scripts.import_verified_home_inventory import _require_explicit_database_confirmation


def test_inventory_financial_fields_are_independent() -> None:
    payload = InventoryCreate(
        display_name="Verified Home",
        ehs_retail_price=185000,
        factory_invoice_cost=129500,
        floorplan_financing_balance=163639,
    )
    data = payload.model_dump()

    assert data["ehs_retail_price"] == 185000
    assert data["factory_invoice_cost"] == 129500
    assert data["floorplan_financing_balance"] == 163639


def test_inventory_update_preserves_explicit_nulls_for_unknown_values() -> None:
    payload = InventoryUpdate(
        model_name=None,
        serial_number=None,
        ehs_retail_price=None,
        factory_invoice_cost=None,
        floorplan_financing_balance=None,
    )
    data = payload.model_dump(exclude_unset=True)

    assert data["model_name"] is None
    assert data["serial_number"] is None
    assert data["ehs_retail_price"] is None
    assert data["factory_invoice_cost"] is None
    assert data["floorplan_financing_balance"] is None


def test_inventory_rejects_negative_financial_values() -> None:
    try:
        InventoryCreate(display_name="Bad Financial", factory_invoice_cost=-1)
    except ValidationError:
        return
    raise AssertionError("Negative inventory financial values must be rejected")


def test_inventory_does_not_require_unverified_serial_or_model() -> None:
    payload = InventoryCreate(display_name="Timber Creek — Model to Confirm")
    assert payload.serial_number is None
    assert payload.model_name is None
    assert payload.status == "STATUS_TO_CONFIRM"


def test_serials_are_normalized_before_persistence() -> None:
    assert _normalized_serial("  tchal0102739ab27  ") == "TCHAL0102739AB27"
    assert _normalized_serial("   ") is None
    assert _normalized_serial(None) is None


def test_pdf_limit_stays_below_vercel_function_ceiling() -> None:
    assert MAX_PDF_BYTES == 4 * 1024 * 1024


def test_inventory_import_requires_exact_database_confirmation(monkeypatch) -> None:
    monkeypatch.setenv("DB_NAME", "easyhomesource_production")
    monkeypatch.delenv("INVENTORY_IMPORT_CONFIRM", raising=False)
    try:
        _require_explicit_database_confirmation()
    except RuntimeError:
        pass
    else:
        raise AssertionError("Inventory import must fail without explicit DB confirmation")

    monkeypatch.setenv("INVENTORY_IMPORT_CONFIRM", "wrong_database")
    try:
        _require_explicit_database_confirmation()
    except RuntimeError:
        pass
    else:
        raise AssertionError("Inventory import must fail when confirmation does not match DB_NAME")

    monkeypatch.setenv("INVENTORY_IMPORT_CONFIRM", "easyhomesource_production")
    _require_explicit_database_confirmation()
