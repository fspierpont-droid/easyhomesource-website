// Keep all existing Master Quote 5 validation side effects and public exports.
export * from './masterQuote5PricingGuard';

// Vercel's production bundler was resolving several runtime helpers as undefined
// through the chained export-star graph. Re-export the runtime values explicitly
// from the modules that own them so /quotes/new prerendering is deterministic.
export { SERVICE_CATALOG } from './masterQuote5PricingFinal';
export {
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
  calculateTrimOut,
  getRecommendedSepticTankSize,
  calculateComprehensiveQuoteTotals,
} from './masterQuote5PricingV2';
