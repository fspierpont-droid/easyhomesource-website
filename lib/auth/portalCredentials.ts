import { VERIFIED_TEAM_USERS, type TeamUser, type UserRole } from '../../data/teamMembers.ts';

export type PortalCredentialResult =
  | { status: 'valid'; user: TeamUser }
  | { status: 'invalid-credentials' | 'configuration-missing' | 'service-unavailable' };

type EhsAuthUser = {
  id?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  role?: unknown;
  active?: unknown;
  ghl_linked?: unknown;
};

type EhsLoginResponse = {
  user?: EhsAuthUser;
};

function configuredBackendUrl() {
  const raw = process.env.EHS_BACKEND_URL?.trim().replace(/\/+$/, '');
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const localDevelopment = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !localDevelopment) return null;
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function normalizeRole(role: unknown): UserRole {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase() : '';
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'manager') return 'Manager';
  return 'Associate';
}

function normalizeAuthenticatedUser(remote: EhsAuthUser, requestedEmail: string): TeamUser | null {
  if (
    typeof remote.id !== 'string' ||
    typeof remote.name !== 'string' ||
    typeof remote.email !== 'string'
  ) return null;

  const email = remote.email.trim().toLowerCase();
  if (!email || email !== requestedEmail || remote.active === false) return null;

  const displayProfile = VERIFIED_TEAM_USERS.find((candidate) => candidate.email.toLowerCase() === email);

  return {
    id: remote.id,
    name: remote.name.trim() || displayProfile?.name || email,
    email,
    role: normalizeRole(remote.role),
    active: true,
    ghlLinked: Boolean(remote.ghl_linked),
    phone: typeof remote.phone === 'string' && remote.phone.trim() ? remote.phone.trim() : displayProfile?.phone,
    title: displayProfile?.title,
  };
}

export async function validatePortalCredentials(email: unknown, password: unknown): Promise<PortalCredentialResult> {
  const backendUrl = configuredBackendUrl();
  if (!backendUrl) return { status: 'configuration-missing' };
  if (typeof email !== 'string' || typeof password !== 'string' || !password) return { status: 'invalid-credentials' };

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { status: 'invalid-credentials' };

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('EHS authentication service request failed', error);
    return { status: 'service-unavailable' };
  }

  if (response.status === 401 || response.status === 403) return { status: 'invalid-credentials' };
  if (!response.ok) return { status: 'service-unavailable' };

  let payload: EhsLoginResponse;
  try {
    payload = await response.json() as EhsLoginResponse;
  } catch {
    return { status: 'service-unavailable' };
  }

  const user = payload.user ? normalizeAuthenticatedUser(payload.user, normalizedEmail) : null;
  if (!user) return { status: 'service-unavailable' };

  return { status: 'valid', user };
}
