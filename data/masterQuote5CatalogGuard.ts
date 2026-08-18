import {
  FULL_MASTER_CATALOG_HOMES as SOURCE_HOMES,
  getEffectiveMasterCatalog as getSourceEffectiveMasterCatalog,
  saveStoredCatalogOverrides,
  clearStoredCatalogOverrides,
  type MasterCatalogHome as SourceMasterCatalogHome,
} from './fullMasterCatalog.generated';

export type MasterCatalogHome = SourceMasterCatalogHome & { floors?: number };
export { saveStoredCatalogOverrides, clearStoredCatalogOverrides };

const EXCLUDED_MANUFACTURERS = new Set([
  'Skyline Ocala',
  'Champion Lake City',
  'Clayton Russellville',
]);

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sectionCount(home: Pick<SourceMasterCatalogHome, 'width'>) {
  const width = Number(home.width) || 14;
  if (width <= 18) return 1;
  if (width <= 36) return 2;
  return 3;
}

function deriveMasterQuote5Home(home: SourceMasterCatalogHome): MasterCatalogHome {
  const hudBase = Number(home.hudBasePrice) || 0;
  if (hudBase <= 0) return { ...home, floors: sectionCount(home) };

  const floors = sectionCount(home);
  const factoryCost = roundMoney(hudBase + 2000 + 200 * floors + 35);
  const markupFactor = Math.max(
    27368 / factoryCost,
    85 * Math.pow(factoryCost, -0.454),
  );
  const ehsPrice = roundMoney(factoryCost * (markupFactor + 1));
  const msrp = roundMoney(ehsPrice * 1.15);

  return {
    ...home,
    floors,
    estFactoryCost: factoryCost,
    ehsPrice,
    startingPrice: ehsPrice,
    msrp,
  };
}

function reconcile(homes: SourceMasterCatalogHome[]) {
  return homes
    .filter((home) => !EXCLUDED_MANUFACTURERS.has(home.manufacturer))
    .map(deriveMasterQuote5Home);
}

export const FULL_MASTER_CATALOG_HOMES: MasterCatalogHome[] = reconcile(SOURCE_HOMES);

export function getEffectiveMasterCatalog(): MasterCatalogHome[] {
  return reconcile(getSourceEffectiveMasterCatalog());
}

if (FULL_MASTER_CATALOG_HOMES.length !== 225) {
  throw new Error(`Master Quote 5 catalog guard expected 225 approved homes, found ${FULL_MASTER_CATALOG_HOMES.length}.`);
}

const atmos = FULL_MASTER_CATALOG_HOMES.find(
  (home) => home.manufacturer === 'CAVCO Plant City' && home.name === 'Atmos 28603N',
);
if (!atmos || atmos.hudBasePrice !== 108565 || atmos.estFactoryCost !== 111000) {
  throw new Error(`Master Quote 5 known-source check failed for Atmos 28603N: ${JSON.stringify(atmos)}`);
}
