import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNewQuoteTotals } from './newQuoteTotals.ts';

test('new quote totals add visible customer amounts instead of subtracting factory cost', () => {
  const totals = calculateNewQuoteTotals({
    homePrice: 158829.11,
    landPrice: 0,
    deliveryPrice: 3850,
    siteWorkPrice: 33590,
    addonsPrice: 0,
    discountsPrice: 0,
    factoryCost: 110600,
    deliveryCost: 3500,
    siteWorkCost: 25000,
    addonsCost: 0,
    taxRate: 0.03,
  });

  assert.equal(totals.home_subtotal, 158829.11);
  assert.equal(totals.land_subtotal, 0);
  assert.equal(totals.delivery_total, 3850);
  assert.equal(totals.site_work_total, 33590);
  assert.equal(totals.subtotal, 196269.11);
  assert.equal(totals.sales_tax_total, 5888.07);
  assert.equal(totals.estimated_total, 202157.18);
});
