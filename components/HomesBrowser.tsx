"use client";

import { useMemo, useState } from "react";
import { HomeCard } from "@/components/HomeCard";
import type { Home } from "@/data/homes";

type Sort = "price-asc" | "price-desc" | "sqft-asc" | "sqft-desc";
const priceNumber = (price: string | null) => price ? Number(price.replace(/[^0-9]/g, "")) : Number.POSITIVE_INFINITY;

export function HomesBrowser({ homes }: { homes: Home[] }) {
  const [search, setSearch] = useState("");
  const [bedrooms, setBedrooms] = useState("Any");
  const [bathrooms, setBathrooms] = useState("Any");
  const [sort, setSort] = useState<Sort>("price-asc");
  const [flags, setFlags] = useState({ featured: false, onDisplay: false, newArrival: false, specialOffer: false });

  const filteredHomes = useMemo(() => {
    return homes.filter((home) => {
      const q = search.trim().toLowerCase();
      return (!q || home.name.toLowerCase().includes(q) || (home.size ?? "").toLowerCase().includes(q))
        && (bedrooms === "Any" || home.beds !== null && home.beds >= Number(bedrooms))
        && (bathrooms === "Any" || home.baths !== null && home.baths >= Number(bathrooms))
        && (!flags.featured || home.featured) && (!flags.onDisplay || home.onDisplay) && (!flags.newArrival || home.newArrival) && (!flags.specialOffer || home.specialOffer);
    }).sort((a, b) => {
      if (sort === "price-asc") return priceNumber(a.price) - priceNumber(b.price);
      if (sort === "price-desc") return priceNumber(b.price) - priceNumber(a.price);
      if (sort === "sqft-asc") return (a.squareFeet ?? Infinity) - (b.squareFeet ?? Infinity);
      return (b.squareFeet ?? -Infinity) - (a.squareFeet ?? -Infinity);
    });
  }, [bathrooms, bedrooms, flags, homes, search, sort]);

  return <section className="mt-8"><div className="rounded-[1.75rem] border border-borderGray bg-white p-4 shadow-sm sm:p-5"><div className="grid gap-4 md:grid-cols-4 md:items-end"><label className="text-sm font-black text-ehsBlack md:col-span-2">Search<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by home name or size" className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-semibold text-ehsBlack" /></label><Select label="Bedrooms" value={bedrooms} setValue={setBedrooms} options={["Any", "1", "2", "3", "4"]} suffix="+ bedrooms" /><Select label="Bathrooms" value={bathrooms} setValue={setBathrooms} options={["Any", "1", "2", "3"]} suffix="+ baths" /><label className="text-sm font-black text-ehsBlack md:col-span-2">Sort<select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-semibold text-ehsBlack"><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="sqft-asc">Square footage: low to high</option><option value="sqft-desc">Square footage: high to low</option></select></label><div className="grid grid-cols-2 gap-2 md:col-span-2">{([['featured','Featured'],['onDisplay','On Display'],['newArrival','New Arrival'],['specialOffer','Special Offer']] as const).map(([key,label]) => <button key={key} type="button" onClick={() => setFlags(v => ({...v,[key]: !v[key]}))} className={`rounded-full px-4 py-2 text-sm font-black transition ${flags[key] ? "bg-ehsBlue text-white" : "bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/50"}`}>{label}</button>)}</div></div><p className="mt-4 text-sm font-semibold text-ehsBlack/65">Showing {filteredHomes.length} of {homes.length} homes.</p></div><div className="mt-8 grid gap-6 lg:grid-cols-2">{filteredHomes.map((home) => <HomeCard key={home.id} home={home} />)}</div></section>;
}
function Select({ label, value, setValue, options, suffix }: { label: string; value: string; setValue: (v: string) => void; options: string[]; suffix: string }) { return <label className="text-sm font-black text-ehsBlack">{label}<select value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 w-full rounded-2xl border border-borderGray bg-white px-4 py-3 font-semibold text-ehsBlack">{options.map(o => <option key={o} value={o}>{o === "Any" ? "Any" : `${o}${suffix}`}</option>)}</select></label>; }
