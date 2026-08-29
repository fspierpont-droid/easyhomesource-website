import 'server-only';

import { homes as baselinePublicHomes, type Home } from '@/data/homes';
import { portalBackendUrl } from '@/lib/auth/portalCredentials';
import { applyPublicCatalogOverrides, type CatalogOverride } from '@/lib/catalog/catalogAuthority';

const CATALOG_REVALIDATE_SECONDS = 60;

async function fetchPublicOverrides(): Promise<CatalogOverride[]> {
  const response = await fetch(`${portalBackendUrl()}/api/catalog-overrides/public`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`Catalog override API returned ${response.status}.`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Catalog override API returned invalid data.');
  }
  return payload as CatalogOverride[];
}

export async function getPublicCatalog(): Promise<Home[]> {
  try {
    const overrides = await fetchPublicOverrides();
    return applyPublicCatalogOverrides(baselinePublicHomes, overrides);
  } catch (error) {
    console.warn('Using verified static public catalog because runtime overrides are unavailable.', error);
    return baselinePublicHomes;
  }
}

export async function getPublicCatalogHome(slug: string): Promise<Home | null> {
  const catalog = await getPublicCatalog();
  return catalog.find((home) => home.slug === slug) || null;
}
