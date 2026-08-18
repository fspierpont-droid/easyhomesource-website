import {
  FULL_MASTER_CATALOG_HOMES as SOURCE_MASTER_QUOTE_5_HOMES,
  getEffectiveMasterCatalog as getSourceEffectiveMasterCatalog,
  getMasterQuote5CatalogAudit,
  saveStoredCatalogOverrides,
  clearStoredCatalogOverrides,
  type MasterCatalogHome as SourceMasterCatalogHome,
} from './masterQuote5Catalog';

export type MasterCatalogHome = SourceMasterCatalogHome & { floors?: number };
export { saveStoredCatalogOverrides, clearStoredCatalogOverrides };

const audit = getMasterQuote5CatalogAudit();
const excluded = new Set(['Skyline Ocala', 'Champion Lake City', 'Clayton Russellville']);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function timberCreekSections(home: SourceMasterCatalogHome) {
  return Number(home.width) <= 18 ? 1 : 2;
}

function correctedFactoryCost(home: SourceMasterCatalogHome): number {
  const hudBase = Number(home.hudBasePrice) || 0;
  const sourceFactory = Number(home.estFactoryCost) || 0;

  // Master Quote 5's Timber Creek rows are incomplete: most omit the
  // $200-per-section state/association dues even though the workbook's global
  // factory-cost rule requires them. Timber Creek's 16-ft models are singles;
  // its 32-ft models are doubles. Rebuild the factory cost from HUD Base so the
  // missing dues cannot flow into EHS/MSRP pricing.
  if (home.manufacturer === 'Timber Creek') {
    return hudBase + 2000 + (200 * timberCreekSections(home)) + 35;
  }

  return sourceFactory;
}

function exactSectionCount(home: Pick<MasterCatalogHome, 'hudBasePrice' | 'estFactoryCost'>) {
  const sectionCount = (
    Number(home.estFactoryCost) - Number(home.hudBasePrice) - 2000 - 35
  ) / 200;
  return Number.isInteger(sectionCount) && sectionCount >= 1 && sectionCount <= 3
    ? sectionCount
    : 0;
}

export function getMasterQuote5SectionCount(home: Pick<MasterCatalogHome, 'hudBasePrice' | 'estFactoryCost'>) {
  const count = exactSectionCount(home);
  if (!count) {
    throw new Error('Unable to derive Master Quote 5 section count from factory-cost surcharge chain.');
  }
  return count;
}

function deriveMasterQuote5Prices(home: SourceMasterCatalogHome): MasterCatalogHome {
  const factoryCost = correctedFactoryCost(home);
  if (factoryCost <= 0) return home as MasterCatalogHome;

  const sectionCount = exactSectionCount({ hudBasePrice: home.hudBasePrice, estFactoryCost: factoryCost });
  if (!sectionCount) {
    throw new Error(`Unable to derive section count for ${home.manufacturer} ${home.name}.`);
  }

  const markupFactor = Math.max(27368 / factoryCost, 85 * Math.pow(factoryCost, -0.454));
  const ehsPrice = roundMoney(factoryCost * (markupFactor + 1));
  const msrp = roundMoney(ehsPrice * 1.15);

  return {
    ...home,
    floors: sectionCount,
    estFactoryCost: factoryCost,
    ehsPrice,
    startingPrice: ehsPrice,
    msrp,
  };
}

function deriveCatalog(homes: SourceMasterCatalogHome[]): MasterCatalogHome[] {
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
  const sectionCount = getMasterQuote5SectionCount(home);

  if (!close(factoryCost, hudBase + 2000 + (200 * sectionCount) + 35, 0.001)) {
    throw new Error(
      `Master Quote 5 factory-cost surcharge chain failed for ${home.manufacturer} ${home.name}: HUD ${hudBase}, factory ${factoryCost}, derived sections ${sectionCount}`,
    );
  }

  if (home.floors !== sectionCount) {
    throw new Error(
      `Master Quote 5 section-count exposure failed for ${home.manufacturer} ${home.name}: expected ${sectionCount}, got ${home.floors}`,
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
  ['CAVCO Plant City', 'Atmos 28603N', 108565, 111000, 2],
  ['CLAYTON Addison', 'Boujee 2', 85099, 87534, 2],
  ['CAVCO Plant City', 'Paxton 28523A', 89998, 92433, 2],
  ['CLAYTON TRU', 'Dogwood', 32205, 34440, 1],
  ['Timber Creek', 'Delilah CSFL-3301', 125495, 127930, 2],
  ['Timber Creek', 'The Magnolia CS-3220', 126995, 129430, 2],
  ['Timber Creek', 'Keystone CS-1625', 69495, 71730, 1],
] as const;

for (const [manufacturer, name, hudBase, factoryCost, sections] of requiredSourceChecks) {
  const home = FULL_MASTER_CATALOG_HOMES.find(
    (item) => item.manufacturer === manufacturer && item.name === name,
  );
  if (
    !home ||
    home.hudBasePrice !== hudBase ||
    home.estFactoryCost !== factoryCost ||
    getMasterQuote5SectionCount(home) !== sections
  ) {
    throw new Error(
      `Master Quote 5 known-source check failed for ${manufacturer} ${name}: ${JSON.stringify(home)}`,
    );
  }
}
