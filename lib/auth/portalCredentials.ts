import { VERIFIED_TEAM_USERS, type TeamUser, type UserRole } from '../../data/teamMembers.ts';

export const PERMANENT_EHS_BACKEND_URL = 'https://easyhomesource-api.onrender.com';

export type PortalCredentialResult =
  | { status: 'valid'; user: TeamUser; accessToken: string }
  | { status: 'invalid-credentials' | 'service-unavailable' };

export type PortalIdentityResult =
  | { status: 'valid'; user: TeamUser }
  | { status: 'unauthenticated' | 'service-unavailable' };

type EhsAuthUser = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  active?: unknown;
  ghl_linked?: unknown;
  business_role?: unknown;
  permissions?: unknown;
  amhi_access?: unknown;
};

type EhsLoginResponse = {
  access_token?: unknown;
  user?: EhsAuthUser;
};

export function portalBackendUrl() {
  if (process.env.NODE_ENV === 'production') return PERMANENT_EHS_BACKEND_URL;

  const raw = process.env.EHS_BACKEND_URL?.trim().replace(/\/+$/, '');
  if (!raw) return PERMANENT_EHS_BACKEND_URL;

  try {
    const url = new URL(raw);
    const localDevelopment = ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.protocol === 'https:' || (url.protocol === 'http:' && localDevelopment)) {
      return url.toString().replace(/\/+$/, '');
    }
  } catch {
    // Fall through to the permanent origin below.
  }

  console.error('Ignoring invalid EHS_BACKEND_URL override; using permanent EHS API origin.');
  return PERMANENT_EHS_BACKEND_URL;
}

function normalizeRole(role: unknown): UserRole {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase() : '';
  if (normalized === 'owner') return 'Owner';
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'manager') return 'Manager';
  return 'Associate';
}

function normalizePermissions(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const permissions = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return permissions.length ? [...new Set(permissions)] : [];
}

function compatibilityRole(remoteRole: unknown, permissions: string[] | undefined, profile?: TeamUser): UserRole {
  const effective = permissions ?? profile?.permissions;
  if (effective?.includes('*') || effective?.includes('users:write')) return 'Admin';
  if (effective?.includes('settings:read') || effective?.includes('catalog:manage')) return 'Manager';
  if (profile?.businessRole === 'Owner' || normalizeRole(remoteRole) === 'Owner') return 'Associate';
  return normalizeRole(remoteRole);
}

function normalizeAuthenticatedUser(remote: EhsAuthUser, expectedEmail?: string): TeamUser | null {
  if (
    typeof remote.id !== 'string' ||
    typeof remote.name !== 'string' ||
    typeof remote.email !== 'string'
  ) return null;

  const email = remote.email.trim().toLowerCase();
  if (!email || (expectedEmail && email !== expectedEmail) || remote.active === false) return null;

  const displayProfile = VERIFIED_TEAM_USERS.find((candidate) => candidate.email.toLowerCase() === email);
  const remotePermissions = normalizePermissions(remote.permissions);
  const hasRemotePermissionMetadata = Array.isArray(remote.permissions);
  const hasRemoteAmhiMetadata = typeof remote.amhi_access === 'boolean';
  const hasRemoteBusinessRole = typeof remote.business_role === 'string' && remote.business_role.trim();
  const permissions = hasRemotePermissionMetadata ? remotePermissions : displayProfile?.permissions;

  return {
    id: remote.id,
    name: remote.name.trim() || displayProfile?.name || email,
    email,
    role: compatibilityRole(remote.role, permissions, displayProfile),
    active: true,
    ghlLinked: Boolean(remote.ghl_linked),
    phone: typeof remote.phone === 'string' && remote.phone.trim() ? remote.phone.trim() : displayProfile?.phone,
    title: displayProfile?.title,
    businessRole: hasRemoteBusinessRole ? String(remote.business_role).trim() : displayProfile?.businessRole || displayProfile?.title,
    permissions,
    amhiAccess: hasRemoteAmhiMetadata ? remote.amhi_access === true : displayProfile?.amhiAccess === true,
  };
}

export async function validatePortalCredentials(email: unknown, password: unknown): Promise<PortalCredentialResult> {
  if (typeof email !== 'string' || typeof password !== 'string' || password.length === 0) {
    return { status: 'invalid-credentials' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { status: 'invalid-credentials' };

  let response: Response;
  try {
    response = await fetch(`${portalBackendUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('EHS authentication service request failed', error);
    return { status: 'service-unavailable' };
  }

  if ([400, 401, 403, 422].includes(response.status)) return { status: 'invalid-credentials' };
  if (!response.ok) return { status: 'service-unavailable' };

  let payload: EhsLoginResponse;
  try {
    payload = await response.json() as EhsLoginResponse;
  } catch {
    return { status: 'service-unavailable' };
  }

  const user = payload.user ? normalizeAuthenticatedUser(payload.user, normalizedEmail) : null;
  const accessToken = typeof payload.access_token === 'string' ? payload.access_token.trim() : '';
  if (!user || !accessToken) return { status: 'service-unavailable' };

  return { status: 'valid', user, accessToken };
}

export async function validatePortalAccessToken(token: string | undefined): Promise<PortalIdentityResult> {
  if (!token) return { status: 'unauthenticated' };

  let response: Response;
  try {
    response = await fetch(`${portalBackendUrl()}/api/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('EHS session validation request failed', error);
    return { status: 'service-unavailable' };
  }

  if (response.status === 401 || response.status === 403) return { status: 'unauthenticated' };
  if (!response.ok) return { status: 'service-unavailable' };

  let remote: EhsAuthUser;
  try {
    remote = await response.json() as EhsAuthUser;
  } catch {
    return { status: 'service-unavailable' };
  }

  const user = normalizeAuthenticatedUser(remote);
  return user ? { status: 'valid', user } : { status: 'unauthenticated' };
}
