import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteLogo } from "@/components/SiteLogo";
import { SocialLinks } from "@/components/SocialLinks";
import { navLinks, siteInfo } from "@/data/site";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://easyhomesource.com"),
  title: { default: "Easy HomeSource | Manufactured Homes in Brooksville, FL", template: "%s | Easy HomeSource" },
  description: "Shop affordable manufactured homes in Brooksville, Florida with pricing guidance, financing options, delivery and setup, permitting, and move-in support.",
  openGraph: { title: "Easy HomeSource | Manufactured Homes in Brooksville, FL", description: "Affordable Florida manufactured homes with clear support from shopping through delivery and setup.", url: "https://easyhomesource.com", siteName: "Easy HomeSource", locale: "en_US", type: "website" }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-12 lg:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Easy HomeSource", telephone: "+1-352-558-8888", address: { "@type": "PostalAddress", streetAddress: "9011 McIntyre Rd", addressLocality: "Brooksville", addressRegion: "FL", postalCode: "34601", addressCountry: "US" }, url: "https://easyhomesource.com" }) }} />
        <SiteHeader />
        {children}
        <footer className="bg-gradient-to-br from-ehsNavy via-ehsDeepBlue to-ehsBlack px-4 py-14 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.25fr_0.75fr_0.8fr]">
            <div>
              <SiteLogo />
              <p className="mt-4 max-w-md leading-7 text-white/78">Your trusted partner for affordable manufactured homes, delivery and setup, financing options, and a clearer path to homeownership.</p>
              <address className="mt-5 not-italic leading-7 text-white/70">Serving Brooksville and Central Florida from<br />{siteInfo.address}</address>
              <p className="mt-3 font-bold text-white/85">Phone: <a className="hover:text-ehsLightBlue" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a></p>
              <p className="mt-1 font-bold text-white/85">Email: <a className="hover:text-ehsLightBlue" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a></p>
              <div className="mt-5"><SocialLinks inverse /></div>
            </div>
            <div>
              <p className="font-black text-ehsLightBlue">Quick links</p>
              <div className="mt-4 grid gap-2">{navLinks.map(([label, href]) => <Link key={href} href={href} className="rounded-xl px-1 py-1 text-white/75 hover:text-white">{label}</Link>)}</div>
            </div>
            <div>
              <p className="font-black text-ehsLightBlue">Helpful info</p>
              <div className="mt-4 grid gap-2">
                <Link href="/privacy" className="rounded-xl px-1 py-1 text-white/75 hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="rounded-xl px-1 py-1 text-white/75 hover:text-white">Terms &amp; Conditions</Link>
                <Link className="mt-3 inline-flex justify-center rounded-full bg-white px-5 py-3 font-black text-ehsDeepBlue shadow-lg shadow-black/20 hover:bg-ehsSoftBlue" href="/get-quote">Get a Quote</Link>
                <Link className="inline-flex justify-center rounded-full border border-white/25 px-5 py-3 font-black text-white hover:bg-white/10" href="/financing">Financing Options</Link>
              </div>
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-sm leading-6 text-white/60">{siteInfo.pricingDisclaimer}</p>
        </footer>
      </body>
    </html>
  );
}
