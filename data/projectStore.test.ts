import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import { clearStoredProjects, getStoredProjects, saveProjectsToStore } from './projectStore.ts';

const originalWindow = globalThis.window;
const originalWarn = console.warn;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  console.warn = originalWarn;
});

function installStorage(storage: Partial<Storage>) {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage }
  });
  console.warn = () => {};
}

const project = { ghlOpportunityId: 'opp-fresh' } as never;

test('writes and reads a successful GHL projection cache', () => {
  let value: string | null = null;
  installStorage({
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
    removeItem: () => { value = null; }
  });

  assert.equal(saveProjectsToStore([project]), true);
  assert.deepEqual(getStoredProjects().map((item) => item.ghlOpportunityId), ['opp-fresh']);
  assert.equal(clearStoredProjects(), true);
  assert.deepEqual(getStoredProjects(), []);
});

test('quota and security write failures are contained and never thrown', () => {
  for (const error of [
    new DOMException('Quota exceeded', 'QuotaExceededError'),
    new DOMException('Storage blocked', 'SecurityError')
  ]) {
    installStorage({ setItem: () => { throw error; } });
    assert.doesNotThrow(() => saveProjectsToStore([project]));
    assert.equal(saveProjectsToStore([project]), false);
  }
});

test('unavailable storage access is contained', () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: Object.defineProperty({}, 'localStorage', {
      get() { throw new DOMException('Storage unavailable', 'SecurityError'); }
    })
  });
  console.warn = () => {};

  assert.deepEqual(getStoredProjects(), []);
  assert.equal(saveProjectsToStore([project]), false);
  assert.equal(clearStoredProjects(), false);
});

test('malformed and stale cache data are safely ignored or replaced by fresh data', () => {
  let value: string | null = '{not json';
  installStorage({
    getItem: () => value,
    setItem: (_key, next) => { value = next; }
  });

  assert.deepEqual(getStoredProjects(), []);
  assert.equal(saveProjectsToStore([project]), true);
  assert.deepEqual(getStoredProjects().map((item) => item.ghlOpportunityId), ['opp-fresh']);
});

test('cache removal failure is contained', () => {
  installStorage({ removeItem: () => { throw new DOMException('Blocked', 'SecurityError'); } });
  assert.doesNotThrow(() => clearStoredProjects());
  assert.equal(clearStoredProjects(), false);
});
