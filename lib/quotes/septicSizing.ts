export interface SepticSizingResult {
  bedrooms: number;
  squareFeet: number;
  bedroomTankGallons: number;
  areaTankGallons: number;
  recommendedTankGallons: number;
  controllingFactor: 'bedrooms' | 'square_feet' | 'same';
}

/**
 * Easy HomeSource preliminary septic sizing table from the Master Quote workbook.
 *
 * EHS quoting rule:
 * - 1-2 bedrooms / up to 1,500 sq ft: 900 gallons
 * - 3 bedrooms / 1,501-2,250 sq ft: 1,050 gallons
 * - 4 bedrooms / 2,251-3,300 sq ft: 1,200 gallons
 * - each additional bedroom or each additional 750 sq ft (or fraction): +150 gallons
 *
 * Bedroom count and building area are evaluated independently and the larger
 * preliminary recommendation controls. This is a quoting recommendation only;
 * the final permitted OSTDS design is determined by the applicable county/DEP
 * review and site evaluation.
 */
export function calculateEhsSepticSizing(bedrooms: number, squareFeet: number): SepticSizingResult {
  const beds = Math.max(0, Math.floor(Number(bedrooms) || 0));
  const sqft = Math.max(0, Math.ceil(Number(squareFeet) || 0));

  const bedroomTankGallons = beds <= 2
    ? 900
    : 900 + (beds - 2) * 150;

  let areaTankGallons = 900;
  if (sqft > 3300) {
    areaTankGallons = 1200 + Math.ceil((sqft - 3300) / 750) * 150;
  } else if (sqft > 2250) {
    areaTankGallons = 1200;
  } else if (sqft > 1500) {
    areaTankGallons = 1050;
  }

  const recommendedTankGallons = Math.max(bedroomTankGallons, areaTankGallons);
  const controllingFactor = bedroomTankGallons === areaTankGallons
    ? 'same'
    : bedroomTankGallons > areaTankGallons
      ? 'bedrooms'
      : 'square_feet';

  return {
    bedrooms: beds,
    squareFeet: sqft,
    bedroomTankGallons,
    areaTankGallons,
    recommendedTankGallons,
    controllingFactor,
  };
}

export function getEhsRecommendedSepticTankSize(bedrooms: number, squareFeet: number) {
  return calculateEhsSepticSizing(bedrooms, squareFeet).recommendedTankGallons;
}
