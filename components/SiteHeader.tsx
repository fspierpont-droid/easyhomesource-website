"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";
import { SocialLinks } from "@/components/SocialLinks";
import { navLinks, siteInfo } from "@/data/site";

const primaryLinks = [
  ["View Available Homes", "/homes"],
  ["Get a Quote", "/get-quote"],
  ["Financing Options", "/financing"]
] as const;

const secondaryLinks = navLinks.filter(([, href]) => !primaryLinks.some(([, primaryHref]) => primaryHref === href));

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMenus = () => {
    setOpen(false);
    setMoreOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ehsBlue/10 bg-white/95 shadow-sm shadow-ehsNavy/5 backdrop-blur">
        <div className="hidden bg-ehsNavy px-4 py-2 text-sm font-bold text-white lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-1">
              <span>{siteInfo.address}</span>
              <a href={`tel:${siteInfo.phoneHref}`} className="hover:text-ehsLightBlue">Call/Text {siteInfo.phoneDisplay}</a>
            </div>
            <div className="hidden shrink-0 xl:block"><SocialLinks inverse /></div>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 py-2 lg:py-3" aria-label="Main navigation">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="Easy HomeSource home" onClick={closeMenus} className="shrink-0"><SiteLogo /></Link>

            <div className="hidden items-center gap-2 whitespace-nowrap text-sm font-black text-ehsNavy lg:flex">
              <Link href="/homes" className="rounded-full px-4 py-2 transition hover:bg-ehsSoftBlue hover:text-ehsDeepBlue">Homes</Link>
              <Link href="/featured-homes" className="rounded-full px-4 py-2 transition hover:bg-ehsSoftBlue hover:text-ehsDeepBlue">Featured</Link>
              <Link href="/delivery-setup" className="rounded-full px-4 py-2 transition hover:bg-ehsSoftBlue hover:text-ehsDeepBlue">Delivery & Setup</Link>
              <div className="relative">
                <button type="button" className="rounded-full px-4 py-2 text-ehsNavy/80 transition hover:bg-ehsSoftBlue hover:text-ehsDeepBlue" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen}>More ▾</button>
                {moreOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-ehsBlue/10 bg-white p-3 shadow-xl shadow-ehsNavy/10 z-50">
                    {secondaryLinks.map(([label, href]) => <Link key={href} href={href} onClick={closeMenus} className="flex min-h-11 items-center rounded-2xl px-4 py-2.5 transition hover:bg-ehsSoftBlue hover:text-ehsDeepBlue">{label}</Link>)}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/get-quote" className="rounded-full bg-ehsBlue px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-ehsBlue/20 transition hover:bg-ehsDeepBlue hover:scale-105 active:scale-95">Get a Quote</Link>
            </div>

            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-ehsBlue/20 text-ehsNavy transition hover:bg-ehsSoftBlue lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation menu" aria-expanded={open}>
              <span className="text-xl">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </nav>

        {open && (
          <div className="border-t border-ehsBlue/10 bg-white px-4 py-6 shadow-2xl lg:hidden z-50">
            <div className="mx-auto flex max-w-lg flex-col gap-2 font-black text-ehsNavy">
              <Link href="/homes" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">Available Homes</Link>
              <Link href="/featured-homes" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">Featured Display Homes</Link>
              <Link href="/properties" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">Land &amp; Home Packages</Link>
              <Link href="/delivery-setup" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">Delivery &amp; Setup</Link>
              <Link href="/financing" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">Financing Guidance</Link>
              <Link href="/about" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">About Our Dealership</Link>
              <Link href="/contact" onClick={closeMenus} className="rounded-2xl px-4 py-3 hover:bg-ehsSoftBlue">Contact &amp; Hours</Link>
              <Link href="/get-quote" onClick={closeMenus} className="mt-2 rounded-full bg-ehsBlue px-5 py-3 text-center text-white shadow-lg shadow-ehsBlue/20">Get a Quote</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
