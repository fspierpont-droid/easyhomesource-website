import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const backend = await permanentApiRequest(request, '/api/admin/system-check');
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to read system status.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, system: payload });
}
