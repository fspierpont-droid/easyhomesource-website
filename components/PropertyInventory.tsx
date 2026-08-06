"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getPropertyMapUrl,
  properties,
  type PropertyRecord,
  type PropertyStatus,
  type PropertyType
} from "@/data/properties";

type SortOption = "featured" | "city" | "status" | "sites";

const cityPositions = [
  { city: "Homosassa", left: "17%", top: "20%" },
  { city: "Spring Hill", left: "27%", top: "48%" },
  { city: "Brooksville", left: "53%", top: "39%" },
  { city: "New Port Richey", left: "25%", top: "76%" },
  { city: "Zephyrhills", left: "72%", top: "72%" }
] as const;

const statusStyles: Record<PropertyStatus, string> = {
  "Available Now": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Coming Soon / In Progress": "border-amber-200 bg-amber-50 text-amber-900",
  "Under Contract / Sold": "border-rose-200 bg-rose-50 text-rose-900",
  "Status to Confirm": "border-slate-200 bg-slate-100 text-slate-700"
};

function formatPrice(price: number | null) {
  if (!price || price <= 0) return "Custom package pricing";
  return `Starting at ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price)}`;
}

function getPackageLabel(property: PropertyRecord) {
  if (property.propertyType === "Finished Home") return "Home + property opportunity";
  if (property.propertyType === "Home in Progress") return "Coming-soon home package";
  if (property.units > 1) return `${property.units}-site land opportunity`;
  return "Land + home package planning";
}

function getCustomerDescription(property: PropertyRecord) {
  if (property.status === "Under Contract / Sold") {
    return "This property is currently under contract or no longer available. Easy HomeSource can help locate and plan a similar land-and-home package.";
  }

  if (property.propertyType === "Finished Home") {
    return "A completed home opportunity. Ask about current specifications, pricing, financing, and showing availability.";
  }

  if (property.propertyType === "Home in Progress") {
    return "A home is currently being prepared on this property. Ask about the expected timeline, finishes, and package details.";
  }

  if (property.units > 1) {
    return `A multi-site land opportunity with approximately ${property.units} potential home sites. Contact Easy HomeSource for home matching, site planning, and package pricing.`;
  }

  return "An available land opportunity that may be paired with a manufactured home, delivery, setup, permits, and site-work planning.";
}

function PropertyIcon({ type }: { type: PropertyType }) {
  if (type === "Vacant Lot / Land") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" />
        <path d="M4 11h16M10 5v14M15 11v8" />
      </svg>
    );
  }

  if (type === "Home in Progress") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="m9 18 6-6M13.5 11.5l1 1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6" />
    </svg>
  );
}

export function PropertyInventory() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [status, setStatus] = useState<PropertyStatus | "All">("All");
  const [propertyType, setPropertyType] = useState<PropertyType | "All">("All");
  const [sort, setSort] = useState<SortOption>("featured");

  const publicProperties = useMemo(() => properties.filter((property) => property.publicVisible), []);
  const cities = useMemo(
    () => Array.from(new Set(publicProperties.map((property) => property.city).filter(Boolean))).sort(),
    [publicProperties]
  );

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = publicProperties.filter((property) => {
      const searchable = `${property.street} ${property.city} ${property.zip} ${property.propertyType}`.toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (city === "All" || property.city === city) &&
        (status === "All" || property.status === status) &&
        (propertyType === "All" || property.propertyType === propertyType)
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "city") return `${a.city}${a.street}`.localeCompare(`${b.city}${b.street}`);
      if (sort === "status") return `${a.status}${a.displayOrder}`.localeCompare(`${b.status}${b.displayOrder}`);
      if (sort === "sites") return b.units - a.units || a.displayOrder - b.displayOrder;
      return a.displayOrder - b.displayOrder;
    });
  }, [city, propertyType, publicProperties, query, sort, status]);

  const metrics = useMemo(() => {
    const available = publicProperties.filter((property) => property.status === "Available Now");
    return {
      opportunities: publicProperties.length,
      available: available.length,
      sites: available.reduce((sum, property) => sum + property.units, 0),
      completedHomes: publicProperties.filter((property) => property.propertyType === "Finished Home").length,
      comingSoon: publicProperties.filter((property) => property.status === "Coming Soon / In Progress").length
    };
  }, [publicProperties]);

  const citySummary = useMemo(() => {
    return new Map(
      cityPositions.map(({ city: cityName }) => {
        const records = publicProperties.filter((property) => property.city === cityName);
        return [
          cityName,
          {
            records: records.length,
            sites: records.reduce((sum, property) => sum + property.units, 0),
            available: records.filter((property) => property.status === "Available Now").length
          }
        ] as const;
      })
    );
  }, [publicProperties]);

  const selectCity = (cityName: string) => {
    setCity((current) => (current === cityName ? "All" : cityName));
    window.setTimeout(() => {
      document.getElementById("package-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const clearFilters = () => {
    setQuery("");
    setCity("All");
    setStatus("All");
    setPropertyType("All");
  };

  const controlClass = "h-12 rounded-2xl border border-ehsBlue/15 px-4 font-bold text-ehsNavy outline-none focus:border-ehsBlue";

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate bg-gradient-to-br from-ehsBlack via-ehsNavy to-ehsDeepBlue px-4 py-16 text-white sm:py-20">
        <div
          className="absolute inset-0 -z-10 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 18%, #a5e1f8 0, transparent 28%), radial-gradient(circle at 84% 32%, #41a2d9 0, transparent 24%)"
          }}
        />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-ehsLightBlue">Land, homes, and complete project planning</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Land &amp; Home Packages</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              Explore available land, completed homes, multi-site opportunities, and properties where Easy HomeSource can help coordinate the home, delivery, setup, permits, and site work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/get-quote?source=land-home-packages&cta=build-my-package" className="rounded-full bg-ehsBlue px-6 py-3 font-black text-white shadow-lg transition hover:bg-white hover:text-ehsNavy">
                Build My Package
              </Link>
              <Link href="/homes" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white hover:text-ehsNavy">
                Browse Home Models
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Package opportunities", metrics.opportunities],
              ["Available now", metrics.available],
              ["Available homes & sites", metrics.sites],
              ["Completed homes", metrics.completedHomes],
              ["Coming soon", metrics.comingSoon]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-1 text-sm font-bold text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <div className="overflow-hidden rounded-[2rem] border border-ehsBlue/15 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-xl shadow-ehsNavy/8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ehsBlue/10 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-black text-ehsNavy">Regional package map</h2>
                  <p className="mt-1 text-sm text-ehsNavy/65">Select a city to view its current opportunities.</p>
                </div>
                {city !== "All" && (
                  <button type="button" onClick={() => setCity("All")} className="rounded-full border border-ehsBlue/20 bg-white px-4 py-2 text-sm font-black text-ehsDeepBlue hover:border-ehsBlue">
                    Show all cities
                  </button>
                )}
              </div>

              <div className="relative min-h-[480px] overflow-hidden bg-[linear-gradient(rgba(22,136,201,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(22,136,201,0.06)_1px,transparent_1px)] bg-[size:34px_34px] sm:min-h-[560px]">
                <svg viewBox="0 0 900 560" className="absolute inset-0 h-full w-full" role="img" aria-label="Illustrative regional map of Easy HomeSource land and home package opportunities">
                  <path d="M105 20C135 96 100 174 120 248c18 68-18 145 18 294" fill="none" stroke="#a5e1f8" strokeWidth="65" opacity=".8" />
                  <path d="M148 75c130 20 160 160 325 160 94 0 155 45 260 180" fill="none" stroke="#1688c9" strokeDasharray="8 10" strokeLinecap="round" strokeWidth="4" opacity=".32" />
                  <path d="M240 300c145 30 225 7 350-90M250 410c150-60 300-40 455 30" fill="none" stroke="#0b4f86" strokeDasharray="6 11" strokeLinecap="round" strokeWidth="3" opacity=".22" />
                </svg>

                {cityPositions.map((position) => {
                  const summary = citySummary.get(position.city);
                  const selected = city === position.city;
                  return (
                    <button
                      key={position.city}
                      type="button"
                      onClick={() => selectCity(position.city)}
                      style={{ left: position.left, top: position.top }}
                      className={`absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-3 text-left shadow-lg transition sm:w-44 sm:p-4 ${
                        selected
                          ? "scale-105 border-ehsBlue bg-ehsNavy text-white shadow-ehsNavy/25"
                          : "border-white/90 bg-white/95 text-ehsNavy shadow-ehsNavy/10 hover:-translate-y-[54%] hover:border-ehsBlue"
                      }`}
                      aria-pressed={selected}
                    >
                      <span className="block text-sm font-black sm:text-base">{position.city}</span>
                      <span className={`mt-1 block text-xs font-bold ${selected ? "text-white/70" : "text-ehsNavy/55"}`}>
                        {summary?.records ?? 0} opportunities · {summary?.sites ?? 0} homes/sites
                      </span>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-black">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        {summary?.available ?? 0} available
                      </span>
                    </button>
                  );
                })}

                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-xs font-bold text-ehsNavy/60 backdrop-blur">
                  Map positions are illustrative. Use the directions button on each package card for the exact property location.
                </div>
              </div>
            </div>

            <aside className="rounded-[2rem] bg-ehsSoftBlue p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-ehsBlue">One coordinated package</p>
              <h2 className="mt-3 text-3xl font-black text-ehsNavy">More than just a piece of land</h2>
              <p className="mt-4 leading-7 text-ehsBlack/75">
                Easy HomeSource can help combine the property, manufactured home, delivery, setup, permitting, foundation requirements, site preparation, utilities, and financing guidance into one planned project.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  "Select an available property",
                  "Match it with an appropriate home model",
                  "Estimate delivery, setup, permits, and site work",
                  "Review financing and total package pricing"
                ].map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ehsNavy text-sm font-black text-white">{index + 1}</span>
                    <p className="pt-1 text-sm font-bold text-ehsBlack/80">{step}</p>
                  </div>
                ))}
              </div>
              <Link href="/get-quote?source=land-home-packages&cta=package-consultation" className="mt-7 block rounded-2xl bg-ehsNavy px-5 py-4 text-center font-black text-white transition hover:bg-ehsBlue">
                Start a Package Consultation
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section id="package-results" className="scroll-mt-28 bg-ehsSoftBlue/35 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-ehsBlue">Current inventory</p>
              <h2 className="mt-2 text-3xl font-black text-ehsNavy sm:text-4xl">Available and upcoming packages</h2>
              <p className="mt-3 max-w-3xl leading-7 text-ehsBlack/70">Choose a property to request a complete land-and-home estimate or ask about a similar opportunity.</p>
            </div>
            <button type="button" onClick={() => window.print()} className="self-start rounded-full border border-ehsBlue/20 bg-white px-5 py-3 text-sm font-black text-ehsDeepBlue hover:border-ehsBlue print:hidden">
              Print opportunities
            </button>
          </div>

          <div className="mt-8 grid gap-3 rounded-[2rem] border border-ehsBlue/10 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5 print:hidden">
            <label className="lg:col-span-2">
              <span className="sr-only">Search properties</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search address, city, or ZIP" className="h-12 w-full rounded-2xl border border-ehsBlue/15 px-4 font-semibold text-ehsNavy outline-none transition focus:border-ehsBlue" />
            </label>
            <select aria-label="Filter by city" value={city} onChange={(event) => setCity(event.target.value)} className={controlClass}>
              <option value="All">All cities</option>
              {cities.map((cityName) => <option key={cityName} value={cityName}>{cityName}</option>)}
            </select>
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value as PropertyStatus | "All")} className={controlClass}>
              <option value="All">All statuses</option>
              <option value="Available Now">Available now</option>
              <option value="Coming Soon / In Progress">Coming soon</option>
              <option value="Under Contract / Sold">Under contract</option>
            </select>
            <select aria-label="Filter by opportunity type" value={propertyType} onChange={(event) => setPropertyType(event.target.value as PropertyType | "All")} className={controlClass}>
              <option value="All">All opportunity types</option>
              <option value="Finished Home">Completed homes</option>
              <option value="Home in Progress">Homes in progress</option>
              <option value="Vacant Lot / Land">Land opportunities</option>
            </select>
            <select aria-label="Sort package opportunities" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className={`${controlClass} sm:col-start-2 lg:col-start-5`}>
              <option value="featured">Featured order</option>
              <option value="city">City</option>
              <option value="status">Status</option>
              <option value="sites">Most sites</option>
            </select>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const underContract = property.status === "Under Contract / Sold";
              return (
                <article key={property.id} className="flex min-h-full flex-col overflow-hidden rounded-[2rem] border border-ehsBlue/12 bg-white shadow-lg shadow-ehsNavy/6">
                  <div className="relative flex min-h-44 items-end bg-gradient-to-br from-ehsNavy via-ehsDeepBlue to-ehsBlue p-6 text-white">
                    <div className="absolute right-5 top-5 rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <PropertyIcon type={property.propertyType} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-ehsLightBlue">{getPackageLabel(property)}</p>
                      <h3 className="mt-2 text-2xl font-black">{property.city || "Central Florida"}</h3>
                      <p className="mt-1 text-sm font-bold text-white/70">{property.units} {property.units === 1 ? "home/site" : "potential homes/sites"}</p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black text-ehsNavy">{property.street}</p>
                        <p className="mt-1 text-sm font-semibold text-ehsBlack/60">{[property.city, property.state, property.zip].filter(Boolean).join(", ")}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyles[property.status]}`}>{property.status}</span>
                    </div>

                    <p className="mt-5 leading-7 text-ehsBlack/72">{getCustomerDescription(property)}</p>

                    <div className="mt-5 rounded-2xl bg-ehsSoftBlue px-4 py-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-ehsBlue">Package pricing</p>
                      <p className="mt-1 text-lg font-black text-ehsNavy">{formatPrice(property.price)}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-ehsBlack/55">Final pricing depends on the selected home, financing, site conditions, delivery, setup, permits, utilities, and requested options.</p>
                    </div>

                    <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
                      <a href={getPropertyMapUrl(property)} target="_blank" rel="noreferrer" className="rounded-2xl border border-ehsBlue/20 px-4 py-3 text-center text-sm font-black text-ehsDeepBlue transition hover:border-ehsBlue hover:bg-ehsSoftBlue">
                        View Directions
                      </a>
                      <Link href={`/get-quote?property=${encodeURIComponent(property.id)}&source=land-home-packages&cta=${underContract ? "similar-package" : "build-package"}`} className="rounded-2xl bg-ehsNavy px-4 py-3 text-center text-sm font-black text-white transition hover:bg-ehsBlue">
                        {underContract ? "Find a Similar Package" : "Build This Package"}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProperties.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-dashed border-ehsBlue/25 bg-white p-10 text-center">
              <h3 className="text-2xl font-black text-ehsNavy">No matching opportunities</h3>
              <p className="mt-3 text-ehsBlack/65">Clear one or more filters, or request help locating a land-and-home package that meets your needs.</p>
              <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-ehsNavy px-5 py-3 font-black text-white hover:bg-ehsBlue">
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-10 rounded-[2rem] border border-ehsBlue/12 bg-white p-6 text-sm leading-7 text-ehsBlack/65 sm:p-8">
            <p className="font-black text-ehsNavy">Availability and pricing notice</p>
            <p className="mt-2">Property availability, home compatibility, zoning, setbacks, site conditions, utility access, financing, delivery, setup, permits, taxes, fees, and total project pricing require verification before purchase or construction.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
