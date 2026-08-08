import { NextResponse } from 'next/server';
import { INITIAL_SAVED_QUOTES, SavedQuote } from '@/data/quotesStore';

// In-memory server cache of quotes
let SERVER_QUOTES: SavedQuote[] = [...INITIAL_SAVED_QUOTES];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const quote = SERVER_QUOTES.find(
      (q) => q.id === id || q.quoteNumber === id || q.shareToken === id
    );
    if (quote) {
      return NextResponse.json({ success: true, quote });
    }
    return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, quotes: SERVER_QUOTES });
}

export async function POST(request: Request) {
  try {
    const newQuote: SavedQuote = await request.json();
    const existingIndex = SERVER_QUOTES.findIndex(
      (q) => q.id === newQuote.id || q.quoteNumber === newQuote.quoteNumber
    );

    if (existingIndex >= 0) {
      SERVER_QUOTES[existingIndex] = {
        ...newQuote,
        updatedAt: new Date().toISOString()
      };
    } else {
      SERVER_QUOTES = [
        {
          ...newQuote,
          createdAt: newQuote.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ...SERVER_QUOTES
      ];
    }

    return NextResponse.json({ success: true, quote: newQuote });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
