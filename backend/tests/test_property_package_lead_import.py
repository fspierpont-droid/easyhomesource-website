import pytest

from scripts import import_property_package_leads_20260826 as property_import


def _by_street():
    return {record["street"]: record for record in property_import._validated_sources()}


def test_import_set_contains_17_unique_internal_only_records():
    records = property_import._validated_sources()
    keys = [property_import._address_key(record) for record in records]

    assert len(records) == 17
    assert len(set(keys)) == 17
    assert all(record["public_visible"] is False for record in records)
    assert all(record["featured"] is False for record in records)
    assert all(record["source"] == property_import.SOURCE_LABEL for record in records)


def test_team_status_and_property_type_context_is_preserved():
    records = _by_street()

    assert records["6645 W Erlen Ln"]["property_type"] == "HOME"
    assert records["6645 W Erlen Ln"]["status"] == "AVAILABLE"
    assert records["3219 Welsh St"]["property_type"] == "HOME"
    assert records["3219 Welsh St"]["status"] == "AVAILABLE"
    assert records["18034 Ferry Ave"]["status"] == "UNDER_CONTRACT"
    assert records["26007 Shangri Dr"]["status"] == "COMING_SOON"
    assert records["26314 Glenwood Dr"]["status"] == "COMING_SOON"
    assert records["9248 Denmarsh Dr"]["property_type"] == "LAND"
    assert records["9254 Denmarsh Dr"]["property_type"] == "LAND"


def test_multi_lot_counts_and_unconfirmed_guide_entries_are_not_overstated():
    records = _by_street()

    assert records["5043 Southtowne Loop"]["units"] == 15
    assert records["1295 S Rock Crusher Rd"]["units"] == 23
    assert records["5746 W Lucky Ranch Trail"]["units"] == 1
    assert records["5746 W Lucky Ranch Trail"]["status"] == "STATUS_TO_CONFIRM"
    assert records["716 Hazel Ave"]["status"] == "STATUS_TO_CONFIRM"
    assert records["718 Hazel Ave"]["status"] == "STATUS_TO_CONFIRM"
    assert records["210 C St"]["status"] == "STATUS_TO_CONFIRM"


def test_known_bad_locality_text_from_screenshots_is_normalized():
    records = _by_street()

    assert records["9862 Lake Dr"]["city"] == "Weeki Wachee"
    assert records["9862 Lake Dr"]["zip"] == "34613"
    assert records["9868 Lake Dr"]["city"] == "Weeki Wachee"
    assert records["9868 Lake Dr"]["zip"] == "34613"
    assert records["26314 Glenwood Dr"]["city"] == "Wesley Chapel"
    assert records["26314 Glenwood Dr"]["zip"] == "33544"


def test_address_key_is_tolerant_of_formatting_variants():
    assert property_import._address_key({"street": "18810 St. Paul Dr", "zip": "34610"}) == property_import._address_key(
        {"street": "18810 St Paul Dr", "zip": "34610"}
    )


def test_database_confirmation_gate_blocks_wrong_target(monkeypatch):
    monkeypatch.setenv("DB_NAME", "easyhomesource_production")
    monkeypatch.setenv("PROPERTY_IMPORT_CONFIRM", "something_else")

    with pytest.raises(RuntimeError) as exc:
        property_import._require_explicit_database_confirmation()

    assert "exactly match DB_NAME" in str(exc.value)


def test_database_confirmation_gate_accepts_exact_target(monkeypatch):
    monkeypatch.setenv("DB_NAME", "easyhomesource_production")
    monkeypatch.setenv("PROPERTY_IMPORT_CONFIRM", "easyhomesource_production")

    property_import._require_explicit_database_confirmation()
