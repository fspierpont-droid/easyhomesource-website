import type { Metadata } from "next";
import { HomesBrowser } from "@/components/HomesBrowser";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { getPublicCatalog } from "@/lib/catalog/catalogAuthorityServer";

export const metadata: Metadata = {
  title: "Manufactured Homes for Sale in Brooksville, FL",
  description: "Browse Easy HomeSource manufactured homes in Brooksville, Florida by price, size, bedrooms, baths, manufacturer, and display availability.",
  alternates: { canonical: "/homes" },
  openGraph: {
    title: "Manufactured Homes for Sale in Brooksville, FL | Easy HomeSource",
    description: "Browse manufactured homes, floor plans, current starting prices, and on-display models from Easy HomeSource in Brooksville, Florida.",
    url: "/homes",
    type: "website",
  },
};

export default async function HomesPage() {
  const homes = await getPublicCatalog();
  const tulip = homes.find((home) => home.slug === "tulip");

  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl bg-ehsSoftBlue p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">Homes catalog</p>
          <h1 className="mt-1.5 text-2xl sm:text-4xl font-black text-ehsBlack">
            Shop manufactured homes by size, beds, baths, and availability.
          </h1>
          <p className="mt-2.5 max-w-4xl text-sm sm:text-base leading-relaxed text-ehsBlack/75">
            Browse Easy HomeSource homes in Brooksville, compare floor plans, then request current pricing, financing guidance, delivery and setup, permits, and final quote details.
          </p>
          <div className="mt-4 grid gap-2.5 text-xs sm:text-sm font-bold text-ehsBlack sm:grid-cols-3">
            <div className="rounded-xl bg-white p-3 shadow-xs">Filter by budget and size</div>
            <div className="rounded-xl bg-white p-3 shadow-xs">Find on-display homes</div>
            <div className="rounded-xl bg-white p-3 shadow-xs">Request pricing when ready</div>
          </div>
        </section>

        <HomesBrowser homes={homes} />
        <div className="mt-10"><LeadForm cta="Start Quote" /></div>
      </div>
    </main>
  );
}
