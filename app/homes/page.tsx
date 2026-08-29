import { HomesBrowser } from "@/components/HomesBrowser";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { formatHomePrice } from "@/data/homes";
import { getPublicCatalog } from "@/lib/catalog/catalogAuthorityServer";

export default async function HomesPage() {
  const homes = await getPublicCatalog();
  const tulip = homes.find((home) => home.slug === "tulip");

  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl bg-ehsSoftBlue p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">Homes catalog</p>
          <h1 className="mt-1.5 text-2xl sm:text-4xl font-black text-ehsBlack">
            Shop manufactured homes by price, size, beds, baths, and availability.
          </h1>
          <p className="mt-2.5 max-w-4xl text-sm sm:text-base leading-relaxed text-ehsBlack/75">
            Browse Easy HomeSource homes in Brooksville, compare starting prices and floor plans, then request current pricing, financing guidance, delivery and setup, permits, and final quote details.
          </p>
          <div className="mt-4 grid gap-2.5 text-xs sm:text-sm font-bold text-ehsBlack sm:grid-cols-3">
            <div className="rounded-xl bg-white p-3 shadow-xs">Filter by budget and size</div>
            <div className="rounded-xl bg-white p-3 shadow-xs">Find on-display homes</div>
            <div className="rounded-xl bg-white p-3 shadow-xs">Request pricing when ready</div>
          </div>
        </section>

        {tulip && (
          <Link
            href="/homes/tulip"
            className="mt-5 block rounded-2xl border border-ehsBlue/30 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">Featured special price</p>
                <h2 className="mt-0.5 text-xl sm:text-2xl font-black text-ehsBlack">
                  Tulip is the {formatHomePrice(tulip)} home
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-ehsBlack/70">
                  2 beds • 1 bath • 544 sq. ft. Request final Easy HomeSource quote details for delivery and setup, taxes, fees, permits, site conditions, and financing guidance.
                </p>
              </div>
              <span className="inline-flex shrink-0 justify-center rounded-full bg-ehsBlue px-5 py-2.5 text-xs font-black text-white hover:bg-ehsDeepBlue transition-colors">
                View Tulip Details
              </span>
            </div>
          </Link>
        )}

        <HomesBrowser homes={homes} />
        <div className="mt-10"><LeadForm cta="Start Quote" /></div>
      </div>
    </main>
  );
}
