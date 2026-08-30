import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote, toBackendQuote } from '@/lib/quotes/permanentQuote';
import { normalizePortalQuoteForPersistence } from '@/lib/quotes/normalizePortalQuote';
import { validateQuoteForPersistence } from '@/lib/quotes/validateQuote';
import type { SavedQuote } from '@/data/quotesStore';

const legacyMutationError = () => NextResponse.json(
  { success: false, error: 'Historical quotes are read-only and cannot be changed.' },
  { status: 403 },
);

type QuoteRouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  { params }: QuoteRouteContext,
) {
  const { id } = await params;
  const legacy = id.startsWith('legacy:');
  const path = legacy
    ? `/api/legacy-quotes/${encodeURIComponent(id)}`
    : `/api/quotes/${encodeURIComponent(id)}`;
  const backend = await permanentApiRequest(request, path);
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
  { params }: QuoteRouteContext,
) {
  const { id } = await params;
  if (id.startsWith('legacy:')) return legacyMutationError();

  try {
    const quote: SavedQuote = await request.json();
    if (quote.legacyReadOnly) return legacyMutationError();

    const candidate = normalizePortalQuoteForPersistence({ ...quote, id });
    const validationError = validateQuoteForPersistence(candidate);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const backend = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackendQuote(candidate)),
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
    console.error(`Failed to update quote ${id}:`, error);
    return NextResponse.json({ success: false, error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: QuoteRouteContext,
) {
  const { id } = await params;
  if (id.startsWith('legacy:')) return legacyMutationError();

  const backend = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Failed to delete quote' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, deleted: Boolean(payload.ok) });
}
