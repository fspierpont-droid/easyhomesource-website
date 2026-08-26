import json

import pytest
from fastapi import HTTPException

import delivery
from delivery import DeliveryEstimateRequest, GeocodeRequest, estimate_delivery, geocode_address


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


def test_google_routes_distance_is_rounded_up_before_pricing(monkeypatch):
    monkeypatch.setenv("GOOGLE_MAPS_API_KEY", "test-key")
    monkeypatch.setattr(
        delivery,
        "_google_route_distance",
        lambda origin, destination, key: (
            52.2,
            "52.2 mi",
            "1 hr 4 min",
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

    assert result.source == "google_routes"
    assert result.miles == 53
    assert result.distance_text == "52.2 mi"
    assert result.duration_text == "1 hr 4 min"
    assert result.escort_count == 1
    assert result.delivery_cost == 1081.5
    assert result.delivery_price == 1189.65


def test_routes_request_uses_server_key_field_mask_and_stable_traffic_unaware_route(monkeypatch):
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self):
            return json.dumps(
                {"routes": [{"distanceMeters": 84008, "duration": "3840s"}]}
            ).encode("utf-8")

    def fake_urlopen(request, timeout):
        captured["request"] = request
        captured["timeout"] = timeout
        return FakeResponse()

    monkeypatch.setattr(delivery, "urlopen", fake_urlopen)
    miles, distance_text, duration_text, origin, destination = delivery._google_route_distance(
        "9011 McIntyre Rd, Brooksville, FL 34601",
        "27449 St Clair Rd, Brooksville, FL 34602",
        "server-key",
    )

    request = captured["request"]
    payload = json.loads(request.data.decode("utf-8"))
    headers = {key.lower(): value for key, value in request.header_items()}

    assert request.full_url == "https://routes.googleapis.com/directions/v2:computeRoutes"
    assert request.get_method() == "POST"
    assert captured["timeout"] == 12
    assert headers["x-goog-api-key"] == "server-key"
    assert headers["x-goog-fieldmask"] == "routes.distanceMeters,routes.duration"
    assert payload["origin"]["address"].startswith("9011 McIntyre")
    assert payload["destination"]["address"].startswith("27449 St Clair")
    assert payload["travelMode"] == "DRIVE"
    assert payload["routingPreference"] == "TRAFFIC_UNAWARE"
    assert miles == pytest.approx(84008 / delivery.METERS_PER_MILE)
    assert distance_text.endswith(" mi")
    assert duration_text == "1 hr 4 min"
    assert origin.startswith("9011 McIntyre")
    assert destination.startswith("27449 St Clair")


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


def test_project_geocode_requires_server_side_maps_configuration(monkeypatch):
    _clear_maps_env(monkeypatch)
    with pytest.raises(HTTPException) as exc:
        geocode_address(
            GeocodeRequest(address="10198 Inlet St, Weeki Wachee, FL 34613"),
            _user={"id": "test-user"},
        )

    assert exc.value.status_code == 503
    assert "google maps" in str(exc.value.detail).lower()


def test_project_geocode_returns_verified_coordinates(monkeypatch):
    monkeypatch.setenv("GOOGLE_MAPS_API_KEY", "test-key")
    monkeypatch.setattr(
        delivery,
        "_google_geocode",
        lambda address, key: (
            28.5571,
            -82.5773,
            "10198 Inlet St, Weeki Wachee, FL 34613, USA",
        ),
    )

    result = geocode_address(
        GeocodeRequest(address="10198 Inlet St, Weeki Wachee, FL 34613"),
        _user={"id": "test-user"},
    )

    assert result.ok is True
    assert result.source == "google_geocoding"
    assert result.latitude == 28.5571
    assert result.longitude == -82.5773
    assert result.formatted_address.startswith("10198 Inlet St")


def test_google_maps_key_is_preferred_but_legacy_variable_remains_supported(monkeypatch):
    _clear_maps_env(monkeypatch)
    monkeypatch.setenv("GOOGLE_DISTANCE_MATRIX_API_KEY", "legacy-key")
    assert delivery._maps_key() == "legacy-key"
    monkeypatch.setenv("GOOGLE_MAPS_API_KEY", "primary-key")
    assert delivery._maps_key() == "primary-key"
