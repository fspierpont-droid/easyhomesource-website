import { NextResponse } from 'next/server';
import { INITIAL_SAVED_QUOTES, SavedQuote } from '@/data/quotesStore';

// Reference server cache
let SERVER_QUOTES: SavedQuote[] = [...INITIAL_SAVED_QUOTES];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;
  const quote = SERVER_QUOTES.find(
    (q) => q.id === quoteId || q.quoteNumber === quoteId || q.shareToken === quoteId
  ) || INITIAL_SAVED_QUOTES.find(
    (q) => q.id === quoteId || q.quoteNumber === quoteId || q.shareToken === quoteId
  );

  if (quote) {
    return NextResponse.json({ success: true, quote });
  }

  return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quoteId = params.id;
    const updates: Partial<SavedQuote> = await request.json();
    const existingIndex = SERVER_QUOTES.findIndex(
      (q) => q.id === quoteId || q.quoteNumber === quoteId
    );

    if (existingIndex >= 0) {
      SERVER_QUOTES[existingIndex] = {
        ...SERVER_QUOTES[existingIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return NextResponse.json({ success: true, quote: SERVER_QUOTES[existingIndex] });
    }

    // If not found in server quotes, create from initial
    const fallback = INITIAL_SAVED_QUOTES.find((q) => q.id === quoteId) || {
      id: quoteId,
      quoteNumber: quoteId,
      customerName: 'Valued Customer',
      customerPhone: '352-555-0199',
      customerEmail: 'info@easyhomesource.com',
      salesperson: 'Scott Pierpont',
      status: 'APPROVED' as const,
      homeModel: 'Manufactured Home',
      homePrice: 94900,
      factoryCost: 68328,
      propertyAddress: 'Central FL',
      propertyPrice: 0,
      freightDelivery: 3850,
      siteWorkTotal: 30000,
      discounts: 0,
      lineItems: [],
      subtotal: 128750,
      taxBasis: 128750,
      salesTax: 3862.5,
      totalTurnkeyPrice: 132612.5,
      estimatedTotal: 132612.5,
      notes: 'Turnkey proposal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = { ...fallback, ...updates, updatedAt: new Date().toISOString() };
    SERVER_QUOTES = [updated, ...SERVER_QUOTES];
    return NextResponse.json({ success: true, quote: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;
  SERVER_QUOTES = SERVER_QUOTES.filter((q) => q.id !== quoteId && q.quoteNumber !== quoteId);
  return NextResponse.json({ success: true });
}
