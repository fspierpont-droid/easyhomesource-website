import { timingSafeEqual } from 'crypto';
import { VERIFIED_TEAM_USERS, type TeamUser } from '../../data/teamMembers.ts';

export type PortalCredentialResult =
  | { status: 'valid'; user: TeamUser }
  | { status: 'unknown-user' | 'bad-password' | 'configuration-missing' };

export function validatePortalCredentials(email: unknown, password: unknown): PortalCredentialResult {
  const configuredPassword = process.env.PORTAL_PASSWORD;
  if (!configuredPassword) return { status: 'configuration-missing' };
  if (typeof email !== 'string' || typeof password !== 'string') return { status: 'unknown-user' };

  const user = VERIFIED_TEAM_USERS.find(
    (candidate) => candidate.active && candidate.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) return { status: 'unknown-user' };

  const expected = Buffer.from(configuredPassword);
  const supplied = Buffer.from(password);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return { status: 'bad-password' };
  return { status: 'valid', user };
}
