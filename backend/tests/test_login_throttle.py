import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from starlette.requests import Request

import main as app_main
from models import LoginRequest


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = documents or {}

    async def find_one(self, query):
        key = query.get("key")
        if key is not None:
            document = self.documents.get(key)
            return dict(document) if document else None

        email = query.get("email")
        for document in self.documents.values():
            if document.get("email") == email:
                return dict(document)
        return None

    async def update_one(self, query, update, upsert=False):
        key = query["key"]
        document = dict(self.documents.get(key, {"key": key}))
        for field, value in update.get("$set", {}).items():
            document[field] = value
        for field, value in update.get("$inc", {}).items():
            document[field] = int(document.get(field, 0)) + value
        self.documents[key] = document

    async def delete_one(self, query):
        self.documents.pop(query["key"], None)

    async def insert_one(self, document):
        self.documents[str(len(self.documents))] = dict(document)


class FakeDb:
    def __init__(self):
        self.rate_limits = FakeCollection()
        self.audit_logs = FakeCollection()
        self.users = FakeCollection(
            {
                "employee": {
                    "id": "user-1",
                    "email": "employee@example.com",
                    "name": "Test Employee",
                    "role": "admin",
                    "active": True,
                    "password_hash": "stored-hash",
                }
            }
        )


def make_request() -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/auth/login",
            "headers": [],
            "client": ("127.0.0.1", 12345),
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )


def install_fake_db(monkeypatch):
    db = FakeDb()
    monkeypatch.setattr(app_main, "get_db", lambda: db)

    async def no_op_audit(*args, **kwargs):
        return None

    monkeypatch.setattr(app_main, "_audit", no_op_audit)
    monkeypatch.setattr(app_main, "create_access_token", lambda *args, **kwargs: "test-token")
    return db


def test_successful_logins_do_not_consume_rate_limit(monkeypatch) -> None:
    db = install_fake_db(monkeypatch)
    monkeypatch.setattr(app_main, "verify_password", lambda password, stored: password == "correct-password")
    payload = LoginRequest(email="employee@example.com", password="correct-password")

    for _ in range(12):
        response = asyncio.run(app_main.login(payload, make_request()))
        assert response.access_token == "test-token"

    assert db.rate_limits.documents == {}


def test_failed_logins_are_counted_and_success_clears_counter(monkeypatch) -> None:
    db = install_fake_db(monkeypatch)
    monkeypatch.setattr(app_main, "verify_password", lambda password, stored: password == "correct-password")

    bad_payload = LoginRequest(email="employee@example.com", password="wrong-password")
    with pytest.raises(HTTPException) as failure:
        asyncio.run(app_main.login(bad_payload, make_request()))
    assert failure.value.status_code == 401

    key = app_main._login_rate_limit_key("employee@example.com")
    assert db.rate_limits.documents[key]["count"] == 1

    good_payload = LoginRequest(email="employee@example.com", password="correct-password")
    response = asyncio.run(app_main.login(good_payload, make_request()))
    assert response.access_token == "test-token"
    assert key not in db.rate_limits.documents


def test_failed_login_threshold_returns_429_with_retry_after(monkeypatch) -> None:
    db = install_fake_db(monkeypatch)
    key = app_main._login_rate_limit_key("employee@example.com")
    db.rate_limits.documents[key] = {
        "key": key,
        "count": 10,
        "reset_at": datetime.now(timezone.utc) + timedelta(minutes=5),
        "updated_at": datetime.now(timezone.utc),
    }

    payload = LoginRequest(email="employee@example.com", password="correct-password")
    with pytest.raises(HTTPException) as blocked:
        asyncio.run(app_main.login(payload, make_request()))

    assert blocked.value.status_code == 429
    assert blocked.value.headers is not None
    assert int(blocked.value.headers["Retry-After"]) > 0


def test_naive_mongo_reset_time_is_normalized(monkeypatch) -> None:
    db = install_fake_db(monkeypatch)
    key = app_main._login_rate_limit_key("employee@example.com")
    db.rate_limits.documents[key] = {
        "key": key,
        "count": 10,
        "reset_at": datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5),
        "updated_at": datetime.now(timezone.utc).replace(tzinfo=None),
    }

    payload = LoginRequest(email="employee@example.com", password="correct-password")
    with pytest.raises(HTTPException) as blocked:
        asyncio.run(app_main.login(payload, make_request()))

    assert blocked.value.status_code == 429
