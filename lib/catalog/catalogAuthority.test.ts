import assert from 'node:assert/strict';
import test from 'node:test';

import type { Home } from '../../data/homes.ts';
import type { MasterCatalogHome } from '../../data/fullMasterCatalog.generated.ts';
import {
  applyMasterCatalogOverrides,
  applyPublicCatalogOverrides,
  findPublicCatalogMatch,
} from './catalogAuthority.ts';

const masterHome: MasterCatalogHome = {
  slug: 'cavco-plant-city-paxton-28523a',
  name: 'Paxton 28523A',
  manufacturer: 'CAVCO Plant City',
  series: 'Elite',
  hudBasePrice: 95996,
  estFactoryCost: 98031,
  msrp: 164663.6,
  ehsPrice: 143185.74,
  startingPrice: 143185.74,
  squareFeet: 1394,
  bedrooms: 3,
  bathrooms: 2,
  width: 26,
  length: 52,
  dimensions: '26\' 8" x 52\'',
  modularOnFrameCapable: true,
  modularOffFrameCapable: false,
};

const publicHome: Home = {
  id: 'paxton',
  name: 'Paxton',
  slug: 'paxton',
  manufacturer: 'Cavco Plant City',
  modelNumber: 'Paxton 28523A',
  series: 'Elite',
  bedrooms: 3,
  bathrooms: 2,
  squareFeet: 1394,
  width: 26.67,
  length: 52,
  size: '26\' 8" x 52\'',
  startingPrice: 158888,
  status: 'Available',
  isActive: true,
  isFeatured: true,
  isOnDisplay: true,
  isCatalogModel: false,
  isNewArrival: false,
  isSpecialOffer: false,
  isComingSoon: false,
  shortDescription: 'Paxton public description',
  features: [],
  standardFeatures: [],
  images: [],
  gallery: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

test('master catalog receives approved internal pricing/spec overrides', () => {
  const [result] = applyMasterCatalogOverrides([masterHome], [{
    catalog_key: 'quote:cavco-plant-city-paxton-28523a',
    quote_slug: masterHome.slug,
    ehs_price: 150000,
    est_factory_cost: 99000,
    msrp: 170000,
    square_feet: 1400,
  }]);

  assert.equal(result.ehsPrice, 150000);
  assert.equal(result.startingPrice, 150000);
  assert.equal(result.estFactoryCost, 99000);
  assert.equal(result.msrp, 170000);
  assert.equal(result.squareFeet, 1400);
});

test('public catalog gets only public fields from an override object', () => {
  const [result] = applyPublicCatalogOverrides([publicHome], [{
    catalog_key: 'quote:cavco-plant-city-paxton-28523a',
    public_slug: 'paxton',
    starting_price: 159900,
    ehs_price: 150000,
    est_factory_cost: 99000,
    public_status: 'Coming Soon',
    is_on_display: false,
  }]);

  assert.equal(result.startingPrice, 159900);
  assert.equal(result.status, 'Coming Soon');
  assert.equal(result.isOnDisplay, false);
  assert.equal('estFactoryCost' in result, false);
});

test('surface visibility is independent', () => {
  const override = {
    catalog_key: 'quote:cavco-plant-city-paxton-28523a',
    quote_slug: masterHome.slug,
    public_slug: publicHome.slug,
    quote_enabled: false,
    public_enabled: true,
  };

  assert.equal(applyMasterCatalogOverrides([masterHome], [override]).length, 0);
  assert.equal(applyPublicCatalogOverrides([publicHome], [override]).length, 1);
});

test('quote home can map to its public model-number record', () => {
  const result = findPublicCatalogMatch(masterHome, [publicHome]);
  assert.equal(result?.slug, 'paxton');
});
