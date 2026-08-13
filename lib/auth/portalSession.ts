import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { VERIFIED_TEAM_USERS, type TeamUser } from '../../data/teamMembers.ts';

export const PORTAL_SESSION_COOKIE = 'ehs_portal_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionPayload = { userId: string; expiresAt: number };

function secret() {
  const value = process.env.PORTAL_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('PORTAL_SESSION_SECRET must be configured with at least 32 characters.');
  return value;
}

function signature(encoded: string) {
  return createHmac('sha256', secret()).update(encoded).digest('base64url');
}

export function createPortalSession(user: TeamUser) {
  const encoded = Buffer.from(JSON.stringify({ userId: user.id, expiresAt: Date.now() + MAX_AGE_SECONDS * 1000 } satisfies SessionPayload)).toString('base64url');
  return { value: `${encoded}.${signature(encoded)}`, maxAge: MAX_AGE_SECONDS };
}

export function verifyPortalSession(value?: string): TeamUser | null {
  if (!value) return null;
  try {
    const [encoded, supplied] = value.split('.');
    if (!encoded || !supplied) return null;
    const expected = signature(encoded);
    const suppliedBytes = Buffer.from(supplied);
    const expectedBytes = Buffer.from(expected);
    if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as SessionPayload;
    if (!payload.userId || payload.expiresAt <= Date.now()) return null;
    return VERIFIED_TEAM_USERS.find((user) => user.id === payload.userId && user.active) || null;
  } catch {
    return null;
  }
}

export function authenticatedPortalUser(request: NextRequest | Request) {
  const cookie = 'cookies' in request
    ? (request as NextRequest).cookies.get(PORTAL_SESSION_COOKIE)?.value
    : request.headers.get('cookie')?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${PORTAL_SESSION_COOKIE}=`))?.slice(PORTAL_SESSION_COOKIE.length + 1);
  return verifyPortalSession(cookie);
}

export function canWriteGhl(user: TeamUser) {
  return user.role === 'Admin' || user.role === 'Manager';
}

export function requirePortalAccess(request: NextRequest | Request, write = false) {
  const user = authenticatedPortalUser(request);
  if (!user) return { user: null, response: Response.json({ error: 'Authentication required.' }, { status: 401 }) };
  if (write && !canWriteGhl(user)) return { user: null, response: Response.json({ error: 'You do not have permission to update GHL.' }, { status: 403 }) };
  return { user, response: null };
}
