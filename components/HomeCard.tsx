import Link from "next/link";
import type { Home, HomeStatus } from "@/data/homes";

const statusStyles: Record<HomeStatus, string> = {
  Available: "bg-green-100 text-green-800 ring-green-700/10",
  "Coming Soon": "bg-amber-100 text-amber-900 ring-amber-700/10",
  Sold: "bg-stone-200 text-stone-700 ring-stone-700/10"
};

export function StatusBadge({ status }: { status: HomeStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusStyles[status]}`}>{status}</span>;
}

export function HomeCard({ home }: { home: Home }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-forest/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative min-h-52 bg-gradient-to-br from-forest via-forest to-clay p-5 text-white">
        <div className="absolute inset-x-5 bottom-5 rounded-3xl bg-white/15 p-5 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-wide text-white/75">{home.series}</p>
          <p className="mt-1 text-xl font-black">{home.visualDescription}</p>
        </div>
        {home.featured && <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1 text-xs font-black text-clay">Featured</span>}
        <span className="absolute right-5 top-5"><StatusBadge status={home.status} /></span>
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold text-clay">{home.manufacturer}</p>
          <h3 className="mt-1 text-2xl font-black text-forest">{home.name}</h3>
        </div>
        <div className="rounded-2xl bg-sand/70 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-forest/60">Starting price</p>
          <p className="mt-1 text-3xl font-black text-forest">{home.price}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Spec label="Beds" value={home.beds} />
          <Spec label="Baths" value={home.baths} />
          <Spec label="Sq. Ft." value={home.squareFootage.toLocaleString()} />
          <Spec label="Size" value={home.size} />
        </dl>
        <Link className="inline-flex rounded-full bg-forest px-5 py-3 text-sm font-black text-white transition hover:bg-clay" href={`/homes/${home.slug}`}>
          View home details
        </Link>
      </div>
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-forest/10 p-3"><dt className="font-black text-forest">{label}</dt><dd className="mt-1 text-forest/70">{value}</dd></div>;
}
