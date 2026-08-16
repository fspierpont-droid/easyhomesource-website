const API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = 'v3';

export const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
export const PROJECT_PIPELINE_ID = process.env.GHL_PROJECT_PIPELINE_ID || 'W8RI4f1c9G72Fzn1LVlS';
export const READY_FOR_QUOTE_FIELD_ID = process.env.GHL_READY_FOR_QUOTE_FIELD_ID || 'gHIjeANqYjpMcAKF6eIB';
export const DEPOSIT_STATUS_FIELD_ID = process.env.GHL_DEPOSIT_STATUS_FIELD_ID || 'hXYhZkFA1uizZeag77zR';
export class GhlConnectionError extends Error {}

function credentials() {
  const token = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) throw new GhlConnectionError('GHL_API_KEY and GHL_LOCATION_ID must be configured.');
  return { token, locationId };
}

export async function ghlRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = credentials();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: API_VERSION,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new GhlConnectionError(`GHL request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

type OpportunityPage = { opportunities?: unknown[]; meta?: Record<string, unknown> };
type PageFetcher = (path: string) => Promise<OpportunityPage>;

function nextPageParams(meta: Record<string, unknown> | undefined, currentPage: number) {
  if (!meta) return null;

  const directStartAfterId = meta.startAfterId ?? meta.start_after_id;
  const directStartAfter = meta.startAfter ?? meta.start_after;
  if (typeof directStartAfterId === 'string' && directStartAfterId) {
    return {
      startAfterId: directStartAfterId,
      ...(typeof directStartAfter === 'string' || typeof directStartAfter === 'number'
        ? { startAfter: String(directStartAfter) }
        : {}),
    };
  }

  const nextPage = meta.nextPage ?? meta.next_page;
  if (typeof nextPage === 'number' && Number.isInteger(nextPage) && nextPage > currentPage) {
    return { page: String(nextPage) };
  }
  if (typeof nextPage === 'string' && /^\d+$/.test(nextPage) && Number(nextPage) > currentPage) {
    return { page: nextPage };
  }

  const nextUrl = meta.nextPageUrl ?? meta.next_page_url;
  if (typeof nextUrl === 'string' && nextUrl) {
    const url = new URL(nextUrl, API_BASE);
    if (url.origin !== API_BASE) throw new GhlConnectionError('GHL returned an invalid pagination URL.');

    const page = url.searchParams.get('page');
    const startAfterId = url.searchParams.get('startAfterId') || url.searchParams.get('start_after_id');
    const startAfter = url.searchParams.get('startAfter') || url.searchParams.get('start_after');

    if (startAfterId) return { startAfterId, ...(startAfter ? { startAfter } : {}) };
    if (page && /^\d+$/.test(page) && Number(page) > currentPage) return { page };
    throw new GhlConnectionError('GHL returned malformed pagination metadata.');
  }

  return null;
}

export async function fetchAllOpportunities(pipelineId?: string, fetchPage: PageFetcher = ghlRequest) {
  const { locationId } = credentials();

  // HighLevel v3 removed the legacy snake_case search parameters in June 2026.
  // locationId is required and pipelineId is the current optional pipeline filter.
  const base = {
    locationId,
    limit: '100',
    ...(pipelineId ? { pipelineId } : {}),
  };

  const opportunities: unknown[] = [];
  const seen = new Set<string>();
  let continuation: Record<string, string> = { page: '1' };

  for (let requestCount = 0; requestCount < 1000; requestCount += 1) {
    const query = new URLSearchParams({ ...base, ...continuation });
    const key = query.toString();
    if (seen.has(key)) throw new GhlConnectionError('GHL pagination repeated a page.');
    seen.add(key);

    const data = await fetchPage(`/opportunities/search?${query}`);
    if (!Array.isArray(data.opportunities)) {
      throw new GhlConnectionError('GHL returned malformed opportunity data.');
    }

    opportunities.push(...data.opportunities);
    const next = nextPageParams(data.meta, Number(continuation.page || requestCount + 1));
    if (!next) return opportunities;
    continuation = next;
  }

  throw new GhlConnectionError('GHL pagination exceeded the safety limit.');
}

export const searchOpportunities = fetchAllOpportunities;
