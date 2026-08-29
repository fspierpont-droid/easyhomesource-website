import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  params.set('page', url.searchParams.get('page') || '1');
  params.set('page_size', url.searchParams.get('page_size') || '25');
  const action = url.searchParams.get('action');
  const success = url.searchParams.get('success');
  if (action) params.set('action', action);
  if (success === 'true' || success === 'false') params.set('success', success);

  const backend = await permanentApiRequest(request, `/api/admin/audit-logs?${params.toString()}`);
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to load system activity.' },
      { status: backend.status },
    );
  }
  if (!Array.isArray(payload.items)) {
    return NextResponse.json(
      { success: false, error: 'Permanent audit API returned invalid data.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ success: true, ...payload });
}
