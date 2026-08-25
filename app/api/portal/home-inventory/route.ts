import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeArchived = url.searchParams.get('include_archived') === 'true';
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory?include_archived=${includeArchived ? 'true' : 'false'}`,
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to retrieve home inventory.' },
      { status: backend.status },
    );
  }
  if (!Array.isArray(payload)) {
    return NextResponse.json(
      { success: false, error: 'Permanent inventory API returned invalid data.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ success: true, inventory: payload });
}

export async function POST(request: Request) {
  const body = await request.text();
  const backend = await permanentApiRequest(request, '/api/home-inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to create inventory record.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, inventory: payload }, { status: 201 });
}
