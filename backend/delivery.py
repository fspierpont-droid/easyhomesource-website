"""Authenticated route-aware delivery calculation for the permanent quote portal."""
from __future__ import annotations

import json
import math
import os
from typing import Optional
from urllib.parse import urlencode
from urllib.request import urlopen

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user

router = APIRouter(prefix="/api/delivery-calculator", tags=["delivery-calculator"])

DEFAULT_DEALERSHIP_ADDRESS = "9011 McIntyre Rd, Brooksville, FL 34601"
DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json"
GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"
METERS_PER_MILE = 1609.344
VALID_ROUTE_TYPES = {"dealer_to_customer", "factory_to_dealer", "factory_to_customer"}
FACTORY_ROUTE_TYPES = {"factory_to_dealer", "factory_to_customer"}


class DeliveryEstimateRequest(BaseModel):
    delivery_address: str
    route_type: str = "dealer_to_customer"
    dealership_address: Optional[str] = None
    factory_address: Optional[str] = None
    manual_miles: Optional[float] = None
    home_width: float = 14
    escort_count: Optional[int] = None


class DeliveryEstimateResponse(BaseModel):
    ok: bool
    route_type: str
    origin_address: str
    destination_address: str
    miles: float
    distance_text: Optional[str] = None
    duration_text: Optional[str] = None
    transport_sides: int
    escort_count: int
    delivery_cost: float
    delivery_price: float
    maps_configured: bool
    source: str
    warning: Optional[str] = None


class GeocodeRequest(BaseModel):
    address: str


class GeocodeResponse(BaseModel):
    ok: bool
    address: str
    formatted_address: str
    latitude: float
    longitude: float
    source: str


def _maps_key() -> str:
    return (
        os.environ.get("GOOGLE_DISTANCE_MATRIX_API_KEY")
        or os.environ.get("GOOGLE_MAPS_API_KEY")
        or ""
    ).strip()


def _clean(value: object) -> str:
    return str(value or "").strip()


def _transport_sides(width: float) -> int:
    numeric = float(width or 14)
    if numeric <= 18:
        return 1
    if numeric <= 36:
        return 2
    return 3


def _default_escorts(width: float, miles: float, sides: int) -> int:
    if float(width or 14) > 14 or miles > 50:
        return 2 if sides > 1 else 1
    return 0


def _pricing(route_type: str, miles: float, sides: int, escorts: int) -> tuple[float, float]:
    if route_type in FACTORY_ROUTE_TYPES:
        return round(6000 * sides, 2), round(6600 * sides, 2)

    if miles <= 0:
        return 0.0, 0.0

    miles_over_50 = max(0.0, miles - 50)
    cost_per_section = (
        800
        + (250 * escorts)
        + (8.5 * miles_over_50)
        + (2 * escorts * miles_over_50)
    )
    cost = cost_per_section * sides
    return round(cost, 2), round(cost * 1.1, 2)


def _route_points(payload: DeliveryEstimateRequest) -> tuple[str, str]:
    route_type = _clean(payload.route_type) or "dealer_to_customer"
    if route_type not in VALID_ROUTE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid delivery route type")

    dealership = _clean(payload.dealership_address) or os.environ.get("EHS_DEALERSHIP_ADDRESS") or DEFAULT_DEALERSHIP_ADDRESS
    destination = _clean(payload.delivery_address)
    factory = _clean(payload.factory_address) or _clean(os.environ.get("EHS_FACTORY_ADDRESS"))

    if not destination:
        raise HTTPException(status_code=400, detail="Delivery address is required")
    if route_type == "dealer_to_customer":
        return dealership, destination
    if not factory:
        raise HTTPException(status_code=400, detail="Factory/origin address is required for the selected factory route")
    if route_type == "factory_to_dealer":
        return factory, dealership
    return factory, destination


def _google_distance(origin: str, destination: str, key: str) -> tuple[float, str, str, str, str]:
    query = urlencode(
        {
            "origins": origin,
            "destinations": destination,
            "units": "imperial",
            "key": key,
        }
    )
    with urlopen(f"{DISTANCE_MATRIX_URL}?{query}", timeout=12) as response:
        data = json.loads(response.read().decode("utf-8"))

    if data.get("status") != "OK":
        raise RuntimeError(data.get("error_message") or data.get("status") or "Google distance lookup failed")
    rows = data.get("rows") or []
    element = ((rows[0] or {}).get("elements") or [{}])[0] if rows else {}
    if element.get("status") != "OK":
        raise RuntimeError(element.get("status") or "No driving route found")

    meters = float((element.get("distance") or {}).get("value") or 0)
    if meters <= 0:
        raise RuntimeError("Google returned an invalid route distance")

    miles = meters / METERS_PER_MILE
    distance_text = str((element.get("distance") or {}).get("text") or "")
    duration_text = str((element.get("duration") or {}).get("text") or "")
    resolved_origin = str((data.get("origin_addresses") or [origin])[0] or origin)
    resolved_destination = str((data.get("destination_addresses") or [destination])[0] or destination)
    return miles, distance_text, duration_text, resolved_origin, resolved_destination


def _google_geocode(address: str, key: str) -> tuple[float, float, str]:
    query = urlencode({"address": address, "key": key})
    with urlopen(f"{GEOCODING_URL}?{query}", timeout=12) as response:
        data = json.loads(response.read().decode("utf-8"))

    if data.get("status") != "OK":
        raise RuntimeError(data.get("error_message") or data.get("status") or "Google geocoding failed")
    results = data.get("results") or []
    if not results:
        raise RuntimeError("No geocoding result found")

    result = results[0] or {}
    location = ((result.get("geometry") or {}).get("location") or {})
    latitude = float(location.get("lat"))
    longitude = float(location.get("lng"))
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise RuntimeError("Google returned invalid coordinates")
    formatted_address = str(result.get("formatted_address") or address)
    return latitude, longitude, formatted_address


def _factory_baseline_message() -> str:
    return "Factory route uses the verified Master Quote 5 $6,000 cost / $6,600 customer price per transported section. Driving mileage was not required to price this route."


@router.post("/geocode", response_model=GeocodeResponse)
def geocode_address(
    payload: GeocodeRequest,
    _user: dict = Depends(get_current_user),
) -> GeocodeResponse:
    address = _clean(payload.address)
    if not address:
        raise HTTPException(status_code=400, detail="Address is required")

    maps_key = _maps_key()
    if not maps_key:
        raise HTTPException(
            status_code=503,
            detail="Google Maps is not configured on the permanent API.",
        )

    try:
        latitude, longitude, formatted_address = _google_geocode(address, maps_key)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Address geocoding failed. Reason: {exc}") from exc

    return GeocodeResponse(
        ok=True,
        address=address,
        formatted_address=formatted_address,
        latitude=latitude,
        longitude=longitude,
        source="google_geocoding",
    )


@router.post("/estimate", response_model=DeliveryEstimateResponse)
def estimate_delivery(
    payload: DeliveryEstimateRequest,
    _user: dict = Depends(get_current_user),
) -> DeliveryEstimateResponse:
    route_type = _clean(payload.route_type) or "dealer_to_customer"
    origin, destination = _route_points(payload)
    maps_key = _maps_key()
    manual_miles = max(0.0, float(payload.manual_miles or 0))
    warning = None

    if maps_key:
        try:
            raw_miles, distance_text, duration_text, origin, destination = _google_distance(origin, destination, maps_key)
            miles = float(math.ceil(raw_miles))
            source = "google_distance_matrix"
        except Exception as exc:
            if manual_miles > 0:
                miles = float(math.ceil(manual_miles))
                distance_text = f"{miles:g} mi (manual)"
                duration_text = None
                source = "manual_fallback"
                warning = f"Google route lookup was unavailable; manual route mileage was used. Reason: {exc}"
            elif route_type in FACTORY_ROUTE_TYPES:
                miles = 0.0
                distance_text = None
                duration_text = None
                source = "factory_baseline"
                warning = f"{_factory_baseline_message()} Google route lookup reason: {exc}"
            else:
                raise HTTPException(
                    status_code=503,
                    detail=f"Driving-distance lookup failed. Enter manual route miles and retry. Reason: {exc}",
                )
    else:
        if manual_miles > 0:
            miles = float(math.ceil(manual_miles))
            distance_text = f"{miles:g} mi (manual)"
            duration_text = None
            source = "manual_fallback"
            warning = "Google Maps is not configured on the permanent API; manual route mileage was used."
        elif route_type in FACTORY_ROUTE_TYPES:
            miles = 0.0
            distance_text = None
            duration_text = None
            source = "factory_baseline"
            warning = _factory_baseline_message()
        else:
            raise HTTPException(
                status_code=503,
                detail="Automatic driving-distance lookup is not configured on the permanent API. Enter manual route miles, or configure GOOGLE_MAPS_API_KEY on Render.",
            )

    sides = _transport_sides(payload.home_width)
    escorts = (
        max(0, int(payload.escort_count))
        if payload.escort_count is not None
        else _default_escorts(payload.home_width, miles, sides)
    )
    delivery_cost, delivery_price = _pricing(route_type, miles, sides, escorts)

    return DeliveryEstimateResponse(
        ok=True,
        route_type=route_type,
        origin_address=origin,
        destination_address=destination,
        miles=miles,
        distance_text=distance_text,
        duration_text=duration_text,
        transport_sides=sides,
        escort_count=escorts,
        delivery_cost=delivery_cost,
        delivery_price=delivery_price,
        maps_configured=bool(maps_key),
        source=source,
        warning=warning,
    )
