import type { NextRequest } from 'next/server';
import type { TeamUser } from '../../data/teamMembers.ts';
import { validatePortalAccessToken, type PortalIdentityResult } from './portalCredentials.ts';

export const PORTAL_SESSION_COOKIE = 'ehs_portal_session';
export const PORTAL_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function readPortalToken(request: NextRequest | Request) {
  if ('cookies' in request) {
    return (request as NextRequest).cookies.get(PORTAL_SESSION_COOKIE)?.value;
  }

  return request.headers
    .get('cookie')
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${PORTAL_SESSION_COOKIE}=`))
    ?.slice(PORTAL_SESSION_COOKIE.length + 1);
}

/**
 * The browser holds only the permanent backend JWT in an HttpOnly cookie.
 * Every server-side authorization decision revalidates that token against the
 * permanent API, which reloads the employee from MongoDB and therefore honors
 * deactivation and permission changes immediately.
 */
export async function resolvePortalIdentity(request: NextRequest | Request): Promise<PortalIdentityResult> {
  return validatePortalAccessToken(readPortalToken(request));
}

export async function authenticatedPortalUser(request: NextRequest | Request): Promise<TeamUser | null> {
  const identity = await resolvePortalIdentity(request);
  return identity.status === 'valid' ? identity.user : null;
}

export function canWriteGhl(user: TeamUser) {
  if (user.permissions?.includes('*') || user.permissions?.includes('portal:*')) return true;
  return user.role === 'Owner' || user.role === 'Admin' || user.role === 'Manager';
}

export async function requirePortalAccess(request: NextRequest | Request, write = false) {
  const identity = await resolvePortalIdentity(request);

  if (identity.status === 'service-unavailable') {
    return {
      user: null,
      response: Response.json(
        { error: 'Portal authentication is temporarily unavailable.' },
        { status: 503 },
      ),
    };
  }

  if (identity.status !== 'valid') {
    return {
      user: null,
      response: Response.json({ error: 'Authentication required.' }, { status: 401 }),
    };
  }

  if (write && !canWriteGhl(identity.user)) {
    return {
      user: null,
      response: Response.json({ error: 'You do not have permission to update GHL.' }, { status: 403 }),
    };
  }

  return { user: identity.user, response: null };
}
