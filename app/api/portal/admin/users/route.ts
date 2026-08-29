import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const backend = await permanentApiRequest(request, '/api/auth/users');
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to load employees.' },
      { status: backend.status },
    );
  }
  if (!Array.isArray(payload)) {
    return NextResponse.json(
      { success: false, error: 'Permanent employee API returned invalid data.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ success: true, users: payload });
}

export async function POST(request: Request) {
  const body = await request.text();
  const backend = await permanentApiRequest(request, '/api/auth/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to create employee.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, user: payload }, { status: 201 });
}
