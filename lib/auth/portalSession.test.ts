import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import type { TeamUser } from '../../data/teamMembers.ts';
import {
  authenticatedPortalUser,
  canWriteGhl,
  PORTAL_SESSION_COOKIE,
  requirePortalAccess,
} from './portalSession.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

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

function backendUser(user: TeamUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    active: user.active,
    ghl_linked: user.ghlLinked,
  };
}

function requestWithToken(token: string) {
  return new Request('https://portal.test', {
    headers: { cookie: `${PORTAL_SESSION_COOKIE}=${token}` },
  });
}

test('only managers and admins may write GHL', () => {
  assert.equal(canWriteGhl(admin), true);
  assert.equal(canWriteGhl(manager), true);
  assert.equal(canWriteGhl(associate), false);
});

test('missing backend session returns 401 without calling auth/me', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error('should not be called');
  };

  const access = await requirePortalAccess(new Request('https://portal.test'));
  assert.equal(access.response?.status, 401);
  assert.equal(calls, 0);
});

test('session identity is revalidated against the permanent backend on each protected request', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify(backendUser(admin)), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  const request = requestWithToken('backend-jwt');
  const user = await authenticatedPortalUser(request);
  assert.equal(user?.id, admin.id);
  assert.equal(user?.role, 'Admin');

  const access = await requirePortalAccess(request, true);
  assert.equal(access.response, null);
  assert.equal(access.user?.id, admin.id);
});

test('associate backend identity receives 403 for GHL writes', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify(backendUser(associate)), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  const access = await requirePortalAccess(requestWithToken('associate-jwt'), true);
  assert.equal(access.response?.status, 403);
});

test('expired backend token receives 401', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401 });
  const access = await requirePortalAccess(requestWithToken('expired-jwt'));
  assert.equal(access.response?.status, 401);
});

test('backend auth outage receives 503 instead of misreporting bad credentials', async () => {
  globalThis.fetch = async () => { throw new Error('backend offline'); };
  const access = await requirePortalAccess(requestWithToken('backend-jwt'));
  assert.equal(access.response?.status, 503);
});
