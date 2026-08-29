import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ catalogKey: string }> },
) {
  const { catalogKey } = await params;
  if (!catalogKey) {
    return NextResponse.json({ success: false, error: 'Catalog key is required.' }, { status: 400 });
  }

  const body = await request.text();
  const backend = await permanentApiRequest(
    request,
    `/api/catalog-overrides/${encodeURIComponent(catalogKey)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to save catalog change.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, override: payload });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ catalogKey: string }> },
) {
  const { catalogKey } = await params;
  if (!catalogKey) {
    return NextResponse.json({ success: false, error: 'Catalog key is required.' }, { status: 400 });
  }

  const backend = await permanentApiRequest(
    request,
    `/api/catalog-overrides/${encodeURIComponent(catalogKey)}`,
    { method: 'DELETE' },
  );
  if (!backend.ok) {
    const payload = await backend.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to reset catalog change.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true });
}
