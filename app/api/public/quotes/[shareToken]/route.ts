import { NextResponse } from 'next/server';
import { permanentPublicApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote } from '@/lib/quotes/permanentQuote';

type PublicQuoteRouteContext = { params: Promise<{ shareToken: string }> };

export async function GET(
  _request: Request,
  { params }: PublicQuoteRouteContext,
) {
  const { shareToken } = await params;
  const token = String(shareToken || '').trim();

  if (token.length < 32) {
    return NextResponse.json(
      { success: false, error: 'Quote not found.' },
      { status: 404 },
    );
  }

  const backend = await permanentPublicApiRequest(
    `/api/public/quotes/${encodeURIComponent(token)}`,
  );
  const payload = await backend.json().catch(() => ({}));

  if (!backend.ok) {
    const status = backend.status === 404 ? 404 : backend.status || 503;
    return NextResponse.json(
      {
        success: false,
        error:
          status === 404
            ? 'Quote not found.'
            : payload.detail || 'The quote service is temporarily unavailable.',
      },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    quote: fromBackendQuote(payload),
  });
}
