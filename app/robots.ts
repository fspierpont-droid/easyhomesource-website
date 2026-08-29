import type { MetadataRoute } from "next";
import { isPublicSiteIndexable, publicSiteUrl } from "@/lib/seo/siteIdentity";

export default function robots(): MetadataRoute.Robots {
  if (!isPublicSiteIndexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${publicSiteUrl}/sitemap.xml`,
  };
}
