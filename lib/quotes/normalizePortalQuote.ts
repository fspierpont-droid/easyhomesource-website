import { calculateComprehensiveQuoteTotals } from '../../data/pricingSpreadsheet.ts';
import type { SavedQuote, SelectedQuoteLineItem } from '../../data/quotesStore';

export const SKIRTING_PACKAGE_SKU = 'SITE-SKIRTING-VINYL';

export function normalizePortalLineItem(item: SelectedQuoteLineItem): SelectedQuoteLineItem {
  if (item.sku !== SKIRTING_PACKAGE_SKU) return item;

  // calculateSkirtingByDimensions already returns the full perimeter package
  // price/cost. Linear footage belongs in the description, not in quantity.
  return {
    ...item,
    quantity: 1,
    totalPrice: Number(item.unitPrice) || 0,
    totalCost: Number(item.unitCost) || 0,
  };
}

export function normalizePortalQuoteForPersistence(quote: SavedQuote): SavedQuote {
  const lineItems = (quote.lineItems || []).map(normalizePortalLineItem);
  const siteWorkItems = lineItems.filter(
    (item) => item.category === 'mandatory_services' || item.category === 'site_work',
  );
  const addOnItems = lineItems.filter(
    (item) => item.category === 'addons' || item.category === 'options' || item.category === 'custom',
  );

  const siteWorkTotal = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const siteWorkCost = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const addonsTotal = addOnItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const addonsCost = addOnItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const freight = Number(quote.freightDelivery) || 0;
  const freightCost = Number(quote.freightCost) || (freight > 0 ? Math.round(freight / 1.1) : 0);
  const taxRate = quote.financialTotals?.sales_tax_rate ?? 0.03;

  const totals = calculateComprehensiveQuoteTotals(
    Number(quote.homePrice) || 0,
    Number(quote.propertyPrice) || 0,
    freight,
    siteWorkTotal,
    addonsTotal,
    Number(quote.discounts) || 0,
    Number(quote.factoryCost) || 0,
    freightCost,
    siteWorkCost,
    addonsCost,
    taxRate,
  );

  return {
    ...quote,
    lineItems,
    siteWorkTotal,
    siteWorkCost,
    subtotal: totals.subtotal,
    financedSubtotal: totals.financed_subtotal,
    nonFinancedSubtotal: totals.non_financed_subtotal,
    taxBasis: totals.tax_basis,
    salesTax: totals.sales_tax_total,
    totalTurnkeyPrice: totals.estimated_total,
    estimatedTotal: totals.estimated_total,
    financialTotals: totals,
  };
}
