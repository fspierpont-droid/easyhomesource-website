import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote, toBackendQuote } from '@/lib/quotes/permanentQuote';
import { normalizePortalQuoteForPersistence } from '@/lib/quotes/normalizePortalQuote';
import { validateQuoteForPersistence } from '@/lib/quotes/validateQuote';
import type { SavedQuote } from '@/data/quotesStore';

function quoteTimestamp(quote: SavedQuote) {
  const value = quote.updatedAt || quote.createdAt || quote.quoteDate || '';
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
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

  const backend = await permanentApiRequest(request, '/api/quotes');
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Failed to retrieve quotes' },
      { status: backend.status },
    );
  }
  if (!Array.isArray(payload)) {
    return NextResponse.json({ success: false, error: 'Permanent quote API returned invalid data.' }, { status: 502 });
  }

  const currentQuotes = payload.map(fromBackendQuote);
  let legacyQuotes: SavedQuote[] = [];
  let legacySync: Record<string, unknown> = { ok: false, error: 'Legacy quote archive is not available yet.' };

  try {
    const legacyBackend = await permanentApiRequest(request, '/api/legacy-quotes');
    const legacyPayload = await legacyBackend.json().catch(() => ({}));
    if (legacyBackend.ok && Array.isArray(legacyPayload.quotes)) {
      legacyQuotes = legacyPayload.quotes.map(fromBackendQuote);
      legacySync = legacyPayload.sync || { ok: true, archive_count: legacyQuotes.length };
    } else {
      legacySync = {
        ok: false,
        error: legacyPayload.detail || legacyPayload.error || 'Legacy quote archive is unavailable.',
      };
    }
  } catch (error) {
    console.error('Legacy quote hydration failed:', error);
    legacySync = { ok: false, error: 'Legacy quote archive is unavailable.' };
  }

  // If a historical quote was already intentionally migrated into the active
  // collection, prefer that current record and avoid showing a duplicate row.
  const currentNumbers = new Set(currentQuotes.map((quote) => quote.quoteNumber).filter(Boolean));
  const uniqueLegacyQuotes = legacyQuotes.filter((quote) => !currentNumbers.has(quote.quoteNumber));
  const quotes = [...currentQuotes, ...uniqueLegacyQuotes].sort((a, b) => quoteTimestamp(b) - quoteTimestamp(a));

  return NextResponse.json({ success: true, quotes, legacySync });
}

export async function POST(request: Request) {
  try {
    const rawQuote: SavedQuote = await request.json();
    if (rawQuote.legacyReadOnly) {
      return NextResponse.json(
        { success: false, error: 'Historical quotes are read-only and cannot be changed.' },
        { status: 403 },
      );
    }

    const quote = normalizePortalQuoteForPersistence(rawQuote);
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
