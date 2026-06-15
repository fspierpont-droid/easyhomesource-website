import Link from "next/link";
import type { Home } from "@/data/homes";

export function HomeCard({ home }: { home: Home }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-sm">
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-sand to-forest/10 p-6 text-center text-sm font-semibold text-forest/70">
        {home.imagePlaceholder}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-clay">{home.manufacturer}</p>
            <h3 className="text-xl font-bold text-forest">{home.name}</h3>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-forest">{home.status}</span>
        </div>
        <p className="text-2xl font-black text-forest">{home.price}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm text-forest/75 sm:grid-cols-4">
          <div><dt className="font-bold text-forest">Beds</dt><dd>{home.beds}</dd></div>
          <div><dt className="font-bold text-forest">Baths</dt><dd>{home.baths}</dd></div>
          <div><dt className="font-bold text-forest">Sq. Ft.</dt><dd>{home.squareFootage.toLocaleString()}</dd></div>
          <div><dt className="font-bold text-forest">Size</dt><dd>{home.size}</dd></div>
        </dl>
        <Link className="inline-flex font-bold text-clay hover:text-forest" href={`/homes/${home.slug}`}>
          View home details →
        </Link>
      </div>
    </article>
  );
}
