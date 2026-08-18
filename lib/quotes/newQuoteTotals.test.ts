import test from 'node:test';
import assert from 'node:assert/strict';
import { newQuoteTotalArgs } from './newQuoteTotalArgs.ts';

test('new quote values map to the V05 engine in customer-facing and internal order', () => {
  const args = newQuoteTotalArgs({
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

  assert.deepEqual(args, [
    158829.11,
    0,
    3850,
    33590,
    0,
    0,
    110600,
    3500,
    25000,
    0,
    0.03,
  ]);

  const [home, land, delivery, siteWork, addons, discounts, factoryCost] = args;
  const customerSubtotal = home + land + delivery + siteWork + addons - discounts;

  assert.equal(customerSubtotal, 196269.11);
  assert.equal(factoryCost, 110600);
  assert.notEqual(customerSubtotal, customerSubtotal - factoryCost);
});
