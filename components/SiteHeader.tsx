"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";
import { SocialLinks } from "@/components/SocialLinks";
import { navLinks, siteInfo } from "@/data/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-borderGray bg-white/95 backdrop-blur">
        <div className="hidden bg-ehsBlack px-4 py-2 text-sm font-bold text-white lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-1">
              <span>{siteInfo.address}</span>
              <a href={`tel:${siteInfo.phoneHref}`} className="hover:text-ehsLightBlue">Call/Text {siteInfo.phoneDisplay}</a>
            </div>
            <div className="hidden shrink-0 xl:block"><SocialLinks inverse /></div>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 py-3" aria-label="Main navigation">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="Easy HomeSource home" onClick={() => setOpen(false)} className="shrink-0"><SiteLogo /></Link>
            <div className="hidden items-center gap-3 whitespace-nowrap text-[13px] font-bold text-ehsBlack xl:flex 2xl:gap-4 2xl:text-sm">
              {navLinks.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-ehsBlue">{label}</Link>)}
              <Link className="rounded-full bg-ehsBlue px-5 py-3 font-black text-white shadow-sm transition hover:bg-ehsMediumBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60" href="/contact">Get Pricing</Link>
            </div>
            <button type="button" className="rounded-full border border-borderGray bg-white px-4 py-2 text-sm font-black text-ehsBlack shadow-sm transition hover:border-ehsBlue hover:text-ehsBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60 xl:hidden" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Menu</button>
          </div>
          {open && (
            <div className="mt-4 grid gap-2 rounded-3xl border border-borderGray bg-ehsSoftBlue p-3 text-sm font-black text-ehsBlack shadow-lg xl:hidden">
              {navLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-3 transition hover:text-ehsBlue">{label}</Link>)}
              <div className="rounded-2xl bg-white px-4 py-3"><SocialLinks /></div>
              <Link onClick={() => setOpen(false)} className="rounded-2xl bg-ehsBlue px-4 py-3 text-center text-white transition hover:bg-ehsMediumBlue" href="/contact">Get Pricing</Link>
            </div>
          )}
        </nav>
      </header>
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-borderGray bg-white text-center text-sm font-black shadow-2xl lg:hidden">
        <a className="py-3 text-ehsBlue" href={`tel:${siteInfo.phoneHref}`}>Call</a>
        <a className="border-x border-borderGray py-3 text-ehsBlue" href={`sms:${siteInfo.phoneHref}`}>Text</a>
        <Link className="bg-ehsBlue py-3 text-white" href="/contact">Get Pricing</Link>
      </div>
    </>
  );
}
