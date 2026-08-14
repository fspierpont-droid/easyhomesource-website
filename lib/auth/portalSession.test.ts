import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import type { TeamUser } from '../../data/teamMembers.ts';
import { canWriteGhl, createPortalSession, PORTAL_SESSION_COOKIE, requirePortalAccess, verifyPortalSession } from './portalSession.ts';

const admin: TeamUser = {
  id: 'database-admin-uuid',
  name: 'Database Admin',
  email: 'admin@easyhomesource.com',
  role: 'Admin',
  active: true,
  ghlLinked: true,
};

const manager: TeamUser = {
  id: 'database-manager-uuid',
  name: 'Database Manager',
  email: 'manager@easyhomesource.com',
  role: 'Manager',
  active: true,
  ghlLinked: true,
};

const associate: TeamUser = {
  id: 'database-associate-uuid',
  name: 'Database Associate',
  email: 'associate@easyhomesource.com',
  role: 'Associate',
  active: true,
  ghlLinked: true,
};

beforeEach(() => { process.env.PORTAL_SESSION_SECRET = 'a-test-secret-with-at-least-32-characters'; });
afterEach(() => delete process.env.PORTAL_SESSION_SECRET);

test('server verifies signed sessions for EHS database user ids', () => {
  const session = createPortalSession(admin);
  assert.equal(verifyPortalSession(session.value)?.id, 'database-admin-uuid');
  assert.equal(verifyPortalSession(session.value)?.email, admin.email);
  assert.equal(verifyPortalSession(`${session.value}tampered`), null);
  assert.equal(verifyPortalSession(), null);
});

test('only managers and admins may write GHL', () => {
  assert.equal(canWriteGhl(admin), true);
  assert.equal(canWriteGhl(manager), true);
  assert.equal(canWriteGhl(associate), false);
});

test('GHL route authorization returns 401 and 403 and permits authorized writes', () => {
  assert.equal(requirePortalAccess(new Request('https://portal.test'), false).response?.status, 401);
  assert.equal(requirePortalAccess(new Request('https://portal.test'), true).response?.status, 401);

  const associateSession = createPortalSession(associate);
  const associateRequest = new Request('https://portal.test', { headers: { cookie: `${PORTAL_SESSION_COOKIE}=${associateSession.value}` } });
  assert.equal(requirePortalAccess(associateRequest, true).response?.status, 403);

  const adminSession = createPortalSession(admin);
  const adminRequest = new Request('https://portal.test', { headers: { cookie: `${PORTAL_SESSION_COOKIE}=${adminSession.value}` } });
  assert.equal(requirePortalAccess(adminRequest, true).response, null);
});
