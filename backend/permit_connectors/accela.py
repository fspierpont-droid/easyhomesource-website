"""Conservative Accela v4 public-record connector for AMHI monitoring."""
from __future__ import annotations

import json
import os
import ssl
from typing import Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, HTTPSHandler, Request, build_opener

import certifi

from .base import (
    ConnectorConfigurationError,
    ConnectorRequestError,
    ConnectorSpec,
    RecordNotFoundError,
)

REQUEST_TIMEOUT_SECONDS = 15
MAX_RESPONSE_BYTES = 1024 * 1024
USER_AGENT = "EasyHomeSource-Permit-Monitor/1.0"


class _NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        return None


def _clean_header_value(value: str | None, *, name: str) -> str:
    cleaned = str(value or "").strip()
    if not cleaned:
        raise ConnectorConfigurationError(f"{name} is required")
    if "\r" in cleaned or "\n" in cleaned or len(cleaned) > 200:
        raise ConnectorConfigurationError(f"{name} is invalid")
    return cleaned


def _clean_record_id(value: str | None) -> str:
    cleaned = str(value or "").strip()
    if not cleaned:
        raise ConnectorConfigurationError("External permit/application ID is required")
    if len(cleaned) > 128 or any(ord(character) < 32 for character in cleaned):
        raise ConnectorConfigurationError("External permit/application ID is invalid")
    return cleaned


def _status_text(value) -> str | None:  # noqa: ANN001
    if isinstance(value, dict):
        text = value.get("text") or value.get("value")
        return str(text).strip() if text is not None and str(text).strip() else None
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _record_to_observation(record: dict) -> dict[str, str | None]:
    """Map only Accela fields whose meanings are explicit in the records API."""
    description = record.get("description")
    status_date = record.get("statusDate")
    expiration_date = record.get("expirationDate")
    return {
        "status": _status_text(record.get("status")),
        "status_detail": str(description).strip() if description is not None and str(description).strip() else None,
        "review_stage": None,
        "issued_date": None,
        "expiration_date": str(expiration_date).strip() if expiration_date is not None and str(expiration_date).strip() else None,
        "inspection_status": None,
        "inspection_result": None,
        "fees_status": None,
        "portal_updated_at": str(status_date).strip() if status_date is not None and str(status_date).strip() else None,
        "public_comments": None,
    }


class AccelaConnector:
    def __init__(
        self,
        spec: ConnectorSpec,
        *,
        app_id: str,
        agency: str,
        environment: str,
    ) -> None:
        if spec.provider != "accela":
            raise ConnectorConfigurationError("AccelaConnector requires an Accela connector spec")
        if spec.api_hostname != "apis.accela.com":
            raise ConnectorConfigurationError("Accela API hostname is not allow-listed")
        self.spec = spec
        self.app_id = _clean_header_value(app_id, name="Accela app ID")
        self.agency = _clean_header_value(agency, name="Accela agency")
        self.environment = _clean_header_value(environment, name="Accela environment")

    @classmethod
    def from_environment(
        cls,
        spec: ConnectorSpec,
        environ: Mapping[str, str] | None = None,
    ) -> "AccelaConnector":
        values = environ if environ is not None else os.environ
        return cls(
            spec,
            app_id=values.get(spec.app_id_env, ""),
            agency=values.get(spec.agency_env, ""),
            environment=values.get(spec.environment_env, ""),
        )

    def _records_url(self, external_record_id: str) -> str:
        record_id = _clean_record_id(external_record_id)
        query = urlencode({
            "customId": record_id,
            "fields": "id,customId,status,description,statusDate,expirationDate",
        })
        return f"{self.spec.api_origin}/v4/records?{query}"

    def _request_json(self, url: str) -> dict:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.hostname != self.spec.api_hostname:
            raise ConnectorRequestError("Refusing request outside the allow-listed Accela API host")

        request = Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": USER_AGENT,
                "x-accela-appid": self.app_id,
                "x-accela-agency": self.agency,
                "x-accela-environment": self.environment,
            },
            method="GET",
        )
        context = ssl.create_default_context(cafile=certifi.where())
        opener = build_opener(HTTPSHandler(context=context), _NoRedirectHandler())
        try:
            with opener.open(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > MAX_RESPONSE_BYTES:
                    raise ConnectorRequestError("Accela response exceeded the permitted size")
                content_type = (response.headers.get("Content-Type") or "").lower()
                if content_type and "json" not in content_type:
                    raise ConnectorRequestError("Accela returned an unexpected content type")
                raw = response.read(MAX_RESPONSE_BYTES + 1)
        except HTTPError as exc:
            raise ConnectorRequestError(f"Accela request returned HTTP {exc.code}") from exc
        except (URLError, TimeoutError, OSError) as exc:
            raise ConnectorRequestError("Accela request failed") from exc
        except ValueError as exc:
            raise ConnectorRequestError("Accela response metadata was invalid") from exc

        if len(raw) > MAX_RESPONSE_BYTES:
            raise ConnectorRequestError("Accela response exceeded the permitted size")
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ConnectorRequestError("Accela returned invalid JSON") from exc
        if not isinstance(payload, dict):
            raise ConnectorRequestError("Accela returned an invalid response envelope")
        return payload

    def fetch_record(self, external_record_id: str) -> dict:
        record_id = _clean_record_id(external_record_id)
        payload = self._request_json(self._records_url(record_id))
        results = payload.get("result")
        if not isinstance(results, list):
            raise ConnectorRequestError("Accela response did not contain a record list")

        exact = [
            record for record in results
            if isinstance(record, dict)
            and str(record.get("customId") or "").strip().lower() == record_id.lower()
        ]
        if len(exact) != 1:
            if not exact:
                raise RecordNotFoundError("No exact public Accela record matched the permit/application ID")
            raise ConnectorRequestError("Accela returned multiple exact record matches")

        record = exact[0]
        return {
            "external_record_id": str(record.get("customId") or record_id).strip(),
            "provider_record_id": str(record.get("id") or "").strip() or None,
            "observation": _record_to_observation(record),
            "source_url": self.spec.portal_url,
        }
