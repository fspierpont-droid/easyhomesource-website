import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote, toBackendQuote } from '@/lib/quotes/permanentQuote';
import type { SavedQuote } from '@/data/quotesStore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const backend = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(params.id)}`);
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Quote not found' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, quote: fromBackendQuote(payload) });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const quote: SavedQuote = await request.json();
    const backend = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(params.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackendQuote({ ...quote, id: params.id })),
    });
    const payload = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      return NextResponse.json(
        { success: false, error: payload.detail || 'Failed to update quote' },
        { status: backend.status },
      );
    }
    return NextResponse.json({ success: true, quote: fromBackendQuote(payload) });
  } catch (error) {
    console.error(`Failed to update quote ${params.id}:`, error);
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const backend = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(params.id)}`, { method: 'DELETE' });
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Failed to delete quote' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, deleted: Boolean(payload.ok) });
}
