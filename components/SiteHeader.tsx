"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";
import { SocialLinks } from "@/components/SocialLinks";
import { navLinks, siteInfo } from "@/data/site";

const primaryLinks = [
  ["View Available Homes", "/homes"],
  ["Get a Quote", "/contact"],
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
      <header className="sticky top-0 z-20 border-b border-ehsBlue/10 bg-white/95 shadow-sm shadow-ehsNavy/5 backdrop-blur">
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
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-ehsBlue/10 bg-white p-3 shadow-xl shadow-ehsNavy/10">
                    {secondaryLinks.map(([label, href]) => <Link key={href} href={href} onClick={closeMenus} className="flex min-h-11 items-center rounded-2xl px-4 py-2.5 transition hover:bg-ehsSoftBlue hover:text-ehsDeepBlue">{label}</Link>)}
                    <div className="mt-2 rounded-2xl bg-ehsSoftBlue px-4 py-3"><SocialLinks /></div>
                  </div>
                )}
              </div>
              <Link className="rounded-full border border-ehsBlue/20 bg-ehsSoftBlue px-5 py-3 font-black text-ehsDeepBlue transition hover:border-ehsBlue hover:bg-white" href="/financing">Financing Options</Link>
              <Link className="rounded-full bg-ehsBlue px-5 py-3 font-black text-white shadow-lg shadow-ehsBlue/20 transition hover:bg-ehsDeepBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60" href="/contact">Get a Quote</Link>
            </div>

            <button type="button" className="rounded-full border border-ehsBlue/20 bg-white px-4 py-2 text-sm font-black text-ehsNavy shadow-sm transition hover:border-ehsBlue hover:text-ehsDeepBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60 lg:hidden" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Menu</button>
          </div>
          {open && (
            <div className="mt-3 grid gap-1.5 rounded-3xl border border-ehsBlue/10 bg-ehsSoftBlue p-2.5 text-sm font-black text-ehsNavy shadow-lg lg:hidden">
              {primaryLinks.map(([label, href]) => <Link key={href} href={href} onClick={closeMenus} className="flex min-h-11 items-center justify-center rounded-2xl bg-ehsBlue px-4 py-2.5 text-white transition hover:bg-ehsDeepBlue">{label}</Link>)}
              {secondaryLinks.map(([label, href]) => <Link key={href} href={href} onClick={closeMenus} className="flex min-h-11 items-center rounded-2xl bg-white px-4 py-2.5 transition hover:text-ehsDeepBlue">{label}</Link>)}
              <div className="rounded-2xl bg-white px-4 py-2.5"><SocialLinks /></div>
            </div>
          )}
        </nav>
      </header>
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-ehsBlue/10 bg-white text-center text-sm font-black shadow-2xl lg:hidden">
        <a className="py-2.5 text-ehsDeepBlue" href={`tel:${siteInfo.phoneHref}`}>Call</a>
        <a className="border-x border-ehsBlue/10 py-2.5 text-ehsDeepBlue" href={`sms:${siteInfo.phoneHref}`}>Text</a>
        <Link className="bg-ehsBlue py-2.5 text-white" href="/contact">Get Quote</Link>
      </div>
    </>
  );
}
