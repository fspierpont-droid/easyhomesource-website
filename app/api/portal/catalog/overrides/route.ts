import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const backend = await permanentApiRequest(request, '/api/catalog-overrides');
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to load catalog overrides.' },
      { status: backend.status },
    );
  }
  if (!Array.isArray(payload)) {
    return NextResponse.json(
      { success: false, error: 'Permanent catalog override API returned invalid data.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ success: true, overrides: payload });
}
