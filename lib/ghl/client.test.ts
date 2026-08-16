import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { fetchAllOpportunities, GhlConnectionError, ghlRequest } from './client.ts';

beforeEach(() => {
  process.env.GHL_API_KEY = 'test-only';
  process.env.GHL_LOCATION_ID = 'location-test';
});

afterEach(() => {
  delete process.env.GHL_API_KEY;
  delete process.env.GHL_LOCATION_ID;
});

test('uses current HighLevel v3 opportunity search parameter names', async () => {
  const paths: string[] = [];
  await fetchAllOpportunities('pipeline-test', async (path) => {
    paths.push(path);
    return { opportunities: [], meta: {} };
  });

  assert.equal(paths.length, 1);
  const url = new URL(paths[0], 'https://services.leadconnectorhq.com');
  assert.equal(url.pathname, '/opportunities/search');
  assert.equal(url.searchParams.get('locationId'), 'location-test');
  assert.equal(url.searchParams.get('pipelineId'), 'pipeline-test');
  assert.equal(url.searchParams.get('location_id'), null);
  assert.equal(url.searchParams.get('pipeline_id'), null);
});

test('sends the v3 API version and bearer token', async () => {
  const originalFetch = globalThis.fetch;
  let capturedHeaders: Headers | null = null;

  globalThis.fetch = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    await ghlRequest('/locations/location-test');
    assert.equal(capturedHeaders?.get('Version'), 'v3');
    assert.equal(capturedHeaders?.get('Authorization'), 'Bearer test-only');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetches all 250 opportunities using GHL pagination metadata', async () => {
  const pages = [100, 100, 50];
  let call = 0;
  const results = await fetchAllOpportunities(undefined, async () => {
    const index = call++;
    return {
      opportunities: Array.from({ length: pages[index] }, (_, item) => ({ id: `${index}-${item}` })),
      meta: index < 2 ? { nextPage: index + 2 } : {},
    };
  });
  assert.equal(results.length, 250);
  assert.equal(call, 3);
});

test('supports cursor-style continuation metadata', async () => {
  const paths: string[] = [];
  let call = 0;
  await fetchAllOpportunities(undefined, async (path) => {
    paths.push(path);
    call += 1;
    if (call === 1) {
      return { opportunities: [{ id: 'one' }], meta: { startAfterId: 'cursor-1', startAfter: 12345 } };
    }
    return { opportunities: [{ id: 'two' }], meta: {} };
  });

  assert.equal(paths.length, 2);
  const second = new URL(paths[1], 'https://services.leadconnectorhq.com');
  assert.equal(second.searchParams.get('startAfterId'), 'cursor-1');
  assert.equal(second.searchParams.get('startAfter'), '12345');
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
  await assert.rejects(
    fetchAllOpportunities(undefined, async () => ({ opportunities: [], meta: { nextPageUrl: '/opportunities/search?page=1' } })),
    /malformed/
  );
  await assert.rejects(
    fetchAllOpportunities(undefined, async () => ({ opportunities: [], meta: { nextPageUrl: 'https://evil.example/page=2' } })),
    /invalid pagination URL/
  );
});
