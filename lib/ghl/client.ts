const API_BASE = 'https://services.leadconnectorhq.com';

export const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
export const PROJECT_PIPELINE_ID = process.env.GHL_PROJECT_PIPELINE_ID || 'W8RI4f1c9G72Fzn1LVlS';
export const READY_FOR_QUOTE_FIELD_ID = process.env.GHL_READY_FOR_QUOTE_FIELD_ID || 'gHIjeANqYjpMcAKF6eIB';

export class GhlConnectionError extends Error {}

function credentials() {
  const token = process.env.GHL_API_KEY;
  if (!token || !GHL_LOCATION_ID) {
    throw new GhlConnectionError('GHL_API_KEY and GHL_LOCATION_ID must be configured.');
  }
  return { token, locationId: GHL_LOCATION_ID };
}

export async function ghlRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = credentials();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28',
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new GhlConnectionError(`GHL request failed (${response.status}): ${detail}`);
  }
  return response.json() as Promise<T>;
}

export async function searchOpportunities(pipelineId?: string) {
  const { locationId } = credentials();
  const query = new URLSearchParams({ location_id: locationId, limit: '100' });
  if (pipelineId) query.set('pipeline_id', pipelineId);
  const data = await ghlRequest<{ opportunities?: unknown[] }>(`/opportunities/search?${query}`);
  return Array.isArray(data.opportunities) ? data.opportunities : [];
}
