import os
from datetime import datetime, timezone

os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-that-is-long-enough-123456")
os.environ.setdefault("EHS_INTERNAL_API_KEY", "test-internal-key-that-is-long-enough-123456")
os.environ.setdefault("MONGO_URL", "mongodb://127.0.0.1:27017")
os.environ.setdefault("DB_NAME", "ehs_test")

from main import _as_utc


def test_as_utc_normalizes_naive_mongo_datetime():
    value = datetime(2026, 8, 19, 17, 0, 0)
    normalized = _as_utc(value)

    assert normalized is not None
    assert normalized.tzinfo == timezone.utc
    assert normalized == datetime(2026, 8, 19, 17, 0, 0, tzinfo=timezone.utc)


def test_as_utc_preserves_instant_for_aware_datetime():
    value = datetime(2026, 8, 19, 17, 0, 0, tzinfo=timezone.utc)
    normalized = _as_utc(value)

    assert normalized == value


def test_as_utc_rejects_non_datetime_values():
    assert _as_utc(None) is None
    assert _as_utc("2026-08-19T17:00:00Z") is None
