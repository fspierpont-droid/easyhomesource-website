"use client";

import { useMemo, useState } from "react";
import { HomeCard } from "@/components/HomeCard";
import type { Home, HomeStatus } from "@/data/homes";

const statuses: Array<"All" | HomeStatus> = ["All", "Available", "Coming Soon", "Sold"];

export function HomesBrowser({ homes }: { homes: Home[] }) {
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [bedrooms, setBedrooms] = useState("Any");

  const filteredHomes = useMemo(() => {
    return homes.filter((home) => {
      const statusMatch = status === "All" || home.status === status;
      const bedroomMatch = bedrooms === "Any" || home.beds !== null && home.beds >= Number(bedrooms);
      return statusMatch && bedroomMatch;
    });
  }, [bedrooms, homes, status]);

  return (
    <section className="mt-8">
      <div className="rounded-[1.75rem] border border-forest/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-end">
          <label className="text-sm font-black text-forest">
            Home status
            <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {statuses.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${status === option ? "bg-forest text-white" : "bg-sand text-forest hover:bg-sand/70"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </label>
          <label className="text-sm font-black text-forest">
            Bedrooms
            <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} className="mt-2 w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 font-semibold text-forest">
              <option>Any</option>
              <option value="2">2+ bedrooms</option>
              <option value="3">3+ bedrooms</option>
              <option value="4">4+ bedrooms</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm font-semibold text-forest/65">Showing {filteredHomes.length} of {homes.length} homes. Labels identify Featured, Available, Coming Soon, and Sold inventory.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">{filteredHomes.map((home) => <HomeCard key={home.id} home={home} />)}</div>
    </section>
  );
}
