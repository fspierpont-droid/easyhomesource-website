import type { MetadataRoute } from "next";
import { homes } from "@/data/homes";
import { publicSiteUrl } from "@/lib/seo/siteIdentity";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/homes",
    "/properties",
    "/featured-homes",
    "/special-offers",
    "/financing",
    "/delivery-setup",
    "/how-it-works",
    "/get-quote",
    "/videos",
    "/privacy-policy",
    "/terms"
  ];

  return [
    ...routes.map((route) => ({ url: `${publicSiteUrl}${route}`, lastModified: new Date() })),
    ...homes.map((home) => ({ url: `${publicSiteUrl}/homes/${home.slug}`, lastModified: new Date() }))
  ];
}
