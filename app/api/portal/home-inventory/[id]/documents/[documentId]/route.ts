import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id, documentId } = await params;
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}`,
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
