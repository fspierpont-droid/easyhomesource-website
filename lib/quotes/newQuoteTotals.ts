import {
  calculateComprehensiveQuoteTotals,
  type QuoteFinancialTotals,
} from '../../data/masterQuote5Pricing.ts';
import {
  newQuoteTotalArgs,
  type NewQuoteTotalsInput,
} from './newQuoteTotalArgs.ts';

export type { NewQuoteTotalsInput } from './newQuoteTotalArgs.ts';

/**
 * Named-argument boundary for the new-quote screen.
 *
 * Master Quote 5 remains the pricing authority. The dependency-free mapper owns
 * only positional argument ordering so this historically error-prone boundary
 * can be regression tested directly.
 */
export function calculateNewQuoteTotals(input: NewQuoteTotalsInput): QuoteFinancialTotals {
  return calculateComprehensiveQuoteTotals(...newQuoteTotalArgs(input));
}
