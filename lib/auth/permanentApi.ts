import { PORTAL_SESSION_COOKIE } from './portalSession';
import { portalBackendUrl } from './portalCredentials';

function readPortalAccessToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const encoded = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${PORTAL_SESSION_COOKIE}=`))
    ?.slice(PORTAL_SESSION_COOKIE.length + 1);

  if (!encoded) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export async function permanentApiRequest(
  request: Request,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = readPortalAccessToken(request);
  if (!token) {
    return Response.json({ detail: 'Authentication required.' }, { status: 401 });
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  try {
    return await fetch(`${portalBackendUrl()}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`Permanent EHS API request failed for ${path}`, error);
    return Response.json({ detail: 'Permanent EHS API is unavailable.' }, { status: 503 });
  }
}

export async function permanentPublicApiRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  try {
    return await fetch(`${portalBackendUrl()}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`Permanent public EHS API request failed for ${path}`, error);
    return Response.json({ detail: 'Permanent EHS API is unavailable.' }, { status: 503 });
  }
}
