import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote, toBackendQuote } from '@/lib/quotes/permanentQuote';
import { normalizePortalQuoteForPersistence } from '@/lib/quotes/normalizePortalQuote';
import { validateQuoteForPersistence } from '@/lib/quotes/validateQuote';
import type { SavedQuote } from '@/data/quotesStore';

function normalizeAddress(value: unknown): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function validateNoFreeEhsProperty(request: Request, quote: SavedQuote): Promise<string | null> {
  const siteAddress = quote.propertyAddress?.trim();
  const landPrice = Number(quote.propertyPrice) || 0;

  // Customer-owned land and Land TBD may legitimately carry a $0 land value.
  // We only intervene when the quote's site address matches an AVAILABLE record
  // in the permanent EHS Property Center.
  if (!siteAddress || landPrice > 0) return null;

  const response = await permanentApiRequest(request, '/api/properties');
  if (!response.ok) {
    return 'Unable to verify the selected EHS property price. Refresh Property Center and try again.';
  }

  const documents = await response.json().catch(() => []);
  if (!Array.isArray(documents)) {
    return 'Unable to verify the selected EHS property price.';
  }

  const quoteAddress = normalizeAddress(siteAddress);
  const matched = documents.find((document: Record<string, unknown>) => {
    if (document.status !== 'AVAILABLE') return false;
    const permanentAddress = normalizeAddress(
      [document.street, document.city, document.state, document.zip].filter(Boolean).join(' '),
    );
    return permanentAddress === quoteAddress;
  });

  if (matched) {
    return 'The selected EHS property does not have a verified land/package price. Enter the actual land or package price before saving this quote.';
  }

  return null;
}

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
    const rawQuote: SavedQuote = await request.json();
    const quote = normalizePortalQuoteForPersistence(rawQuote);
    if (!quote.id || !quote.quoteNumber) {
      return NextResponse.json({ success: false, error: 'Quote ID and quote number are required.' }, { status: 400 });
    }

    const validationError = validateQuoteForPersistence(quote);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const propertyValidationError = await validateNoFreeEhsProperty(request, quote);
    if (propertyValidationError) {
      return NextResponse.json({ success: false, error: propertyValidationError }, { status: 400 });
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
