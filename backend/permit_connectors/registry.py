"""Static allowlist of provider connectors approved for AMHI monitoring.

Agency/environment values are intentionally not guessed. They must be supplied
through environment variables after being confirmed for each jurisdiction.
"""
from __future__ import annotations

from .base import ConnectorSpec

ACCELA_API_ORIGIN = "https://apis.accela.com"

SUPPORTED_CONNECTORS: dict[str, ConnectorSpec] = {
    "polk-accela": ConnectorSpec(
        id="polk-accela",
        provider="accela",
        county="Polk",
        api_origin=ACCELA_API_ORIGIN,
        portal_url="https://aca-prod.accela.com/POLKCO/Default.aspx",
        app_id_env="ACCELA_APP_ID",
        agency_env="ACCELA_POLK_AGENCY",
        environment_env="ACCELA_POLK_ENVIRONMENT",
    ),
    "pasco-accela": ConnectorSpec(
        id="pasco-accela",
        provider="accela",
        county="Pasco",
        api_origin=ACCELA_API_ORIGIN,
        portal_url="https://aca-prod.accela.com/pasco/Default.aspx",
        app_id_env="ACCELA_APP_ID",
        agency_env="ACCELA_PASCO_AGENCY",
        environment_env="ACCELA_PASCO_ENVIRONMENT",
    ),
    "pinellas-accela": ConnectorSpec(
        id="pinellas-accela",
        provider="accela",
        county="Pinellas",
        api_origin=ACCELA_API_ORIGIN,
        portal_url="https://aca-prod.accela.com/pinellas",
        app_id_env="ACCELA_APP_ID",
        agency_env="ACCELA_PINELLAS_AGENCY",
        environment_env="ACCELA_PINELLAS_ENVIRONMENT",
    ),
}


def get_connector_spec(connector_id: str) -> ConnectorSpec | None:
    return SUPPORTED_CONNECTORS.get(str(connector_id or "").strip().lower())
