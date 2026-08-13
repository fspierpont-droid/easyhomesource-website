import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import { validatePortalCredentials } from './portalCredentials.ts';

afterEach(() => delete process.env.PORTAL_PASSWORD);

test('existing EHS employee credentials remain valid', () => {
  const user = validatePortalCredentials('SCOTT@easyhomesource.com', 'easyhomesource2026');
  assert.equal(user?.email, 'scott@easyhomesource.com');
});

test('wrong passwords and unknown employees are rejected', () => {
  assert.equal(validatePortalCredentials('scott@easyhomesource.com', 'wrong-password'), null);
  assert.equal(validatePortalCredentials('unknown@easyhomesource.com', 'easyhomesource2026'), null);
});

test('a configured password overrides the existing credential', () => {
  process.env.PORTAL_PASSWORD = 'a-new-production-password';
  assert.equal(validatePortalCredentials('scott@easyhomesource.com', 'easyhomesource2026'), null);
  assert.equal(validatePortalCredentials('scott@easyhomesource.com', 'a-new-production-password')?.id, 'user-7');
});
