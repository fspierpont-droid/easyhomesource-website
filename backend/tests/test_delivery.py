import pytest
from fastapi import HTTPException

import delivery
from delivery import DeliveryEstimateRequest, estimate_delivery


def _clear_maps_env(monkeypatch):
    monkeypatch.delenv("GOOGLE_DISTANCE_MATRIX_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_MAPS_API_KEY", raising=False)


def test_manual_route_fallback_prices_double_section_without_returning_zero(monkeypatch):
    _clear_maps_env(monkeypatch)
    result = estimate_delivery(
        DeliveryEstimateRequest(
            delivery_address="27449 St Clair Rd, Brooksville, FL 34602",
            route_type="dealer_to_customer",
            manual_miles=25,
            home_width=28,
        ),
        _user={"id": "test-user"},
    )

    assert result.source == "manual_fallback"
    assert result.miles == 25
    assert result.transport_sides == 2
    assert result.escort_count == 2
    assert result.delivery_cost == 2600
    assert result.delivery_price == 2860


def test_factory_route_keeps_master_quote_baseline_when_maps_is_not_configured(monkeypatch):
    _clear_maps_env(monkeypatch)
    result = estimate_delivery(
        DeliveryEstimateRequest(
            delivery_address="27449 St Clair Rd, Brooksville, FL 34602",
            factory_address="605 S Frontage Road, Plant City, FL 33563",
            route_type="factory_to_customer",
            home_width=28,
        ),
        _user={"id": "test-user"},
    )

    assert result.source == "factory_baseline"
    assert result.transport_sides == 2
    assert result.delivery_cost == 12000
    assert result.delivery_price == 13200
    assert "Master Quote 5" in (result.warning or "")


def test_google_driving_distance_is_rounded_up_before_pricing(monkeypatch):
    monkeypatch.setenv("GOOGLE_MAPS_API_KEY", "test-key")
    monkeypatch.setattr(
        delivery,
        "_google_distance",
        lambda origin, destination, key: (
            52.2,
            "52.2 mi",
            "1 hour 4 mins",
            "9011 McIntyre Rd, Brooksville, FL 34601",
            "27449 St Clair Rd, Brooksville, FL 34602",
        ),
    )

    result = estimate_delivery(
        DeliveryEstimateRequest(
            delivery_address="27449 St Clair Rd, Brooksville, FL 34602",
            route_type="dealer_to_customer",
            home_width=14,
        ),
        _user={"id": "test-user"},
    )

    assert result.source == "google_distance_matrix"
    assert result.miles == 53
    assert result.escort_count == 1
    assert result.delivery_cost == 1081.5
    assert result.delivery_price == 1189.65


def test_dealership_route_fails_loudly_instead_of_saving_zero_when_no_route_exists(monkeypatch):
    _clear_maps_env(monkeypatch)
    with pytest.raises(HTTPException) as exc:
        estimate_delivery(
            DeliveryEstimateRequest(
                delivery_address="27449 St Clair Rd, Brooksville, FL 34602",
                route_type="dealer_to_customer",
                home_width=28,
            ),
            _user={"id": "test-user"},
        )

    assert exc.value.status_code == 503
    assert "manual route miles" in str(exc.value.detail).lower()
