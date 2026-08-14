import type { QuoteFinancialTotals } from './pricingSpreadsheet';

export interface SelectedQuoteLineItem {
  id: string;
  sku: string;
  name: string;
  category: 'mandatory_services' | 'site_work' | 'addons' | 'options' | 'custom';
  unitPrice: number;
  unitCost: number;
  quantity: number;
  totalPrice: number;
  totalCost: number;
  description: string;
}

export interface DepositItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: string;
}

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  quoteDate?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  salesperson: string;
  salespersonEmail?: string;
  salespersonTitle?: string;
  salespersonPhone?: string;
  status: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT';
  homeModel: string;
  manufacturer?: string;
  series?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  dimensions?: string;
  homeWidth?: number;
  homeLength?: number;
  homePrice: number;
  factoryCost: number;
  homeDescription?: string;
  propertyAddress: string;
  propertyPrice: number;
  deliveryRouteType?: 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer' | string;
  deliveryMiles?: number;
  escortsCount?: number;
  freightDelivery: number;
  freightCost?: number;
  siteWorkTotal: number;
  siteWorkCost?: number;
  lineItems: SelectedQuoteLineItem[];
  discounts: number;
  purchaseType?: 'cash' | 'financing';
  financingStatus?: string;
  preApprovalAmount?: number;
  targetBudget?: number;
  ehsLoanOfficerUsed?: boolean;
  activeLoanFee?: number;
  deposits?: DepositItem[];
  loanApprovalDate?: string;
  loanClosingDate?: string;
  permitApprovalDate?: string;
  siteReadyDate?: string;
  deliveryDate?: string;
  installationDate?: string;
  walkthroughDate?: string;
  moveInDate?: string;
  subtotal: number;
  financedSubtotal?: number;
  nonFinancedSubtotal?: number;
  taxBasis: number;
  salesTax: number;
  totalTurnkeyPrice: number;
  estimatedTotal: number;
  downPaymentPercent?: number;
  downPaymentAmount?: number;
  estimatedMonthlyPayment?: number;
  financialTotals?: QuoteFinancialTotals;
  notes: string;
  notesCustomer?: string;
  notesInternal?: string;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The former seed array mixed test data with real-looking customer data. It is
 * intentionally empty. Mongo through /api/portal/quotes is the only authority.
 */
export const INITIAL_SAVED_QUOTES: SavedQuote[] = [];
const STORAGE_KEY = 'ehs_permanent_quote_cache_v1';

function readCache(): SavedQuote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(quotes: SavedQuote[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  window.dispatchEvent(new Event('ehs_quotes_updated'));
}

function syncError(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('ehs_quote_sync_error', { detail: message }));
}

export function getSavedQuotes(): SavedQuote[] {
  return readCache();
}

export function getSavedQuoteById(id: string): SavedQuote | null {
  if (!id) return null;
  return readCache().find(
    (quote) => quote.id === id || quote.quoteNumber === id || quote.shareToken === id,
  ) || null;
}

export async function refreshQuotesFromServer(): Promise<SavedQuote[]> {
  const response = await fetch('/api/portal/quotes', { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok || !data.success || !Array.isArray(data.quotes)) {
    throw new Error(data.error || 'Failed to load permanent quote records.');
  }
  writeCache(data.quotes);
  return data.quotes;
}

export async function fetchQuoteFromServer(id: string): Promise<SavedQuote | null> {
  const response = await fetch(`/api/portal/quotes/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const data = await response.json();
  if (response.status === 404) return null;
  if (!response.ok || !data.success || !data.quote) {
    throw new Error(data.error || 'Failed to load quote.');
  }
  const current = readCache().filter((quote) => quote.id !== data.quote.id);
  writeCache([data.quote, ...current]);
  return data.quote;
}

export async function saveQuoteToServer(quote: SavedQuote): Promise<SavedQuote> {
  const response = await fetch('/api/portal/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote),
  });
  const data = await response.json();
  if (!response.ok || !data.success || !data.quote) {
    throw new Error(data.error || 'Permanent quote save failed.');
  }
  const current = readCache().filter(
    (item) => item.id !== data.quote.id && item.quoteNumber !== data.quote.quoteNumber,
  );
  writeCache([data.quote, ...current]);
  return data.quote;
}

export function saveQuoteToStore(quote: SavedQuote): SavedQuote {
  void saveQuoteToServer(quote).catch((error) => {
    console.error('Permanent quote save failed:', error);
    syncError(error instanceof Error ? error.message : 'Permanent quote save failed.');
  });
  return quote;
}

export async function deleteQuoteFromServer(id: string): Promise<boolean> {
  const response = await fetch(`/api/portal/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Permanent quote delete failed.');
  }
  writeCache(readCache().filter((quote) => quote.id !== id && quote.quoteNumber !== id));
  return true;
}

export function deleteQuoteFromStore(id: string): boolean {
  void deleteQuoteFromServer(id).catch((error) => {
    console.error('Permanent quote delete failed:', error);
    syncError(error instanceof Error ? error.message : 'Permanent quote delete failed.');
  });
  return true;
}
