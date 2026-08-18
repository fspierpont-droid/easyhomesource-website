from copy import deepcopy

from legacy_quotes import archive_legacy_quote


def test_archive_legacy_quote_preserves_historical_values_without_mutating_source():
    source = {
        "id": "old-quote-1",
        "quote_number": "2026_05_01_PIERPONT_ATMOS",
        "quote_date": "2026-05-01",
        "status": "sent_to_buyer",
        "customer_snapshot": {"first_name": "Jane", "last_name": "Buyer", "phone": "352-555-0101"},
        "home": {"manufacturer": "CAVCO", "model_name": "Atmos 28603N"},
        "base_price": 159324.27,
        "mandatory_services": [{"description": "Block & Tie Down", "qty": 1, "unit_price": 12195}],
        "totals": {"subtotal": 233394.27, "sales_tax": 7001.83, "grand_total": 240396.10},
        "share_token": "retired-public-token",
        "share_enabled": True,
    }
    original = deepcopy(source)

    archived = archive_legacy_quote(source, archived_at="2026-08-18T19:00:00+00:00")

    assert source == original
    assert archived["id"] == "legacy:old-quote-1"
    assert archived["legacy_source_id"] == "old-quote-1"
    assert archived["legacy_read_only"] is True
    assert archived["pricing_preserved"] is True
    assert archived["quote_number"] == source["quote_number"]
    assert archived["customer_snapshot"] == source["customer_snapshot"]
    assert archived["home"] == source["home"]
    assert archived["base_price"] == source["base_price"]
    assert archived["mandatory_services"] == source["mandatory_services"]
    assert archived["totals"] == source["totals"]
    assert archived["legacy_original_share_token"] == "retired-public-token"
    assert archived["share_token"] is None
    assert archived["share_enabled"] is False


def test_archive_legacy_quote_can_fall_back_to_quote_number_for_identity():
    archived = archive_legacy_quote(
        {"quote_number": "OLD-Q-100", "totals": {"grand_total": 123456.78}},
        archived_at="2026-08-18T19:00:00+00:00",
    )

    assert archived["id"] == "legacy:OLD-Q-100"
    assert archived["legacy_source_id"] == "OLD-Q-100"
    assert archived["totals"]["grand_total"] == 123456.78
