import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Employee ID is required.' }, { status: 400 });
  }

  const body = await request.text();
  const backend = await permanentApiRequest(
    request,
    `/api/auth/users/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to update employee.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, user: payload });
}
