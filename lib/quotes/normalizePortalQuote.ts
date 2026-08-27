import { FULL_MASTER_CATALOG_HOMES } from '../../data/masterQuote5CatalogGuard';
import { calculateComprehensiveQuoteTotals } from '../../data/masterQuote5PricingBridge';
import type { SavedQuote, SelectedQuoteLineItem } from '../../data/quotesStore';
import { normalizeSkirtingPackageLine, SKIRTING_PACKAGE_SKU } from './skirtingPackage';

export { SKIRTING_PACKAGE_SKU };

export function normalizePortalLineItem(item: SelectedQuoteLineItem): SelectedQuoteLineItem {
  return normalizeSkirtingPackageLine(item);
}

export function normalizePortalQuoteForPersistence(quote: SavedQuote): SavedQuote {
  const lineItems = (quote.lineItems || []).map(normalizePortalLineItem);
  const siteWorkItems = lineItems.filter(
    (item) =>
      item.category === 'mandatory_services' ||
      item.category === 'site_work' ||
      item.category === 'custom',
  );
  const addOnItems = lineItems.filter(
    (item) => item.category === 'addons' || item.category === 'options',
  );

  const siteWorkTotal = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const siteWorkCost = siteWorkItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const addonsTotal = addOnItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const addonsCost = addOnItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const freight = Number(quote.freightDelivery) || 0;
  const freightCost = Number(quote.freightCost) || 0;
  const taxRate = quote.financialTotals?.sales_tax_rate ?? 0.03;

  const catalogHome = FULL_MASTER_CATALOG_HOMES.find((home) =>
    home.name === quote.homeModel && (!quote.manufacturer || home.manufacturer === quote.manufacturer),
  ) || FULL_MASTER_CATALOG_HOMES.find((home) => home.name === quote.homeModel);
  const homePrice = Number(quote.homePrice) || 0;
  const ehsPrice =
    Number(quote.ehsPrice) ||
    Number(catalogHome?.ehsPrice) ||
    Number(quote.financialTotals?.ehs_price_calculated) ||
    homePrice;
  const msrpPrice = Number(quote.msrpPrice) || Number(catalogHome?.msrp) || 0;
  const vipPrice = Number(quote.vipPrice) > 0
    ? Number(quote.vipPrice)
    : homePrice > 0 && ehsPrice > 0 && homePrice < ehsPrice - 0.005
      ? homePrice
      : 0;

  const totals = calculateComprehensiveQuoteTotals(
    homePrice,
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
    Boolean(quote.ehsLoanOfficerUsed),
  );

  return {
    ...quote,
    msrpPrice,
    ehsPrice,
    vipPrice,
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