"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";

const nav = [
  ["Homes", "/homes"],
  ["Financing", "/financing"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-borderGray bg-white/95 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 py-3" aria-label="Main navigation">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Easy HomeSource home" onClick={() => setOpen(false)} className="shrink-0">
            <SiteLogo />
          </Link>
          <div className="hidden items-center gap-7 whitespace-nowrap text-sm font-bold text-ehsBlack md:flex">
            {nav.map(([label, href]) => <Link key={href} href={href} className="transition hover:text-ehsBlue">{label}</Link>)}
            <a className="rounded-full bg-ehsBlue px-5 py-3 font-black text-white shadow-sm transition hover:bg-ehsMediumBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60" href="tel:+13525588888">Call 352-558-8888</a>
          </div>
          <button
            type="button"
            className="rounded-full border border-borderGray bg-white px-4 py-2 text-sm font-black text-ehsBlack shadow-sm transition hover:border-ehsBlue hover:text-ehsBlue focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60 md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
        {open && (
          <div className="mt-4 grid gap-2 rounded-3xl border border-borderGray bg-ehsSoftBlue p-3 text-sm font-black text-ehsBlack shadow-lg md:hidden">
            {nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-3 transition hover:text-ehsBlue">{label}</Link>)}
            <a onClick={() => setOpen(false)} className="rounded-2xl bg-ehsBlue px-4 py-3 text-center text-white transition hover:bg-ehsMediumBlue" href="tel:+13525588888">Call 352-558-8888</a>
          </div>
        )}
      </nav>
    </header>
  );
}
