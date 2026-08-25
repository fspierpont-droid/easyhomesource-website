import asyncio
from datetime import datetime, timezone

import permit_monitoring


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = list(documents or [])

    async def find_one(self, query, sort=None):
        matches = []
        for document in self.documents:
            ok = True
            for key, expected in query.items():
                actual = document.get(key)
                if isinstance(expected, dict) and "$ne" in expected:
                    if actual == expected["$ne"]:
                        ok = False
                        break
                elif actual != expected:
                    ok = False
                    break
            if ok:
                matches.append(document)
        if sort and matches:
            field, direction = sort[0]
            matches.sort(key=lambda item: item.get(field), reverse=direction < 0)
        return dict(matches[0]) if matches else None

    async def insert_one(self, document):
        self.documents.append(dict(document))

    async def update_one(self, query, update):
        for document in self.documents:
            ok = True
            for key, expected in query.items():
                actual = document.get(key)
                if isinstance(expected, dict) and "$ne" in expected:
                    if actual == expected["$ne"]:
                        ok = False
                        break
                elif actual != expected:
                    ok = False
                    break
            if ok:
                document.update(update.get("$set", {}))
                return


class FakeDb:
    def __init__(self):
        self.permit_jobs = FakeCollection([
            {
                "id": "permit-1",
                "status": "Submitted",
                "archived": False,
            }
        ])
        self.permit_external_snapshots = FakeCollection()
        self.permit_events = FakeCollection()


def test_normalization_is_allow_listed_and_stable():
    normalized = permit_monitoring.normalize_observation({
        "status": "  In Review  ",
        "status_detail": "Planning review",
        "ignored_html": "<script>ignored</script>",
    })

    assert normalized["status"] == "In Review"
    assert normalized["status_detail"] == "Planning review"
    assert "ignored_html" not in normalized
    assert set(normalized) == set(permit_monitoring.OBSERVATION_FIELDS)


def test_snapshot_digest_is_order_independent():
    first = {"status": "Approved", "review_stage": "Complete"}
    second = {"review_stage": "Complete", "status": "Approved"}
    assert permit_monitoring.snapshot_digest(first) == permit_monitoring.snapshot_digest(second)


def test_material_changes_reports_only_external_field_differences():
    changes = permit_monitoring.material_changes(
        {"status": "In Review", "fees_status": "Due"},
        {"status": "Approved", "fees_status": "Due", "unknown": "ignored"},
    )

    assert changes == {
        "status": {"before": "In Review", "after": "Approved"},
    }


def test_first_observation_creates_baseline_without_changing_human_status():
    db = FakeDb()
    observed_at = datetime(2026, 8, 25, 13, 0, tzinfo=timezone.utc)

    result = asyncio.run(
        permit_monitoring.record_external_observation(
            db,
            permit_job_id="permit-1",
            connector_id="polk-accela",
            external_record_id="P-123",
            source_url="https://example.gov/permit/P-123",
            observation={"status": "In Review", "status_detail": "Building review"},
            observed_at=observed_at,
        )
    )

    job = db.permit_jobs.documents[0]
    assert job["status"] == "Submitted"
    assert job["external_status"] == "In Review"
    assert job["external_monitor_state"] == "healthy"
    assert job["external_last_checked_at"] == observed_at
    assert job["external_last_changed_at"] == observed_at
    assert result["human_status_unchanged"] is True
    assert len(db.permit_external_snapshots.documents) == 1
    assert db.permit_events.documents[0]["event_type"] == "external_baseline_recorded"


def test_unchanged_observation_adds_snapshot_but_not_change_event():
    db = FakeDb()
    first_time = datetime(2026, 8, 25, 13, 0, tzinfo=timezone.utc)
    second_time = datetime(2026, 8, 25, 17, 0, tzinfo=timezone.utc)

    asyncio.run(
        permit_monitoring.record_external_observation(
            db,
            permit_job_id="permit-1",
            connector_id="polk-accela",
            external_record_id="P-123",
            observation={"status": "In Review"},
            observed_at=first_time,
        )
    )
    result = asyncio.run(
        permit_monitoring.record_external_observation(
            db,
            permit_job_id="permit-1",
            connector_id="polk-accela",
            external_record_id="P-123",
            observation={"status": "In Review"},
            observed_at=second_time,
        )
    )

    job = db.permit_jobs.documents[0]
    assert len(db.permit_external_snapshots.documents) == 2
    assert len(db.permit_events.documents) == 1
    assert result["changes"] == {}
    assert job["external_last_checked_at"] == second_time
    assert job["external_last_changed_at"] == first_time
    assert job["status"] == "Submitted"


def test_changed_observation_creates_change_event_and_preserves_human_status():
    db = FakeDb()
    first_time = datetime(2026, 8, 25, 13, 0, tzinfo=timezone.utc)
    second_time = datetime(2026, 8, 25, 17, 0, tzinfo=timezone.utc)

    asyncio.run(
        permit_monitoring.record_external_observation(
            db,
            permit_job_id="permit-1",
            connector_id="polk-accela",
            external_record_id="P-123",
            observation={"status": "In Review"},
            observed_at=first_time,
        )
    )
    result = asyncio.run(
        permit_monitoring.record_external_observation(
            db,
            permit_job_id="permit-1",
            connector_id="polk-accela",
            external_record_id="P-123",
            observation={"status": "Approved", "status_detail": "Ready to issue"},
            observed_at=second_time,
        )
    )

    job = db.permit_jobs.documents[0]
    assert job["status"] == "Submitted"
    assert job["external_status"] == "Approved"
    assert job["external_last_changed_at"] == second_time
    assert result["changes"]["status"] == {"before": "In Review", "after": "Approved"}
    assert db.permit_events.documents[-1]["event_type"] == "external_portal_changed"
    assert db.permit_events.documents[-1]["actor"] == "system:permit-monitor"


def test_missing_job_is_rejected():
    db = FakeDb()
    try:
        asyncio.run(
            permit_monitoring.record_external_observation(
                db,
                permit_job_id="missing",
                connector_id="polk-accela",
                external_record_id="P-123",
                observation={"status": "Approved"},
            )
        )
    except ValueError as exc:
        assert str(exc) == "Permit job not found"
    else:
        raise AssertionError("Expected missing permit job to be rejected")
