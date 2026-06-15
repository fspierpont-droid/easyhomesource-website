import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { LeadForm } from "@/components/LeadForm";
import { StatusBadge } from "@/components/HomeCard";
import { homes, getHomeById } from "@/data/homes";

const disclaimer = "Pricing, availability, options, freight, setup, taxes, site work, and permitting may vary. Contact Easy HomeSource for a full quote.";
const unknown = "Details being finalized";

export function generateStaticParams() {
  return homes.map((home) => ({ slug: home.id }));
}

export default function HomeDetailPage({ params }: { params: { slug: string } }) {
  const home = getHomeById(params.slug);
  if (!home) notFound();

  const specsSummary = [home.beds && `${home.beds} beds`, home.baths && `${home.baths} baths`, home.squareFeet && `${home.squareFeet.toLocaleString()} sq. ft.`].filter(Boolean).join(" • ") || unknown;

  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            {home.featured && <span className="rounded-full bg-ehsBlue px-3 py-1 text-xs font-black text-white">Featured</span>}
            <StatusBadge status={home.status} />
            <span className="rounded-full bg-ehsSoftBlue px-3 py-1 text-xs font-black text-ehsBlack">{home.size ?? unknown}</span>
          </div>
          <p className="mt-6 font-black text-ehsBlue">{home.manufacturer ?? "Manufacturer being finalized"}</p>
          <h1 className="mt-2 text-4xl font-black text-ehsBlack sm:text-5xl">{home.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-ehsBlack/75">{home.description}</p>
          <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-ehsBlack via-ehsBlack to-ehsBlue p-6 text-white shadow-xl shadow-ehsBlack/10">
            <p className="text-sm font-black uppercase tracking-wide text-white/70">{home.size ?? unknown}</p>
            <div className="mt-24 rounded-3xl bg-white/10 p-5 backdrop-blur"><p className="text-3xl font-black">{home.name}</p><p className="mt-2 text-white/75">{specsSummary}</p></div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Detail label="Starting price" value={home.price ?? "Call for current pricing"} />
            <Detail label="Beds" value={home.beds ?? unknown} />
            <Detail label="Baths" value={home.baths ?? unknown} />
            <Detail label="Sq. Ft." value={home.squareFeet ? home.squareFeet.toLocaleString() : unknown} />
            <Detail label="Size" value={home.size ?? unknown} />
          </dl>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-borderGray bg-white p-6"><h2 className="text-2xl font-black text-ehsBlack">Features</h2><ul className="mt-4 grid gap-3">{home.features.map((feature) => <li key={feature} className="font-semibold text-ehsBlack/75">✓ {feature}</li>)}</ul></div>
            <div className="rounded-3xl border border-borderGray bg-ehsSoftBlue p-6"><h2 className="text-2xl font-black text-ehsBlack">Floor plan notes</h2><p className="mt-4 leading-8 text-ehsBlack/75">Floor plan details are being finalized. Ask Easy HomeSource for the latest layout information and available options.</p></div>
          </div>
          <div className="mt-8 rounded-[2rem] bg-ehsBlue p-8 text-white">
            <h2 className="text-3xl font-black">Want the full quote for this home?</h2>
            <p className="mt-3 leading-7 text-white/75">Ask about current availability, financing guidance, delivery to your Florida site, setup, permitting, and move-in timing.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/contact">Start Quote</ButtonLink><ButtonLink href="/contact" variant="secondary">Schedule a Tour</ButtonLink></div>
          </div>
          <p className="mt-6 rounded-2xl border border-borderGray bg-white p-4 text-sm font-semibold leading-6 text-ehsBlack/70">{disclaimer}</p>
        </section>
        <aside className="lg:sticky lg:top-24 lg:self-start"><LeadForm interestedHome={home.name} cta="Request Info" /></aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-ehsSoftBlue p-4"><dt className="text-xs font-black uppercase tracking-wide text-ehsBlack/60">{label}</dt><dd className="mt-1 text-xl font-black text-ehsBlack">{value}</dd></div>;
}
