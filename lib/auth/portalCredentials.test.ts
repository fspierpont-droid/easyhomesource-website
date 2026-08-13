import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { validatePortalCredentials } from './portalCredentials.ts';

beforeEach(() => { process.env.PORTAL_PASSWORD = 'configured-test-credential'; });
afterEach(() => delete process.env.PORTAL_PASSWORD);

test('Scott exists in the employee source and a configured credential authenticates him', () => {
  const result = validatePortalCredentials('SCOTT@easyhomesource.com', 'configured-test-credential');
  assert.equal(result.status, 'valid');
  assert.equal(result.status === 'valid' ? result.user.email : null, 'scott@easyhomesource.com');
});

test('wrong passwords and unknown employees have distinct safe diagnostic categories', () => {
  assert.equal(validatePortalCredentials('scott@easyhomesource.com', 'wrong-password').status, 'bad-password');
  assert.equal(validatePortalCredentials('unknown@easyhomesource.com', 'configured-test-credential').status, 'unknown-user');
});

test('missing authentication configuration is not reported as a bad password', () => {
  delete process.env.PORTAL_PASSWORD;
  assert.equal(validatePortalCredentials('scott@easyhomesource.com', 'any-value').status, 'configuration-missing');
});
