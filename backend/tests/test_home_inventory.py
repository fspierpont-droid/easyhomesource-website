from pydantic import ValidationError

from home_inventory import MAX_PDF_BYTES, InventoryCreate, InventoryUpdate, _normalized_serial
from scripts.correct_verified_home_inventory_operations import (
    CORRECTIONS,
    _require_explicit_correction_confirmation,
    _validate_cost_breakdown,
)
from scripts.import_verified_home_inventory import _require_explicit_database_confirmation


def test_inventory_financial_fields_are_independent() -> None:
    payload = InventoryCreate(
        display_name="Verified Home",
        ehs_retail_price=185000,
        invoice_without_freight=129500,
        freight_financed=12000,
        freight_paid=3000,
        final_invoice_total=144500,
        floorplan_financing_balance=163639,
    )
    data = payload.model_dump()

    assert data["ehs_retail_price"] == 185000
    assert data["invoice_without_freight"] == 129500
    assert data["freight_financed"] == 12000
    assert data["freight_paid"] == 3000
    assert data["final_invoice_total"] == 144500
    assert data["floorplan_financing_balance"] == 163639
    assert data["factory_invoice_cost"] is None


def test_inventory_legacy_factory_cost_is_not_auto_mirrored() -> None:
    payload = InventoryCreate(
        display_name="Verified Home",
        invoice_without_freight=103599,
    )
    data = payload.model_dump()
    assert data["invoice_without_freight"] == 103599
    assert data["factory_invoice_cost"] is None


def test_inventory_update_preserves_explicit_nulls_for_unknown_values() -> None:
    payload = InventoryUpdate(
        model_name=None,
        serial_number=None,
        ehs_retail_price=None,
        invoice_without_freight=None,
        freight_financed=None,
        freight_paid=None,
        final_invoice_total=None,
        floorplan_financing_balance=None,
        financing_provider=None,
        ordered_date=None,
        delivered_date=None,
        estimated_offline_date=None,
    )
    data = payload.model_dump(exclude_unset=True)

    assert data["model_name"] is None
    assert data["serial_number"] is None
    assert data["ehs_retail_price"] is None
    assert data["invoice_without_freight"] is None
    assert data["freight_financed"] is None
    assert data["freight_paid"] is None
    assert data["final_invoice_total"] is None
    assert data["floorplan_financing_balance"] is None
    assert data["financing_provider"] is None
    assert data["ordered_date"] is None
    assert data["delivered_date"] is None
    assert data["estimated_offline_date"] is None


def test_inventory_rejects_negative_financial_values() -> None:
    try:
        InventoryCreate(display_name="Bad Financial", freight_financed=-1)
    except ValidationError:
        return
    raise AssertionError("Negative inventory financial values must be rejected")


def test_inventory_rejects_non_iso_operational_dates() -> None:
    try:
        InventoryCreate(display_name="Bad Date", delivered_date="Nov 12, 2025")
    except ValidationError:
        return
    raise AssertionError("Operational inventory dates must use YYYY-MM-DD")


def test_inventory_accepts_hud_labels_and_operational_metadata() -> None:
    payload = InventoryCreate(
        display_name="Verified Home",
        hud_labels=["GEO1631332"],
        financing_provider="Triad",
        ordered_date="2025-08-29",
        delivered_date="2025-11-12",
        estimated_offline_date="2025-11-07",
    )
    data = payload.model_dump()
    assert data["hud_labels"] == ["GEO1631332"]
    assert data["financing_provider"] == "Triad"
    assert data["ordered_date"] == "2025-08-29"
    assert data["delivered_date"] == "2025-11-12"
    assert data["estimated_offline_date"] == "2025-11-07"


def test_inventory_does_not_require_unverified_serial_or_model() -> None:
    payload = InventoryCreate(display_name="Timber Creek — Model to Confirm")
    assert payload.serial_number is None
    assert payload.model_name is None
    assert payload.status == "STATUS_TO_CONFIRM"


def test_serials_are_normalized_before_persistence() -> None:
    assert _normalized_serial("  tchal0102739ab27  ") == "TCHAL0102739AB27"
    assert _normalized_serial("  sou020584alab  ") == "SOU020584ALAB"
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


def test_inventory_correction_requires_exact_database_confirmation(monkeypatch) -> None:
    monkeypatch.setenv("DB_NAME", "easyhomesource_production")
    monkeypatch.delenv("INVENTORY_OPERATIONS_CONFIRM", raising=False)
    try:
        _require_explicit_correction_confirmation()
    except RuntimeError:
        pass
    else:
        raise AssertionError("Inventory correction must fail without explicit DB confirmation")

    monkeypatch.setenv("INVENTORY_OPERATIONS_CONFIRM", "wrong_database")
    try:
        _require_explicit_correction_confirmation()
    except RuntimeError:
        pass
    else:
        raise AssertionError("Inventory correction must fail when confirmation does not match DB_NAME")

    monkeypatch.setenv("INVENTORY_OPERATIONS_CONFIRM", "easyhomesource_production")
    _require_explicit_correction_confirmation()


def test_verified_correction_cost_breakdowns_reconcile() -> None:
    assert len(CORRECTIONS) == 6
    for correction in CORRECTIONS:
        _validate_cost_breakdown(correction["set"])


def test_delilah_identity_correction_is_serial_anchored() -> None:
    correction = next(item for item in CORRECTIONS if item["label"] == "Delilah")
    assert correction["lookup"] == {"serial_number": "TCHAL0102739AB27"}
    assert correction["set"]["display_name"] == "Delilah"
    assert correction["set"]["final_invoice_total"] == 163639.00
