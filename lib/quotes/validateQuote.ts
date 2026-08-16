import type { SavedQuote } from '@/data/quotesStore';

const PLACEHOLDER_PHONE = '352-555-0199';
const PLACEHOLDER_SITE = 'Spring Hill, FL 34606';

export function validateQuoteForPersistence(quote: SavedQuote): string | null {
  if (!quote.customerName?.trim()) return 'Customer name is required.';
  if (quote.customerPhone?.trim() === PLACEHOLDER_PHONE) {
    return 'Replace or clear the sample customer phone number before saving.';
  }
  if (quote.propertyAddress?.trim() === PLACEHOLDER_SITE) {
    return 'Replace the sample Spring Hill delivery address before saving.';
  }
  if (!quote.homeModel?.trim()) return 'A home model is required before saving.';
  if (!Number.isFinite(Number(quote.homePrice)) || Number(quote.homePrice) < 0) {
    return 'Home price is invalid.';
  }
  return null;
}
