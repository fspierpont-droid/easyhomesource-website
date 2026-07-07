import { HomesBrowser } from "@/components/HomesBrowser";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { formatHomePrice, getHomeBySlug } from "@/data/homes";
import { homes } from "@/data/homes";

export default function HomesPage() {
  const tulip = getHomeBySlug("tulip");
  return (
    <main className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] bg-ehsSoftBlue p-6 sm:p-10">
          <p className="font-black uppercase tracking-wide text-ehsBlue">Homes catalog</p>
          <h1 className="mt-2 text-4xl font-black text-ehsBlack sm:text-5xl">Shop manufactured homes by price, size, beds, baths, and availability.</h1>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-ehsBlack/75">Browse Easy HomeSource homes in Brooksville, compare starting prices and floor plans, then request current pricing, financing guidance, delivery, setup, permits, and final quote details.</p>
          <div className="mt-6 grid gap-3 text-sm font-black text-ehsBlack sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">Filter by budget and size</div>
            <div className="rounded-2xl bg-white p-4">Find on-display homes</div>
            <div className="rounded-2xl bg-white p-4">Request pricing when ready</div>
          </div>
        </section>
        {tulip && (
          <Link href="/homes/tulip" className="mt-6 block rounded-[2rem] border-2 border-ehsBlue bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-ehsBlue">Featured special price</p>
                <h2 className="mt-1 text-3xl font-black text-ehsBlack">Tulip is the {formatHomePrice(tulip)} home</h2>
                <p className="mt-2 font-semibold leading-7 text-ehsBlack/70">2 beds • 1 bath • 544 sq. ft. Request final Easy HomeSource quote details for delivery, setup, taxes, fees, permits, site conditions, and financing guidance.</p>
              </div>
              <span className="inline-flex justify-center rounded-full bg-ehsBlue px-6 py-3 text-sm font-black text-white">View Tulip Details</span>
            </div>
          </Link>
        )}
        <HomesBrowser homes={homes} />
        <div className="mt-12"><LeadForm cta="Start Quote" /></div>
      </div>
    </main>
  );
}
