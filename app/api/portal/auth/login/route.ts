import { NextResponse } from 'next/server';
import { validatePortalCredentials } from '@/lib/auth/portalCredentials';
import { PORTAL_SESSION_COOKIE, PORTAL_SESSION_MAX_AGE_SECONDS } from '@/lib/auth/portalSession';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const credential = await validatePortalCredentials(email, password);

  if (credential.status === 'service-unavailable') {
    console.error('Portal authentication failed: permanent EHS authentication service unavailable.');
    return NextResponse.json({ error: 'Portal authentication is temporarily unavailable.' }, { status: 503 });
  }

  if (credential.status !== 'valid') {
    console.warn('Portal authentication rejected: INVALID_CREDENTIALS');
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ user: credential.user });
  response.cookies.set(PORTAL_SESSION_COOKIE, credential.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: PORTAL_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
