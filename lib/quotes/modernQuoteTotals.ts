import {
  calculateComprehensiveQuoteTotals,
  type QuoteFinancialTotals,
} from '@/data/pricingSpreadsheet';

export interface ModernQuoteTotalsInput {
  homePrice: number;
  landPrice: number;
  deliveryPrice: number;
  siteWorkPrice: number;
  addonsPrice: number;
  discountsPrice?: number;
  factoryCost?: number;
  deliveryCost?: number;
  siteWorkCost?: number;
  addonsCost?: number;
  taxRate?: number;
}

/**
 * Named-argument boundary for the modern quote builder.
 *
 * The V05 calculator is positional. Keeping the screen on named inputs prevents
 * factory cost, discounts, land, delivery, or service totals from sliding into
 * the wrong parameter slot when the UI evolves.
 */
export function calculateModernQuoteTotals(
  input: ModernQuoteTotalsInput,
): QuoteFinancialTotals {
  return calculateComprehensiveQuoteTotals(
    input.homePrice,
    input.landPrice,
    input.deliveryPrice,
    input.siteWorkPrice,
    input.addonsPrice,
    input.discountsPrice ?? 0,
    input.factoryCost ?? 0,
    input.deliveryCost ?? 0,
    input.siteWorkCost ?? 0,
    input.addonsCost ?? 0,
    input.taxRate ?? 0.03,
  );
}
