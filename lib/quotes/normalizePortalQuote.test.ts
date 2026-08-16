import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSkirtingPackageLine } from './skirtingPackage.ts';

const badSkirting = {
  id: 'skirting-test',
  sku: 'SITE-SKIRTING-VINYL',
  name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
  category: 'mandatory_services',
  unitPrice: 3492,
  unitCost: 2408,
  quantity: 172,
  totalPrice: 600624,
  totalCost: 414176,
  description: 'Full perimeter vinyl skirting (172 linear ft) and 2 sets of code stairs.',
};

test('package-priced skirting keeps linear footage in description instead of quantity', () => {
  const normalized = normalizeSkirtingPackageLine(badSkirting);
  assert.equal(normalized.quantity, 1);
  assert.equal(normalized.totalPrice, 3492);
  assert.equal(normalized.totalCost, 2408);
  assert.match(String(normalized.description), /172 linear ft/);
});

test('non-skirting line items are not changed by skirting normalization', () => {
  const permit = {
    ...badSkirting,
    sku: 'SITE-PERMIT-PLAN',
    quantity: 2,
    unitPrice: 2000,
    totalPrice: 4000,
  };
  const normalized = normalizeSkirtingPackageLine(permit);
  assert.deepEqual(normalized, permit);
});
