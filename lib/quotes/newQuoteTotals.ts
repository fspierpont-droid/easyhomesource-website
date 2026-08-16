import {
  calculateComprehensiveQuoteTotals,
  type QuoteFinancialTotals,
} from '../../data/pricingSpreadsheet.ts';

export interface NewQuoteTotalsInput {
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
 * Named-argument boundary for the new-quote screen.
 *
 * The underlying spreadsheet engine is positional. Keeping the page behind a
 * named adapter prevents home/land/delivery/cost values from silently shifting
 * into the wrong slots when the UI is changed.
 */
export function calculateNewQuoteTotals(input: NewQuoteTotalsInput): QuoteFinancialTotals {
  return calculateComprehensiveQuoteTotals(
    Number(input.homePrice) || 0,
    Number(input.landPrice) || 0,
    Number(input.deliveryPrice) || 0,
    Number(input.siteWorkPrice) || 0,
    Number(input.addonsPrice) || 0,
    Number(input.discountsPrice) || 0,
    Number(input.factoryCost) || 0,
    Number(input.deliveryCost) || 0,
    Number(input.siteWorkCost) || 0,
    Number(input.addonsCost) || 0,
    input.taxRate ?? 0.03,
  );
}
