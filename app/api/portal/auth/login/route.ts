import { NextResponse } from 'next/server';
import { validatePortalCredentials } from '@/lib/auth/portalCredentials';
import { createPortalSession, PORTAL_SESSION_COOKIE } from '@/lib/auth/portalSession';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const credential = validatePortalCredentials(email, password);
  if (credential.status === 'configuration-missing') {
    console.error('Portal authentication failed: AUTH_CONFIGURATION_MISSING');
    return NextResponse.json({ error: 'Portal authentication is not configured.' }, { status: 503 });
  }
  if (credential.status !== 'valid') {
    console.warn(`Portal authentication rejected: ${credential.status === 'unknown-user' ? 'UNKNOWN_USER' : 'BAD_PASSWORD'}`);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  let session;
  try {
    session = createPortalSession(credential.user);
  } catch (error) {
    console.error('Portal authentication failed: SESSION_CREATION_FAILURE', error);
    return NextResponse.json({ error: 'Portal session is unavailable. Please contact an administrator.' }, { status: 503 });
  }
  const response = NextResponse.json({ user: credential.user });
  response.cookies.set(PORTAL_SESSION_COOKIE, session.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: session.maxAge });
  return response;
}
