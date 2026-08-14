import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { validatePortalCredentials } from './portalCredentials.ts';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env.EHS_BACKEND_URL = 'https://ehs-backend.test';
});

afterEach(() => {
  delete process.env.EHS_BACKEND_URL;
  globalThis.fetch = originalFetch;
});

test('delegates email and password verification to the EHS user database', async () => {
  let requestBody: unknown;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      access_token: 'not-forwarded-to-browser',
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

  const result = await validatePortalCredentials('SCOTT@easyhomesource.com', 'scotts-individual-password');
  assert.deepEqual(requestBody, {
    email: 'scott@easyhomesource.com',
    password: 'scotts-individual-password',
  });
  assert.equal(result.status, 'valid');
  if (result.status === 'valid') {
    assert.equal(result.user.id, 'database-user-uuid');
    assert.equal(result.user.email, 'scott@easyhomesource.com');
    assert.equal(result.user.role, 'Admin');
  }
});

test('maps rejected EHS credentials to one generic invalid-credentials result', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Invalid email or password' }), { status: 401 });
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'wrong-password')).status, 'invalid-credentials');

  globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Account deactivated' }), { status: 403 });
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'some-password')).status, 'invalid-credentials');
});

test('missing EHS backend configuration fails closed', async () => {
  delete process.env.EHS_BACKEND_URL;
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'any-value')).status, 'configuration-missing');
});

test('EHS authentication outages are not reported as bad credentials', async () => {
  globalThis.fetch = async () => { throw new Error('network down'); };
  assert.equal((await validatePortalCredentials('scott@easyhomesource.com', 'any-value')).status, 'service-unavailable');
});
