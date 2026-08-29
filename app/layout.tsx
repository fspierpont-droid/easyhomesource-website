import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AuthProvider } from "@/lib/auth/AuthContext";
import {
  bingSiteVerification,
  googleSiteVerification,
  isPublicSiteIndexable,
  publicSiteUrl,
} from "@/lib/seo/siteIdentity";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: { default: "Easy HomeSource | Manufactured Homes in Brooksville & Central FL", template: "%s | Easy HomeSource" },
  description: "Shop top-quality manufactured & mobile homes in Brooksville, FL. Easy HomeSource offers transparent pricing, delivery, setup, and financing guidance.",
  openGraph: { title: "Easy HomeSource | Manufactured Homes in Brooksville & Central FL", description: "Shop top-quality manufactured & mobile homes in Brooksville, FL. Easy HomeSource offers transparent pricing, delivery, setup, and financing guidance.", url: publicSiteUrl, siteName: "Easy HomeSource", locale: "en_US", type: "website" },
  keywords: ["manufactured homes", "mobile homes for sale", "Brooksville FL", "Hernando County", "Clayton Homes", "Palm Harbor", "TRU Homes", "modular homes", "Florida manufactured housing"],
  robots: isPublicSiteIndexable
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true, nosnippet: true },
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    ...(bingSiteVerification ? { other: { "msvalidate.01": bingSiteVerification } } : {}),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-12 lg:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Easy HomeSource", telephone: "+1-352-558-8888", address: { "@type": "PostalAddress", streetAddress: "9011 McIntyre Rd", addressLocality: "Brooksville", addressRegion: "FL", postalCode: "34601", addressCountry: "US" }, url: publicSiteUrl }) }} />
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
