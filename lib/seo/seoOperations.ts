import 'server-only';

import { portalBackendUrl } from '@/lib/auth/portalCredentials';
import { getPublicCatalog } from '@/lib/catalog/catalogAuthorityServer';
import {
  bingSiteVerification,
  googleSiteVerification,
  isPublicSiteIndexable,
  publicSiteUrl,
} from '@/lib/seo/siteIdentity';
import { PUBLIC_SITEMAP_ROUTES } from '@/lib/seo/sitemapConfig';

export type SeoOperationsStatus = {
  publicSiteUrl: string;
  mode: 'protected' | 'live' | 'warning';
  indexingEnabled: boolean;
  canonicalDomainReady: boolean;
  googleVerificationConfigured: boolean;
  bingVerificationConfigured: boolean;
  searchConsolePerformanceConnected: boolean;
  bingPerformanceConnected: boolean;
  activeHomePages: number;
  staticSitemapPages: number;
  sitemapUrls: number;
  sitemapUrl: string;
  robotsUrl: string;
  catalogAuthorityOnline: boolean;
  catalogOverrideCount: number | null;
  productSchemaEnabled: boolean;
  breadcrumbSchemaEnabled: boolean;
  localBusinessSchemaEnabled: boolean;
};

async function checkCatalogAuthority() {
  try {
    const response = await fetch(`${portalBackendUrl()}/api/catalog-overrides/public`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return { online: false, count: null };
    const payload = await response.json();
    if (!Array.isArray(payload)) return { online: false, count: null };
    return { online: true, count: payload.length };
  } catch {
    return { online: false, count: null };
  }
}

export async function getSeoOperationsStatus(): Promise<SeoOperationsStatus> {
  const [catalog, catalogAuthority] = await Promise.all([
    getPublicCatalog(),
    checkCatalogAuthority(),
  ]);

  const activeHomePages = catalog.filter((home) => home.isActive !== false).length;
  const canonicalDomainReady = /^https:\/\/(www\.)?easyhomesource\.com$/i.test(publicSiteUrl);
  const mode: SeoOperationsStatus['mode'] = !isPublicSiteIndexable
    ? 'protected'
    : canonicalDomainReady
      ? 'live'
      : 'warning';

  return {
    publicSiteUrl,
    mode,
    indexingEnabled: isPublicSiteIndexable,
    canonicalDomainReady,
    googleVerificationConfigured: Boolean(googleSiteVerification),
    bingVerificationConfigured: Boolean(bingSiteVerification),
    // Performance APIs are intentionally not marked connected until an actual data connector exists.
    searchConsolePerformanceConnected: false,
    bingPerformanceConnected: false,
    activeHomePages,
    staticSitemapPages: PUBLIC_SITEMAP_ROUTES.length,
    sitemapUrls: PUBLIC_SITEMAP_ROUTES.length + activeHomePages,
    sitemapUrl: `${publicSiteUrl}/sitemap.xml`,
    robotsUrl: `${publicSiteUrl}/robots.txt`,
    catalogAuthorityOnline: catalogAuthority.online,
    catalogOverrideCount: catalogAuthority.count,
    productSchemaEnabled: true,
    breadcrumbSchemaEnabled: true,
    localBusinessSchemaEnabled: true,
  };
}
