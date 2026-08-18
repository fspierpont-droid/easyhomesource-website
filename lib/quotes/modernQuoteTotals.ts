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
  ehsLoanOfficerUsed?: boolean;
}

/**
 * Named-argument boundary for the modern quote builder.
 *
 * Master Quote 5 remains authoritative. The screen uses named inputs here so
 * land, delivery, service, cost, discount, tax, and loan-fee values cannot slide
 * into the wrong positional slot as the UI evolves.
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
    input.ehsLoanOfficerUsed ?? false,
  );
}
