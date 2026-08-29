import type { Home } from '@/data/homes';
import type { MasterCatalogHome } from '@/data/fullMasterCatalog.generated';

export type CatalogOverride = {
  catalog_key: string;
  quote_slug?: string | null;
  public_slug?: string | null;
  name?: string | null;
  manufacturer?: string | null;
  quote_enabled?: boolean | null;
  public_enabled?: boolean | null;
  public_status?: Home['status'] | null;
  is_on_display?: boolean | null;
  hud_base_price?: number | null;
  est_factory_cost?: number | null;
  msrp?: number | null;
  ehs_price?: number | null;
  starting_price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  square_feet?: number | null;
  width?: number | null;
  length?: number | null;
  dimensions?: string | null;
  note?: string | null;
  updated_at?: string | null;
};

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function present<T>(value: T | null | undefined, fallback: T): T {
  return value == null ? fallback : value;
}

export function applyMasterCatalogOverrides(
  baseline: MasterCatalogHome[],
  overrides: CatalogOverride[],
): MasterCatalogHome[] {
  const bySlug = new Map(
    overrides
      .filter((override) => override.quote_slug)
      .map((override) => [override.quote_slug as string, override]),
  );

  return baseline.flatMap((home) => {
    const override = bySlug.get(home.slug);
    if (!override) return [home];
    if (override.quote_enabled === false) return [];

    return [{
      ...home,
      name: override.name?.trim() || home.name,
      manufacturer: override.manufacturer?.trim() || home.manufacturer,
      hudBasePrice: finite(override.hud_base_price) ? override.hud_base_price : home.hudBasePrice,
      estFactoryCost: finite(override.est_factory_cost) ? override.est_factory_cost : home.estFactoryCost,
      msrp: finite(override.msrp) ? override.msrp : home.msrp,
      ehsPrice: finite(override.ehs_price) ? override.ehs_price : home.ehsPrice,
      startingPrice: finite(override.starting_price)
        ? override.starting_price
        : finite(override.ehs_price)
          ? override.ehs_price
          : home.startingPrice,
      bedrooms: finite(override.bedrooms) ? override.bedrooms : home.bedrooms,
      bathrooms: finite(override.bathrooms) ? override.bathrooms : home.bathrooms,
      squareFeet: finite(override.square_feet) ? override.square_feet : home.squareFeet,
      width: finite(override.width) ? override.width : home.width,
      length: finite(override.length) ? override.length : home.length,
      dimensions: override.dimensions?.trim() || home.dimensions,
    }];
  });
}

export function applyPublicCatalogOverrides(
  baseline: Home[],
  overrides: CatalogOverride[],
): Home[] {
  const bySlug = new Map(
    overrides
      .filter((override) => override.public_slug)
      .map((override) => [override.public_slug as string, override]),
  );

  return baseline.flatMap((home) => {
    const override = bySlug.get(home.slug);
    if (!override) return [home];
    if (override.public_enabled === false) return [];

    const width = finite(override.width) ? override.width : home.width;
    const length = finite(override.length) ? override.length : home.length;
    const dimensions = override.dimensions?.trim();
    const nextStartingPrice = finite(override.starting_price)
      ? override.starting_price
      : finite(override.ehs_price)
        ? override.ehs_price
        : home.startingPrice;

    return [{
      ...home,
      name: override.name?.trim() || home.name,
      manufacturer: override.manufacturer?.trim() || home.manufacturer,
      status: present(override.public_status, home.status),
      isActive: override.public_enabled ?? home.isActive,
      isOnDisplay: override.is_on_display ?? home.isOnDisplay,
      startingPrice: nextStartingPrice,
      bedrooms: finite(override.bedrooms) ? override.bedrooms : home.bedrooms,
      bathrooms: finite(override.bathrooms) ? override.bathrooms : home.bathrooms,
      squareFeet: finite(override.square_feet) ? override.square_feet : home.squareFeet,
      width,
      length,
      size: dimensions || home.size || (width && length ? `${width}' x ${length}'` : home.size),
      note: override.note?.trim() || home.note,
    }];
  });
}

function normalized(value: string | null | undefined) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizedManufacturer(value: string | null | undefined) {
  return normalized(value)
    .replace(/^cavco/, 'cavco')
    .replace(/^clayton/, 'clayton');
}

export function findPublicCatalogMatch(
  quoteHome: MasterCatalogHome,
  publicHomes: Home[],
): Home | null {
  const quoteMaker = normalizedManufacturer(quoteHome.manufacturer);
  const quoteName = normalized(quoteHome.name);

  const exact = publicHomes.find((home) => {
    if (normalizedManufacturer(home.manufacturer) !== quoteMaker) return false;
    return normalized(home.modelNumber) === quoteName || normalized(home.name) === quoteName;
  });
  if (exact) return exact;

  const sameModel = publicHomes.find((home) =>
    normalized(home.modelNumber) === quoteName || normalized(home.name) === quoteName,
  );
  return sameModel || null;
}

export function catalogOverrideKey(quoteSlug?: string | null, publicSlug?: string | null) {
  const source = quoteSlug?.trim() || publicSlug?.trim();
  if (!source) throw new Error('A quote or public catalog slug is required.');
  return `${quoteSlug ? 'quote' : 'public'}:${source}`;
}
