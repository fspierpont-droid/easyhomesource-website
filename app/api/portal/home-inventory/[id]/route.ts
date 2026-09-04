import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}`,
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Inventory record not found.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, inventory: payload });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to update inventory record.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, inventory: payload });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to archive inventory record.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, ...payload });
}
