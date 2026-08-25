"""Shared contracts and security constraints for permit-portal connectors."""
from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlsplit


class ConnectorError(RuntimeError):
    """Base class for expected permit-connector failures."""


class ConnectorConfigurationError(ConnectorError):
    """Required provider configuration is missing or invalid."""


class ConnectorRequestError(ConnectorError):
    """The remote provider request failed or returned an invalid response."""


class RecordNotFoundError(ConnectorError):
    """No exact public record matched the configured permit/application ID."""


@dataclass(frozen=True)
class ConnectorSpec:
    id: str
    provider: str
    county: str
    api_origin: str
    portal_url: str
    app_id_env: str
    agency_env: str
    environment_env: str

    def __post_init__(self) -> None:
        parsed = urlsplit(self.api_origin)
        if parsed.scheme != "https" or not parsed.hostname or parsed.path not in {"", "/"}:
            raise ValueError("Connector API origin must be a fixed HTTPS origin")
        portal = urlsplit(self.portal_url)
        if portal.scheme != "https" or not portal.hostname:
            raise ValueError("Connector portal URL must use HTTPS")

    @property
    def api_hostname(self) -> str:
        return urlsplit(self.api_origin).hostname or ""
