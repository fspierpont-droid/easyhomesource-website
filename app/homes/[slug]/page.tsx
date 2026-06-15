import { notFound } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { homes, getHomeBySlug } from "@/data/homes";

export function generateStaticParams() {
  return homes.map((home) => ({ slug: home.slug }));
}

export default function HomeDetailPage({ params }: { params: { slug: string } }) {
  const home = getHomeBySlug(params.slug);
  if (!home) notFound();

  return (
    <main className="px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.8fr]">
        <section>
          <p className="font-bold text-clay">{home.manufacturer}</p>
          <h1 className="mt-2 text-4xl font-black text-forest">{home.name}</h1>
          <p className="mt-3 text-3xl font-black text-forest">{home.price}</p>
          <div className="mt-6 flex h-72 items-center justify-center rounded-3xl bg-gradient-to-br from-sand to-forest/10 p-8 text-center font-bold text-forest/70">{home.imagePlaceholder}</div>
          <p className="mt-6 text-lg leading-8 text-forest/75">{home.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[['Beds', home.beds], ['Baths', home.baths], ['Sq. Ft.', home.squareFootage.toLocaleString()], ['Size', home.size]].map(([label, value]) => <div key={label} className="rounded-2xl bg-sand p-4"><dt className="font-bold text-forest">{label}</dt><dd className="text-forest/75">{value}</dd></div>)}
          </dl>
          <div className="mt-8 rounded-3xl border border-forest/10 bg-white p-6"><h2 className="text-2xl font-black text-forest">Features</h2><ul className="mt-4 grid gap-2 sm:grid-cols-2">{home.features.map((feature) => <li key={feature} className="text-forest/75">✓ {feature}</li>)}</ul></div>
          <div className="mt-8 flex h-64 items-center justify-center rounded-3xl border border-dashed border-forest/20 bg-white p-8 text-center font-bold text-forest/60">{home.floorplanPlaceholder}</div>
        </section>
        <aside><LeadForm interestedHome={home.name} /></aside>
      </div>
    </main>
  );
}
