import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote, toBackendQuote } from '@/lib/quotes/permanentQuote';
import { validateQuoteForPersistence } from '@/lib/quotes/validateQuote';
import type { SavedQuote } from '@/data/quotesStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const path = id ? `/api/quotes/${encodeURIComponent(id)}` : '/api/quotes';
  const backend = await permanentApiRequest(request, path);
  const payload = await backend.json().catch(() => ({}));

  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || (id ? 'Quote not found' : 'Failed to retrieve quotes') },
      { status: backend.status },
    );
  }

  if (id) {
    return NextResponse.json({ success: true, quote: fromBackendQuote(payload) });
  }
  if (!Array.isArray(payload)) {
    return NextResponse.json({ success: false, error: 'Permanent quote API returned invalid data.' }, { status: 502 });
  }
  return NextResponse.json({ success: true, quotes: payload.map(fromBackendQuote) });
}

export async function POST(request: Request) {
  try {
    const quote: SavedQuote = await request.json();
    if (!quote.id || !quote.quoteNumber) {
      return NextResponse.json({ success: false, error: 'Quote ID and quote number are required.' }, { status: 400 });
    }

    const validationError = validateQuoteForPersistence(quote);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const backendPayload = toBackendQuote(quote);
    const existing = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(quote.id)}`);
    let backend: Response;

    if (existing.ok) {
      backend = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(quote.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(backendPayload),
      });
    } else if (existing.status === 404) {
      backend = await permanentApiRequest(request, '/api/quotes', {
        method: 'POST',
        body: JSON.stringify(backendPayload),
      });
    } else {
      const error = await existing.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: error.detail || 'Unable to determine quote persistence state.' },
        { status: existing.status },
      );
    }

    const payload = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      return NextResponse.json(
        { success: false, error: payload.detail || 'Failed to save quote.' },
        { status: backend.status },
      );
    }

    return NextResponse.json({ success: true, quote: fromBackendQuote(payload) });
  } catch (error) {
    console.error('Failed to persist quote:', error);
    return NextResponse.json({ success: false, error: 'Failed to save quote.' }, { status: 500 });
  }
}
