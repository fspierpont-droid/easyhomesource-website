import inspect
from datetime import datetime, timezone

from fastapi.params import Form as FormParameter

import permitting


def test_permitting_router_exposes_job_and_document_contracts():
    methods_by_path: dict[str, set[str]] = {}
    for route in permitting.router.routes:
        methods_by_path.setdefault(route.path, set()).update(route.methods or [])

    assert methods_by_path['/api/permitting/jobs'] >= {'GET', 'POST'}
    assert methods_by_path['/api/permitting/jobs/{job_id}'] >= {'PATCH', 'DELETE'}
    assert methods_by_path['/api/permitting/jobs/{job_id}/documents'] >= {'POST'}
    assert methods_by_path['/api/permitting/jobs/{job_id}/documents/{document_id}/download'] >= {'GET'}
    assert methods_by_path['/api/permitting/jobs/{job_id}/documents/{document_id}'] >= {'DELETE'}


def test_document_category_is_bound_from_multipart_form_data():
    parameter = inspect.signature(permitting.upload_document).parameters['category']
    assert isinstance(parameter.default, FormParameter)
    assert parameter.default.default == 'Other'


def test_permit_document_rules_allow_business_files_and_block_executables():
    assert '.pdf' in permitting.ALLOWED_EXTENSIONS
    assert '.docx' in permitting.ALLOWED_EXTENSIONS
    assert '.xlsx' in permitting.ALLOWED_EXTENSIONS
    assert '.exe' in permitting.BLOCKED_EXTENSIONS
    assert '.js' in permitting.BLOCKED_EXTENSIONS
    assert permitting.MAX_FILE_BYTES == 25 * 1024 * 1024


def test_permit_job_defaults_cover_manufactured_home_workflow():
    assert 'Manufactured Home Installation' in permitting.PERMIT_TYPES
    assert 'Historical / After-the-Fact' in permitting.PERMIT_TYPES
    assert 'Corrections' in permitting.STATUSES
    assert 'Final / CO' in permitting.STATUSES
    assert 'Survey / Site Plan' in permitting.DOCUMENT_CATEGORIES
    assert 'Certificate of Occupancy / Completion' in permitting.DOCUMENT_CATEGORIES


def test_serialize_removes_mongo_id_and_formats_datetimes():
    timestamp = datetime(2026, 8, 21, 12, 0, tzinfo=timezone.utc)
    result = permitting._serialize({
        '_id': 'mongo-internal',
        'id': 'permit-test',
        'updated_at': timestamp,
    })

    assert '_id' not in result
    assert result['id'] == 'permit-test'
    assert result['updated_at'] == timestamp.isoformat()
