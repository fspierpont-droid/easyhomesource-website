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
  description: "Shop affordable manufactured homes in Brooksville, Florida with pricing guidance, financing options, delivery, setup, permitting, and move-in support.",
  openGraph: { title: "Easy HomeSource | Manufactured Homes in Brooksville, FL", description: "Affordable Florida manufactured homes with clear support from shopping through delivery and setup.", url: "https://easyhomesource.com", siteName: "Easy HomeSource", locale: "en_US", type: "website" }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className="pb-12 lg:pb-0"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "Easy HomeSource", telephone: "+1-352-558-8888", address: { "@type": "PostalAddress", streetAddress: "9011 McIntyre Rd", addressLocality: "Brooksville", addressRegion: "FL", postalCode: "34601", addressCountry: "US" }, url: "https://easyhomesource.com" }) }} /><SiteHeader />{children}<footer className="bg-ehsBlack px-4 py-12 text-white"><div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]"><div><SiteLogo /><p className="mt-3 max-w-md leading-7 text-white/75">Manufactured home dealership in Brooksville, Florida, serving buyers across Florida with home shopping, financing guidance, delivery, setup, and move-in support.</p><address className="mt-4 not-italic text-white/75">{siteInfo.address}</address><p className="mt-2 font-bold text-white/80">Phone: <a className="hover:text-white" href={`tel:${siteInfo.phoneHref}`}>{siteInfo.phoneDisplay}</a></p><p className="mt-2 font-bold text-white/80">Email: <a className="hover:text-white" href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a></p><div className="mt-4"><SocialLinks inverse /></div></div><div><p className="font-black">Quick links</p><div className="mt-3 grid gap-2">{navLinks.map(([label, href]) => <Link key={href} href={href} className="text-white/75 hover:text-white">{label}</Link>)}</div></div><div><p className="font-black">Helpful info</p><div className="mt-3 grid gap-2"><Link href="/privacy" className="text-white/75 hover:text-white">Privacy Policy</Link><Link href="/terms" className="text-white/75 hover:text-white">Terms &amp; Conditions</Link><Link className="mt-2 inline-flex rounded-full bg-ehsBlue px-5 py-3 font-black text-white hover:bg-ehsBlue/90" href="/contact">Get Pricing</Link></div></div></div><p className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-6 text-sm leading-6 text-white/60">{siteInfo.pricingDisclaimer}</p></footer></body></html>;
}