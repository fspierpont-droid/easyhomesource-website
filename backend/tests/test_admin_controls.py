from main import _removes_active_admin_access, app


def test_active_admin_guard_detects_demotion_or_deactivation() -> None:
    current = {"id": "admin-1", "role": "admin", "active": True}

    assert _removes_active_admin_access(current, {"role": "manager"}) is True
    assert _removes_active_admin_access(current, {"active": False}) is True
    assert _removes_active_admin_access(current, {"name": "Updated Admin"}) is False
    assert _removes_active_admin_access(current, {"role": "admin", "active": True}) is False


def test_admin_guard_ignores_non_admin_accounts() -> None:
    assert _removes_active_admin_access(
        {"id": "manager-1", "role": "manager", "active": True},
        {"active": False},
    ) is False


def test_admin_audit_log_route_is_registered() -> None:
    paths = {(route.path, tuple(sorted(route.methods or []))) for route in app.routes}
    assert ("/api/admin/audit-logs", ("GET",)) in paths
