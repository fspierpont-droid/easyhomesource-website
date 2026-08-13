import { timingSafeEqual } from 'crypto';
import { VERIFIED_TEAM_USERS, type TeamUser } from '../../data/teamMembers.ts';

// This is the employee portal credential that was in use before the server-session
// rollout. PORTAL_PASSWORD can override it without invalidating existing deployments.
const EXISTING_PORTAL_PASSWORD = 'easyhomesource2026';

export function validatePortalCredentials(email: unknown, password: unknown): TeamUser | null {
  if (typeof email !== 'string' || typeof password !== 'string') return null;

  const user = VERIFIED_TEAM_USERS.find(
    (candidate) => candidate.active && candidate.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user) return null;

  const expected = Buffer.from(process.env.PORTAL_PASSWORD || EXISTING_PORTAL_PASSWORD);
  const supplied = Buffer.from(password);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  return user;
}
