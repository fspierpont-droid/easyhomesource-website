import {
  DIRT_PAD_LOAD_PRICING,
  calculateBlockTieDown,
  calculateMasterQuote5Profit,
  calculateSkirtingByDimensions,
  calculateTrimOut,
} from './masterQuote5PricingFinal';

export * from './masterQuote5PricingFinal';

function assertClose(actual: number, expected: number, label: string, tolerance = 0.01) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Master Quote 5 pricing guard failed for ${label}: expected ${expected}, got ${actual}`);
  }
}

const dirt1 = DIRT_PAD_LOAD_PRICING.find((row) => row.loads === 1);
const dirt2 = DIRT_PAD_LOAD_PRICING.find((row) => row.loads === 2);
const dirt20 = DIRT_PAD_LOAD_PRICING.find((row) => row.loads === 20);
if (!dirt1 || !dirt2 || !dirt20) throw new Error('Master Quote 5 dirt-pad table is incomplete.');
assertClose(dirt1.cost, 1000, '1-load dirt cost');
assertClose(dirt1.price, 1500, '1-load dirt price');
assertClose(dirt2.cost, 1800, '2-load dirt cost');
assertClose(dirt2.price, 2700, '2-load dirt price');
assertClose(dirt20.cost, 10900, '20-load dirt cost');
assertClose(dirt20.price, 16350, '20-load dirt price');

const block = calculateBlockTieDown(60, 'double');
assertClose(block.cost, 9756, '60-ft double-wide block/tie cost');
assertClose(block.price, 12195, '60-ft double-wide block/tie price');

const skirting = calculateSkirtingByDimensions(28, 60);
assertClose(skirting.linearFeet, 176, '28x60 skirting linear feet');
assertClose(skirting.cost, 1408, '28x60 skirting cost');
assertClose(skirting.price, 1760, '28x60 skirting price');

const trim = calculateTrimOut(2);
assertClose(trim.cost, 3000, 'double-wide trim cost');
assertClose(trim.price, 3300, 'double-wide trim price');

const profit = calculateMasterQuote5Profit({
  finalHomePrice: 143010,
  trueFactoryInvoice: 103305,
  ehsLoanOfficerUsed: true,
});
assertClose(profit.grossMargin, 39705, 'sample gross margin');
assertClose(profit.adminFee, 1985.25, 'sample admin fee');
assertClose(profit.loanFee, 1000, 'sample loan fee');
assertClose(profit.salesCommission, 7343.95, 'sample sales commission');
assertClose(profit.ehsDealProfit, 29375.80, 'sample EHS home deal profit');
