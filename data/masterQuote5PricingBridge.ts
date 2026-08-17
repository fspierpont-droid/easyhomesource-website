// Keep all existing Master Quote 5 validation side effects and public exports.
export * from './masterQuote5PricingGuard';

import { SERVICE_CATALOG as SOURCE_SERVICE_CATALOG } from './masterQuote5PricingFinal';

function cleanPortalDescription(value: string): string {
  return String(value || '')
    .replace(/Master Quote 5\s*/gi, '')
    .replace(/Master Spreadsheet\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Application-facing catalog: keep the validated prices/formulas, but never leak
// internal workbook/source labels into employee or customer-facing descriptions.
export const SERVICE_CATALOG = SOURCE_SERVICE_CATALOG.map((item) => ({
  ...item,
  description: cleanPortalDescription(item.description),
}));

// Vercel's production bundler was resolving several runtime helpers as undefined
// through the chained export-star graph. Re-export the runtime values explicitly
// from the modules that own them so /quotes/new prerendering is deterministic.
export {
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
  calculateTrimOut,
  getRecommendedSepticTankSize,
  calculateComprehensiveQuoteTotals,
  calculateDirtPadPricing,
} from './masterQuote5PricingV2';
