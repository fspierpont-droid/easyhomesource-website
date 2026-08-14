import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import {
  PERMANENT_EHS_BACKEND_URL,
  portalBackendUrl,
  validatePortalAccessToken,
  validatePortalCredentials,
} from './portalCredentials.ts';

const originalFetch = globalThis.fetch;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  delete process.env.EHS_BACKEND_URL;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  globalThis.fetch = originalFetch;
});

test('deployed authentication has a canonical permanent backend and does not require Vercel configuration', () => {
  delete process.env.EHS_BACKEND_URL;
  assert.equal(portalBackendUrl(), PERMANENT_EHS_BACKEND_URL);

  process.env.EHS_BACKEND_URL = 'not-a-valid-url';
  assert.equal(portalBackendUrl(), PERMANENT_EHS_BACKEND_URL);
});

test('local development may override the permanent backend with a valid origin', () => {
  process.env.NODE_ENV = 'development';
  process.env.EHS_BACKEND_URL = 'http://127.0.0.1:8000/';
  assert.equal(portalBackendUrl(), 'http://127.0.0.1:8000');
});

test('delegates exact employee credentials to the permanent EHS database and retains the backend token server-side', async () => {
  delete process.env.EHS_BACKEND_URL;
  let requestUrl = '';
  let requestBody: unknown;

  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      access_token: 'backend-jwt-for-http-only-cookie',
      token_type: 'bearer',
      user: {
        id: 'database-user-uuid',
        name: 'Scott Pierpont',
        email: 'scott@easyhomesource.com',
        role: 'admin',
        active: true,
        ghl_linked: true,
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const result = await validatePortalCredentials('SCOTT@easyhomesource.com', '  exact password  ');
  assert.equal(requestUrl, `${PERMANENT_EHS_BACKEND_URL}/api/auth/login`);
  assert.deepEqual(requestBody, {
    email: 'scott@easyhomesource.com',
    password: '  exact password  ',
  });
  assert.equal(result.status, 'valid');
  if (result.status === 'valid') {
    assert.equal(result.accessToken, 'backend-jwt-for-http-only-cookie');
    assert.equal(result.user.id, 'database-user-uuid');
    assert.equal(result.user.role, 'Admin');
  }
});

test('maps rejected EHS credentials to one generic invalid-credentials result', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Invalid email or password' }), { status: 401 });
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'wrong-password')).status, 'invalid-credentials');

  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Account deactivated' }), { status: 403 });
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'some-password')).status, 'invalid-credentials');
});

test('EHS authentication outages are reported as service unavailable', async () => {
  globalThis.fetch = async () => { throw new Error('network down'); };
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'any-value')).status, 'service-unavailable');
});

test('backend access tokens are revalidated through auth/me and current database roles are normalized', async () => {
  let authorization = '';
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), `${PERMANENT_EHS_BACKEND_URL}/api/auth/me`);
    authorization = String((init?.headers as Record<string, string>)?.Authorization || '');
    return new Response(JSON.stringify({
      id: 'database-manager-uuid',
      name: 'Database Manager',
      email: 'manager@easyhomesource.com',
      role: 'manager',
      active: true,
      ghl_linked: true,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const result = await validatePortalAccessToken('backend-jwt');
  assert.equal(authorization, 'Bearer backend-jwt');
  assert.equal(result.status, 'valid');
  if (result.status === 'valid') assert.equal(result.user.role, 'Manager');
});

test('expired or deactivated backend sessions become unauthenticated', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Not authenticated' }), { status: 401 });
  assert.equal((await validatePortalAccessToken('expired-token')).status, 'unauthenticated');

  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'User deactivated' }), { status: 403 });
  assert.equal((await validatePortalAccessToken('deactivated-token')).status, 'unauthenticated');
});
