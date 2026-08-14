import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import type { TeamUser, UserRole } from '../../data/teamMembers.ts';

export const PORTAL_SESSION_COOKIE = 'ehs_portal_session';
const MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  user: TeamUser;
  expiresAt: number;
};

function secret() {
  const value = process.env.PORTAL_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('PORTAL_SESSION_SECRET must be configured with at least 32 characters.');
  return value;
}

function signature(encoded: string) {
  return createHmac('sha256', secret()).update(encoded).digest('base64url');
}

function validRole(role: unknown): role is UserRole {
  return role === 'Admin' || role === 'Manager' || role === 'Associate';
}

function validSessionUser(value: unknown): value is TeamUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<TeamUser>;
  return (
    typeof user.id === 'string' && user.id.length > 0 &&
    typeof user.name === 'string' && user.name.length > 0 &&
    typeof user.email === 'string' && user.email.includes('@') &&
    validRole(user.role) &&
    user.active === true &&
    typeof user.ghlLinked === 'boolean' &&
    (user.phone === undefined || typeof user.phone === 'string') &&
    (user.title === undefined || typeof user.title === 'string')
  );
}

export function createPortalSession(user: TeamUser) {
  if (!validSessionUser(user)) throw new Error('Cannot create a portal session for an invalid user.');
  const payload: SessionPayload = {
    user,
    expiresAt: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { value: `${encoded}.${signature(encoded)}`, maxAge: MAX_AGE_SECONDS };
}

export function verifyPortalSession(value?: string): TeamUser | null {
  if (!value) return null;
  try {
    const [encoded, supplied, extra] = value.split('.');
    if (!encoded || !supplied || extra) return null;
    const expected = signature(encoded);
    const suppliedBytes = Buffer.from(supplied);
    const expectedBytes = Buffer.from(expected);
    if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as Partial<SessionPayload>;
    if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) return null;
    if (!validSessionUser(payload.user)) return null;
    return payload.user;
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
