import { NextResponse } from 'next/server';
import { PORTAL_SESSION_COOKIE } from '@/lib/auth/portalSession';
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PORTAL_SESSION_COOKIE, '', { httpOnly: true, expires: new Date(0), sameSite: 'strict', path: '/' });
  return response;
}
