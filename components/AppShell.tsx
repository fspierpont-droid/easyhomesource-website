'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteLogo } from '@/components/SiteLogo';
import { SocialLinks } from '@/components/SocialLinks';
import { ChatWidget } from '@/components/ChatWidget';
import { navLinks, siteInfo } from '@/data/site';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal =
    pathname?.startsWith('/portal') ||
    pathname?.startsWith('/packages') ||
    pathname?.startsWith('/property-packages');

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <footer className="bg-gradient-to-br from-ehsNavy via-ehsDeepBlue to-ehsBlack px-4 py-14 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.25fr_0.75fr_0.8fr]">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-md leading-7 text-white/78">
              Your trusted partner for affordable manufactured homes, delivery and setup, financing options, and a clearer path to homeownership.
            </p>
            <address className="mt-5 not-italic leading-7 text-white/70">
              Serving Brooksville and Central Florida from<br />
              {siteInfo.address}
            </address>
            <p className="mt-3 font-bold text-white/85">
              Phone:{' '}
              <a className="hover:text-ehsLightBlue" href={`tel:${siteInfo.phoneHref}`}>
                {siteInfo.phoneDisplay}
              </a>
            </p>
            <p className="mt-1 font-bold text-white/85">
              Email:{' '}
              <a className="hover:text-ehsLightBlue" href={`mailto:${siteInfo.email}`}>
                {siteInfo.email}
              </a>
            </p>
            <div className="mt-5">
              <SocialLinks inverse />
            </div>
          </div>
          <div>
            <p className="font-black text-ehsLightBlue">Quick links</p>
            <div className="mt-4 grid gap-2">
              {navLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-xl px-1 py-1 text-white/75 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-black text-ehsLightBlue">Helpful info</p>
            <div className="mt-4 grid gap-2">
              <Link
                href="/privacy"
                className="rounded-xl px-1 py-1 text-white/75 hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="rounded-xl px-1 py-1 text-white/75 hover:text-white"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                className="mt-3 inline-flex justify-center rounded-full bg-white px-5 py-3 font-black text-ehsDeepBlue shadow-lg shadow-black/20 hover:bg-ehsSoftBlue"
                href="/get-quote"
              >
                Get a Quote
              </Link>
              <Link
                className="inline-flex justify-center rounded-full border border-white/25 px-5 py-3 font-black text-white hover:bg-white/10"
                href="/financing"
              >
                Financing Options
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-sm leading-6 text-white/60">
          {siteInfo.pricingDisclaimer}
        </p>
      </footer>
      <ChatWidget />
    </>
  );
}
