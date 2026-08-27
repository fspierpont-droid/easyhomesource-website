import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateEhsSepticSizing, getEhsRecommendedSepticTankSize } from './septicSizing.ts';

test('EHS septic sizing follows Master Quote bedroom and area tiers', () => {
  assert.equal(getEhsRecommendedSepticTankSize(2, 1400), 900);
  assert.equal(getEhsRecommendedSepticTankSize(3, 1800), 1050);
  assert.equal(getEhsRecommendedSepticTankSize(4, 2800), 1200);
  assert.equal(getEhsRecommendedSepticTankSize(5, 3300), 1350);
});

test('square footage can control when it requires the larger preliminary tank', () => {
  const result = calculateEhsSepticSizing(3, 2600);
  assert.equal(result.bedroomTankGallons, 1050);
  assert.equal(result.areaTankGallons, 1200);
  assert.equal(result.recommendedTankGallons, 1200);
  assert.equal(result.controllingFactor, 'square_feet');
});

test('additional square-footage tiers round up by each 750 sq ft or fraction', () => {
  assert.equal(getEhsRecommendedSepticTankSize(4, 3300), 1200);
  assert.equal(getEhsRecommendedSepticTankSize(4, 3301), 1350);
  assert.equal(getEhsRecommendedSepticTankSize(4, 4050), 1350);
  assert.equal(getEhsRecommendedSepticTankSize(4, 4051), 1500);
});

test('additional bedroom tiers add 150 gallons per bedroom', () => {
  assert.equal(getEhsRecommendedSepticTankSize(4, 2000), 1200);
  assert.equal(getEhsRecommendedSepticTankSize(5, 2000), 1350);
  assert.equal(getEhsRecommendedSepticTankSize(6, 2000), 1500);
});
