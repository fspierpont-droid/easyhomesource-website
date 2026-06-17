import { HomesBrowser } from "@/components/HomesBrowser";
import { LeadForm } from "@/components/LeadForm";
import { homes } from "@/data/homes";

export default function HomesPage() {
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
        <HomesBrowser homes={homes} />
        <div className="mt-12"><LeadForm cta="Start Quote" /></div>
      </div>
    </main>
  );
}
