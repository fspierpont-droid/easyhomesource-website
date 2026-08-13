import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { canWriteGhl, createPortalSession, PORTAL_SESSION_COOKIE, requirePortalAccess, verifyPortalSession } from './portalSession.ts';
import { VERIFIED_TEAM_USERS } from '../../data/teamMembers.ts';

beforeEach(() => { process.env.PORTAL_SESSION_SECRET = 'a-test-secret-with-at-least-32-characters'; });
afterEach(() => { delete process.env.PORTAL_SESSION_SECRET; });

test('server verifies signed active portal sessions', () => {
  const admin = VERIFIED_TEAM_USERS.find((user) => user.role === 'Admin')!;
  const session = createPortalSession(admin);
  assert.equal(verifyPortalSession(session.value)?.id, admin.id);
  assert.equal(verifyPortalSession(`${session.value}tampered`), null);
  assert.equal(verifyPortalSession(), null);
});

test('only managers and admins may write GHL', () => {
  assert.equal(canWriteGhl(VERIFIED_TEAM_USERS.find((user) => user.role === 'Admin')!), true);
  assert.equal(canWriteGhl(VERIFIED_TEAM_USERS.find((user) => user.role === 'Manager')!), true);
  assert.equal(canWriteGhl(VERIFIED_TEAM_USERS.find((user) => user.role === 'Associate')!), false);
});

test('GHL route authorization returns 401 and 403 and permits authorized writes', () => {
  assert.equal(requirePortalAccess(new Request('https://portal.test'), false).response?.status, 401);
  assert.equal(requirePortalAccess(new Request('https://portal.test'), true).response?.status, 401);
  const associate = createPortalSession(VERIFIED_TEAM_USERS.find((user) => user.role === 'Associate')!);
  const associateRequest = new Request('https://portal.test', { headers: { cookie: `${PORTAL_SESSION_COOKIE}=${associate.value}` } });
  assert.equal(requirePortalAccess(associateRequest, true).response?.status, 403);
  const admin = createPortalSession(VERIFIED_TEAM_USERS.find((user) => user.role === 'Admin')!);
  const adminRequest = new Request('https://portal.test', { headers: { cookie: `${PORTAL_SESSION_COOKIE}=${admin.value}` } });
  assert.equal(requirePortalAccess(adminRequest, true).response, null);
});
