"""Pydantic quote models preserved from the working EHS quote system."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid4())


class HomeMediaMixin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    description: Optional[str] = None
    short_description: Optional[str] = None
    summary: Optional[str] = None
    spec_summary: Optional[str] = None
    image: Optional[str] = None
    image_url: Optional[str] = None
    primary_image_url: Optional[str] = None
    photo_url: Optional[str] = None
    exterior_image_url: Optional[str] = None
    floorplan_url: Optional[str] = None
    floor_plan_url: Optional[str] = None
    floorplan_image_url: Optional[str] = None
    plan_image_url: Optional[str] = None


class LineItem(BaseModel):
    model_config = ConfigDict(extra="allow")
    description: str
    qty: float = 1
    unit_price: float = 0
    cost: float = 0
    vendor: Optional[str] = None
    service_id: Optional[str] = None
    included_in_financing: bool = True
    requires_bid: bool = False
    pricing_version: Optional[str] = None
    calculation_snapshot: Optional[dict[str, Any]] = None
    calculated_at: Optional[str] = None
    validation: Optional[dict[str, Any]] = None


class DiscountItem(BaseModel):
    description: str = "Discount"
    amount: float = 0


class DepositItem(BaseModel):
    label: str = "Deposit"
    amount_required: float = 0
    amount_paid: float = 0
    status: str = "pending"
    payment_method: Optional[str] = None
    received_at: Optional[str] = None


class QuoteHomeSnapshot(HomeMediaMixin):
    model_config = ConfigDict(extra="ignore")
    home_id: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacturer_full: Optional[str] = None
    manufacturer_id: Optional[str] = None
    series: Optional[str] = None
    model_name: Optional[str] = None
    home_type: Optional[str] = None
    home_type_source: Optional[str] = None
    floors: Optional[int] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    sqft: Optional[int] = None
    width: Optional[float] = None
    length: Optional[float] = None
    dimensions: Optional[str] = None
    wind_zone: Optional[str] = None


class QuoteSite(BaseModel):
    model_config = ConfigDict(extra="allow")
    owns_land: Optional[bool] = None
    has_lien: Optional[bool] = None
    land_budget: Optional[float] = None
    delivery_address: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_state: Optional[str] = None
    delivery_zip: Optional[str] = None
    county: Optional[str] = None
    zoning: Optional[str] = None
    flood_zone: Optional[str] = None
    wind_zone_required: bool = False
    wind_zone_desired: bool = False


class QuoteFinancing(BaseModel):
    model_config = ConfigDict(extra="allow")
    purchase_type: str = "financing"
    financing_status: Optional[str] = None
    pre_approval_amount: Optional[float] = None
    target_budget: Optional[float] = None
    credit_check_status: Optional[str] = None
    ehs_loan_used: bool = False
    notes_internal: Optional[str] = None
    notes_customer: Optional[str] = None


class QuoteTimeline(BaseModel):
    model_config = ConfigDict(extra="ignore")
    loan_approval: Optional[str] = None
    loan_closing: Optional[str] = None
    permit_approval: Optional[str] = None
    site_ready: Optional[str] = None
    delivery: Optional[str] = None
    installation: Optional[str] = None
    move_in: Optional[str] = None
    walkthrough: Optional[str] = None


class Quote(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=new_id)
    quote_number: str
    quote_date: str
    status: str = "draft"
    associate_id: str
    associate_name: Optional[str] = None
    associate_email: Optional[str] = None
    associate_phone: Optional[str] = None
    customer_id: Optional[str] = None
    customer_snapshot: Optional[dict[str, Any]] = None
    home: Optional[QuoteHomeSnapshot] = None
    site: Optional[QuoteSite] = None
    base_price: float = 0
    factory_cost: float = 0
    land_price: float = 0
    delivery_price: float = 0
    delivery_cost: float = 0
    options: list[LineItem] = Field(default_factory=list)
    mandatory_services: list[LineItem] = Field(default_factory=list)
    suppressed_required_service_ids: list[str] = Field(default_factory=list)
    addons: list[LineItem] = Field(default_factory=list)
    site_work: list[LineItem] = Field(default_factory=list)
    discounts: list[DiscountItem] = Field(default_factory=list)
    deposits: list[DepositItem] = Field(default_factory=list)
    sales_tax_rate: Optional[float] = None
    ehs_loan_used: bool = False
    financing: Optional[QuoteFinancing] = None
    timeline: Optional[QuoteTimeline] = None
    notes_internal: Optional[str] = None
    notes_customer: Optional[str] = None
    next_steps: Optional[str] = None
    disclaimer: Optional[str] = None
    totals: dict[str, Any] = Field(default_factory=dict)
    pricing_version: Optional[str] = None
    calculation_snapshot: Optional[dict[str, Any]] = None
    calculated_at: Optional[str] = None
    validation: Optional[dict[str, Any]] = None
    share_token: Optional[str] = None
    share_enabled: bool = False
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
    sent_at: Optional[str] = None


class QuoteCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Optional[str] = None
    quote_number: Optional[str] = None
    quote_date: Optional[str] = None
    customer_id: Optional[str] = None
    customer_snapshot: Optional[dict[str, Any]] = None
    home: Optional[QuoteHomeSnapshot] = None
    site: Optional[QuoteSite] = None
    base_price: float = 0
    factory_cost: float = 0
    land_price: float = 0
    delivery_price: float = 0
    delivery_cost: float = 0
    options: list[LineItem] = Field(default_factory=list)
    mandatory_services: list[LineItem] = Field(default_factory=list)
    suppressed_required_service_ids: list[str] = Field(default_factory=list)
    addons: list[LineItem] = Field(default_factory=list)
    site_work: list[LineItem] = Field(default_factory=list)
    discounts: list[DiscountItem] = Field(default_factory=list)
    deposits: list[DepositItem] = Field(default_factory=list)
    sales_tax_rate: Optional[float] = None
    ehs_loan_used: bool = False
    financing: Optional[QuoteFinancing] = None
    timeline: Optional[QuoteTimeline] = None
    notes_internal: Optional[str] = None
    notes_customer: Optional[str] = None
    next_steps: Optional[str] = None
    disclaimer: Optional[str] = None
    status: Optional[str] = None
    share_token: Optional[str] = None
    share_enabled: bool = False
    pricing_version: Optional[str] = None
    calculation_snapshot: Optional[dict[str, Any]] = None
    calculated_at: Optional[str] = None
    validation: Optional[dict[str, Any]] = None
    migrate_pricing: bool = False
    quote_updates: Optional[dict[str, Any]] = None
    ehs_price_override_reason: Optional[str] = None
    ehs_price_override: Optional[dict[str, Any]] = None
    reset_ehs_price_override: bool = False


class QuoteUpdate(QuoteCreate):
    pass


class QuoteStatusUpdate(BaseModel):
    status: str
