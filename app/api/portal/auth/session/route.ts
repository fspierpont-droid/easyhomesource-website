import { NextRequest, NextResponse } from 'next/server';
import { resolvePortalIdentity } from '@/lib/auth/portalSession';

export async function GET(request: NextRequest) {
  const identity = await resolvePortalIdentity(request);

  if (identity.status === 'valid') {
    return NextResponse.json({ user: identity.user });
  }

  if (identity.status === 'service-unavailable') {
    return NextResponse.json(
      { error: 'Portal authentication is temporarily unavailable.' },
      { status: 503 },
    );
  }

  return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
}
