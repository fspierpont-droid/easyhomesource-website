import { NextResponse } from 'next/server';
import { VERIFIED_TEAM_USERS } from '@/data/teamMembers';
import { createPortalSession, PORTAL_SESSION_COOKIE } from '@/lib/auth/portalSession';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const expectedPassword = process.env.PORTAL_PASSWORD;
  if (!expectedPassword) return NextResponse.json({ error: 'Portal authentication is not configured.' }, { status: 503 });
  const user = VERIFIED_TEAM_USERS.find((candidate) => candidate.active && candidate.email.toLowerCase() === String(email || '').trim().toLowerCase());
  if (!user || typeof password !== 'string' || password !== expectedPassword) return NextResponse.json({ error: 'Invalid employee credentials.' }, { status: 401 });
  const session = createPortalSession(user);
  const response = NextResponse.json({ user });
  response.cookies.set(PORTAL_SESSION_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: session.maxAge });
  return response;
}
