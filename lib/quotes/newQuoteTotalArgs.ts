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

export type ComprehensiveQuoteTotalArgs = readonly [
  homePrice: number,
  landPrice: number,
  deliveryPrice: number,
  siteWorkPrice: number,
  addonsPrice: number,
  discountsPrice: number,
  factoryCost: number,
  deliveryCost: number,
  siteWorkCost: number,
  addonsCost: number,
  taxRate: number,
];

/**
 * Convert named new-quote values into the exact positional order expected by
 * the V05 spreadsheet pricing engine. Keeping this mapping dependency-free
 * makes the production regression directly testable under Node.
 */
export function newQuoteTotalArgs(input: NewQuoteTotalsInput): ComprehensiveQuoteTotalArgs {
  return [
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
  ];
}
