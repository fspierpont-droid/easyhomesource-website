import { NextRequest, NextResponse } from 'next/server';
import { authenticatedPortalUser } from '@/lib/auth/portalSession';
export async function GET(request: NextRequest) {
  const user = authenticatedPortalUser(request);
  return user ? NextResponse.json({ user }) : NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
}
