import type { MetadataRoute } from 'next';
import { getPublicCatalog } from '@/lib/catalog/catalogAuthorityServer';
import { PUBLIC_SITEMAP_ROUTES } from '@/lib/seo/sitemapConfig';
import { publicSiteUrl } from '@/lib/seo/siteIdentity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homes = (await getPublicCatalog()).filter((home) => home.isActive !== false);

  return [
    ...PUBLIC_SITEMAP_ROUTES.map((route) => ({ url: `${publicSiteUrl}${route}` })),
    ...homes.map((home) => ({ url: `${publicSiteUrl}/homes/${home.slug}` })),
  ];
}
