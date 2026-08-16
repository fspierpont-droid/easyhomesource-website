import {
  calculateComprehensiveQuoteTotals,
  type QuoteFinancialTotals,
} from '../../data/pricingSpreadsheet.ts';
import {
  newQuoteTotalArgs,
  type NewQuoteTotalsInput,
} from './newQuoteTotalArgs.ts';

export type { NewQuoteTotalsInput } from './newQuoteTotalArgs.ts';

/**
 * Named-argument boundary for the new-quote screen.
 *
 * The underlying spreadsheet engine remains the single pricing authority. The
 * dependency-free mapper owns only positional argument ordering so that this
 * historically error-prone boundary can be regression tested directly.
 */
export function calculateNewQuoteTotals(input: NewQuoteTotalsInput): QuoteFinancialTotals {
  return calculateComprehensiveQuoteTotals(...newQuoteTotalArgs(input));
}
