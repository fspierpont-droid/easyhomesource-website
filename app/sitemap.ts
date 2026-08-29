import type { MetadataRoute } from "next";
import { getPublicCatalog } from "@/lib/catalog/catalogAuthorityServer";
import { publicSiteUrl } from "@/lib/seo/siteIdentity";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/homes",
    "/featured-homes",
    "/special-offers",
    "/properties",
    "/packages",
    "/financing",
    "/delivery-setup",
    "/how-it-works",
    "/videos",
    "/about",
    "/contact",
    "/get-quote",
    "/privacy-policy",
    "/terms",
  ];

  const homes = (await getPublicCatalog()).filter((home) => home.isActive !== false);

  return [
    ...routes.map((route) => ({ url: `${publicSiteUrl}${route}` })),
    ...homes.map((home) => ({ url: `${publicSiteUrl}/homes/${home.slug}` })),
  ];
}
