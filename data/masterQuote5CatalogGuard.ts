import {
  FULL_MASTER_CATALOG_HOMES as SOURCE_MASTER_QUOTE_5_HOMES,
  getEffectiveMasterCatalog as getSourceEffectiveMasterCatalog,
  getMasterQuote5CatalogAudit,
  saveStoredCatalogOverrides,
  clearStoredCatalogOverrides,
  type MasterCatalogHome,
} from './masterQuote5Catalog';

export type { MasterCatalogHome };
export { saveStoredCatalogOverrides, clearStoredCatalogOverrides };

const audit = getMasterQuote5CatalogAudit();
const excluded = new Set(['Skyline Ocala', 'Champion Lake City', 'Clayton Russellville']);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function deriveMasterQuote5Prices(home: MasterCatalogHome): MasterCatalogHome {
  const factoryCost = Number(home.estFactoryCost) || 0;
  if (factoryCost <= 0) return home;

  const markupFactor = Math.max(27368 / factoryCost, 85 * Math.pow(factoryCost, -0.454));
  const ehsPrice = roundMoney(factoryCost * (markupFactor + 1));
  const msrp = roundMoney(ehsPrice * 1.15);

  return {
    ...home,
    ehsPrice,
    startingPrice: ehsPrice,
    msrp,
  };
}

function deriveCatalog(homes: MasterCatalogHome[]) {
  return homes.map(deriveMasterQuote5Prices);
}

export const FULL_MASTER_CATALOG_HOMES = deriveCatalog(SOURCE_MASTER_QUOTE_5_HOMES);

export function getEffectiveMasterCatalog(): MasterCatalogHome[] {
  return deriveCatalog(getSourceEffectiveMasterCatalog());
}

const excludedFound = FULL_MASTER_CATALOG_HOMES.filter((home) => excluded.has(home.manufacturer));

if (
  audit.sourceRows !== 225 ||
  audit.rawAllowedRows !== 225 ||
  audit.reconciledRows !== 225 ||
  audit.duplicateCount !== 0 ||
  audit.missing.length !== 0 ||
  excludedFound.length !== 0 ||
  FULL_MASTER_CATALOG_HOMES.length !== 225
) {
  throw new Error(
    `Master Quote 5 catalog reconciliation failed: ${JSON.stringify({
      sourceRows: audit.sourceRows,
      rawAllowedRows: audit.rawAllowedRows,
      reconciledRows: audit.reconciledRows,
      finalRows: FULL_MASTER_CATALOG_HOMES.length,
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
  const expectedEhsPrice = roundMoney(factoryCost * (markupFactor + 1));
  const expectedMsrp = roundMoney(expectedEhsPrice * 1.15);

  if (!close(Number(home.ehsPrice), expectedEhsPrice, 0.001)) {
    throw new Error(
      `Master Quote 5 EHS-price derivation failed for ${home.manufacturer} ${home.name}: expected ${expectedEhsPrice}, got ${home.ehsPrice}`,
    );
  }
  if (!close(Number(home.msrp), expectedMsrp, 0.001)) {
    throw new Error(
      `Master Quote 5 MSRP derivation failed for ${home.manufacturer} ${home.name}: expected ${expectedMsrp}, got ${home.msrp}`,
    );
  }
}

const requiredSourceChecks = [
  ['CAVCO Plant City', 'Atmos 28603N', 108565, 111000],
  ['CLAYTON Addison', 'Boujee 2', 85099, 87534],
  ['CAVCO Plant City', 'Paxton 28523A', 89998, 92433],
  ['CLAYTON TRU', 'Dogwood', 32205, 34440],
  ['Timber Creek', 'Delilah CSFL-3301', 125495, 127930],
] as const;

for (const [manufacturer, name, hudBase, factoryCost] of requiredSourceChecks) {
  const home = FULL_MASTER_CATALOG_HOMES.find(
    (item) => item.manufacturer === manufacturer && item.name === name,
  );
  if (!home || home.hudBasePrice !== hudBase || home.estFactoryCost !== factoryCost) {
    throw new Error(
      `Master Quote 5 known-source check failed for ${manufacturer} ${name}: ${JSON.stringify(home)}`,
    );
  }
}
