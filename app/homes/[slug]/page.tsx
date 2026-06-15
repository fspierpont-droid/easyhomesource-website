import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { LeadForm } from "@/components/LeadForm";
import { StatusBadge } from "@/components/HomeCard";
import { homes, getHomeBySlug } from "@/data/homes";

const disclaimer = "Pricing, availability, options, freight, setup, taxes, site work, and permitting may vary. Contact Easy HomeSource for a full quote.";

export function generateStaticParams() {
  return homes.map((home) => ({ slug: home.slug }));
}

export default function HomeDetailPage({ params }: { params: { slug: string } }) {
  const home = getHomeBySlug(params.slug);
  if (!home) notFound();

  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            {home.featured && <span className="rounded-full bg-clay px-3 py-1 text-xs font-black text-white">Featured</span>}
            <StatusBadge status={home.status} />
            <span className="rounded-full bg-sand px-3 py-1 text-xs font-black text-forest">{home.series}</span>
          </div>
          <p className="mt-6 font-black text-clay">{home.manufacturer}</p>
          <h1 className="mt-2 text-4xl font-black text-forest sm:text-5xl">{home.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-forest/75">{home.description}</p>
          <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-forest via-forest to-clay p-6 text-white shadow-xl shadow-forest/10">
            <p className="text-sm font-black uppercase tracking-wide text-white/70">{home.visualDescription}</p>
            <div className="mt-24 rounded-3xl bg-white/10 p-5 backdrop-blur"><p className="text-3xl font-black">{home.name}</p><p className="mt-2 text-white/75">{home.beds} beds • {home.baths} baths • {home.squareFootage.toLocaleString()} sq. ft.</p></div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Detail label="Starting price" value={home.price} />
            <Detail label="Beds" value={home.beds} />
            <Detail label="Baths" value={home.baths} />
            <Detail label="Sq. Ft." value={home.squareFootage.toLocaleString()} />
            <Detail label="Size" value={home.size} />
          </dl>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-forest/10 bg-white p-6"><h2 className="text-2xl font-black text-forest">Features</h2><ul className="mt-4 grid gap-3">{home.features.map((feature) => <li key={feature} className="font-semibold text-forest/75">✓ {feature}</li>)}</ul></div>
            <div className="rounded-3xl border border-forest/10 bg-sand p-6"><h2 className="text-2xl font-black text-forest">Floor plan notes</h2><p className="mt-4 leading-8 text-forest/75">{home.floorplanDescription}</p></div>
          </div>
          <div className="mt-8 rounded-[2rem] bg-forest p-8 text-white">
            <h2 className="text-3xl font-black">Want the full quote for this home?</h2>
            <p className="mt-3 leading-7 text-white/75">Ask about current availability, financing guidance, delivery to your Florida site, setup, permitting, and move-in timing.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/contact">Start Quote</ButtonLink><ButtonLink href="/contact" variant="secondary">Schedule a Tour</ButtonLink></div>
          </div>
          <p className="mt-6 rounded-2xl border border-forest/10 bg-white p-4 text-sm font-semibold leading-6 text-forest/70">{disclaimer}</p>
        </section>
        <aside className="lg:sticky lg:top-24 lg:self-start"><LeadForm interestedHome={home.name} cta="Request Info" /></aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-sand p-4"><dt className="text-xs font-black uppercase tracking-wide text-forest/60">{label}</dt><dd className="mt-1 text-xl font-black text-forest">{value}</dd></div>;
}
