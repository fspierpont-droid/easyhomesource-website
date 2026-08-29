import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function POST(request: Request) {
  const body = await request.text();
  const backend = await permanentApiRequest(request, '/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to change password.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true });
}
