import pytest
from pydantic import ValidationError

from catalog_overrides import CatalogOverrideWrite, _public
from main import app


def test_catalog_override_requires_a_surface_slug() -> None:
    with pytest.raises(ValidationError):
        CatalogOverrideWrite(name="Paxton", manufacturer="CAVCO Plant City")

    payload = CatalogOverrideWrite(quote_slug="cavco-plant-city-paxton-28523a", ehs_price=158888)
    assert payload.quote_slug == "cavco-plant-city-paxton-28523a"


def test_public_override_never_exposes_factory_cost() -> None:
    document = {
        "catalog_key": "quote:cavco-plant-city-paxton-28523a",
        "quote_slug": "cavco-plant-city-paxton-28523a",
        "public_slug": "paxton",
        "ehs_price": 158888,
        "starting_price": 158888,
        "est_factory_cost": 98031,
        "updated_by_id": "admin-1",
    }
    public = _public(document)
    assert public["public_slug"] == "paxton"
    assert public["ehs_price"] == 158888
    assert "est_factory_cost" not in public
    assert "updated_by_id" not in public


def test_catalog_override_routes_are_registered() -> None:
    routes = {(route.path, tuple(sorted(route.methods or []))) for route in app.routes}
    assert ("/api/catalog-overrides/public", ("GET",)) in routes
    assert ("/api/catalog-overrides", ("GET",)) in routes
    assert ("/api/catalog-overrides/{catalog_key}", ("PUT",)) in routes
    assert ("/api/catalog-overrides/{catalog_key}", ("DELETE",)) in routes
