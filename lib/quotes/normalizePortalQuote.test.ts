import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePortalLineItem, normalizePortalQuoteForPersistence } from './normalizePortalQuote.ts';

const badSkirting = {
  id: 'skirting-test',
  sku: 'SITE-SKIRTING-VINYL',
  name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
  category: 'mandatory_services' as const,
  unitPrice: 3492,
  unitCost: 2408,
  quantity: 172,
  totalPrice: 600624,
  totalCost: 414176,
  description: 'Full perimeter vinyl skirting (172 linear ft) and 2 sets of code stairs.',
};

test('package-priced skirting keeps linear footage in description instead of quantity', () => {
  const normalized = normalizePortalLineItem(badSkirting);
  assert.equal(normalized.quantity, 1);
  assert.equal(normalized.totalPrice, 3492);
  assert.equal(normalized.totalCost, 2408);
  assert.match(normalized.description, /172 linear ft/);
});

test('quote persistence totals cannot multiply full skirting package price by perimeter feet', () => {
  const normalized = normalizePortalQuoteForPersistence({
    id: 'quote-test',
    quoteNumber: 'Q-TEST',
    customerName: 'Test Customer',
    customerPhone: '352-555-0101',
    customerEmail: 'test@example.com',
    salesperson: 'Test Associate',
    status: 'DRAFT',
    homeModel: 'Test Home',
    homePrice: 100000,
    factoryCost: 70000,
    propertyAddress: '123 Test Rd',
    propertyPrice: 0,
    freightDelivery: 0,
    siteWorkTotal: 600624,
    lineItems: [badSkirting],
    discounts: 0,
    subtotal: 700624,
    taxBasis: 700624,
    salesTax: 21018.72,
    totalTurnkeyPrice: 721642.72,
    estimatedTotal: 721642.72,
    notes: '',
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  });

  assert.equal(normalized.lineItems[0].quantity, 1);
  assert.equal(normalized.lineItems[0].totalPrice, 3492);
  assert.equal(normalized.siteWorkTotal, 3492);
  assert.equal(normalized.subtotal, 103492);
  assert.equal(normalized.salesTax, 3104.76);
  assert.equal(normalized.estimatedTotal, 106596.76);
});
