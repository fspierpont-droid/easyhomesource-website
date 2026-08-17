import {
  FULL_MASTER_CATALOG_HOMES,
  getMasterQuote5CatalogAudit,
} from './masterQuote5Catalog';

export * from './masterQuote5Catalog';

const audit = getMasterQuote5CatalogAudit();
const excluded = new Set(['Skyline Ocala', 'Champion Lake City', 'Clayton Russellville']);
const excludedFound = FULL_MASTER_CATALOG_HOMES.filter((home) => excluded.has(home.manufacturer));

if (
  audit.sourceRows !== 225 ||
  audit.rawAllowedRows !== 225 ||
  audit.reconciledRows !== 225 ||
  audit.duplicateCount !== 0 ||
  audit.missing.length !== 0 ||
  excludedFound.length !== 0
) {
  throw new Error(
    `Master Quote 5 catalog reconciliation failed: ${JSON.stringify({
      sourceRows: audit.sourceRows,
      rawAllowedRows: audit.rawAllowedRows,
      reconciledRows: audit.reconciledRows,
      duplicateCount: audit.duplicateCount,
      missing: audit.missing.map((home) => `${home.manufacturer} ${home.name}`),
      excludedFound: excludedFound.map((home) => `${home.manufacturer} ${home.name}`),
    })}`,
  );
}

function close(actual: number, expected: number, tolerance = 0.02) {
  return Math.abs(actual - expected) <= tolerance;
}

for (const home of FULL_MASTER_CATALOG_HOMES) {
  const hudBase = Number(home.hudBasePrice);
  const factoryCost = Number(home.estFactoryCost);
  const sectionDues = factoryCost - hudBase - 2000 - 35;
  const sectionCount = sectionDues / 200;

  if (
    !Number.isInteger(sectionCount) ||
    sectionCount < 1 ||
    sectionCount > 3 ||
    !close(factoryCost, hudBase + 2000 + (200 * sectionCount) + 35, 0.001)
  ) {
    throw new Error(
      `Master Quote 5 factory-cost surcharge chain failed for ${home.manufacturer} ${home.name}: HUD ${hudBase}, factory ${factoryCost}, derived sections ${sectionCount}`,
    );
  }

  const markupFactor = Math.max(27368 / factoryCost, 85 * Math.pow(factoryCost, -0.454));
  const expectedEhsPrice = factoryCost * (markupFactor + 1);
  const expectedMsrp = expectedEhsPrice * 1.15;

  if (!close(Number(home.ehsPrice), expectedEhsPrice)) {
    throw new Error(
      `Master Quote 5 EHS-price derivation failed for ${home.manufacturer} ${home.name}: expected ${expectedEhsPrice}, got ${home.ehsPrice}`,
    );
  }
  if (!close(Number(home.msrp), expectedMsrp)) {
    throw new Error(
      `Master Quote 5 MSRP derivation failed for ${home.manufacturer} ${home.name}: expected ${expectedMsrp}, got ${home.msrp}`,
    );
  }
}

const requiredPriceChecks = [
  ['CAVCO Plant City', 'Atmos 28603N', 111000, 159324.27],
  ['CLAYTON Addison', 'Boujee 2', 87534, 129981.04],
  ['CAVCO Plant City', 'Paxton 28523A', 92433, 136161.09],
  ['CLAYTON TRU', 'Dogwood', 34440, 59946.77],
  ['Timber Creek', 'Delilah CSFL-3301', 127930, 180148.68],
] as const;

for (const [manufacturer, name, factoryCost, ehsPrice] of requiredPriceChecks) {
  const home = FULL_MASTER_CATALOG_HOMES.find(
    (item) => item.manufacturer === manufacturer && item.name === name,
  );
  if (!home || home.estFactoryCost !== factoryCost || Math.abs(home.ehsPrice - ehsPrice) > 0.001) {
    throw new Error(
      `Master Quote 5 known-price check failed for ${manufacturer} ${name}: ${JSON.stringify(home)}`,
    );
  }
}
