import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; documentId: string } },
) {
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(params.id)}/documents/${encodeURIComponent(params.documentId)}`,
    { method: 'DELETE' },
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to remove inventory document.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, ...payload });
}
