import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { fetchAllOpportunities, GhlConnectionError } from './client.ts';

beforeEach(() => { process.env.GHL_API_KEY = 'test-only'; process.env.GHL_LOCATION_ID = 'location-test'; });
afterEach(() => { delete process.env.GHL_API_KEY; delete process.env.GHL_LOCATION_ID; });

test('fetches all 250 opportunities using GHL pagination metadata', async () => {
  const pages = [100, 100, 50];
  let call = 0;
  const results = await fetchAllOpportunities(undefined, async () => {
    const index = call++;
    return { opportunities: Array.from({ length: pages[index] }, (_, item) => ({ id: `${index}-${item}` })), meta: index < 2 ? { nextPage: index + 2 } : {} };
  });
  assert.equal(results.length, 250);
  assert.equal(call, 3);
});

test('a later-page failure rejects instead of returning partial canonical data', async () => {
  let call = 0;
  await assert.rejects(
    fetchAllOpportunities(undefined, async () => {
      call += 1;
      if (call === 2) throw new GhlConnectionError('page two failed');
      return { opportunities: Array.from({ length: 100 }, (_, id) => ({ id })), meta: { nextPage: 2 } };
    }),
    /page two failed/
  );
});

test('repeated and malformed pagination metadata fails closed', async () => {
  await assert.rejects(fetchAllOpportunities(undefined, async () => ({ opportunities: [], meta: { nextPageUrl: '/opportunities/search?page=1' } })), /malformed/);
  await assert.rejects(fetchAllOpportunities(undefined, async () => ({ opportunities: [], meta: { nextPageUrl: 'https://evil.example/page=2' } })), /invalid pagination URL/);
});
