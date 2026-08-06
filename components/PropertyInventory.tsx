"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PROPERTY_STORAGE_KEY,
  formatPropertyAddress,
  getPropertyMapUrl,
  properties as seededProperties,
  type PropertyRecord,
  type PropertyStatus,
  type PropertyType
} from "@/data/properties";

type SortOption = "display-order" | "city" | "status" | "units-desc";

type StatusTheme = {
  dot: string;
  badge: string;
  panel: string;
  label: string;
};

const statusThemes: Record<PropertyStatus, StatusTheme> = {
  "Available Now": {
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    panel: "border-emerald-200 bg-emerald-50/70",
    label: "Available now"
  },
  "Coming Soon / In Progress": {
    dot: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    panel: "border-amber-200 bg-amber-50/70",
    label: "Coming soon"
  },
  "Under Contract / Sold": {
    dot: "bg-rose-500",
    badge: "border-rose-200 bg-rose-50 text-rose-900",
    panel: "border-rose-200 bg-rose-50/70",
    label: "Under contract"
  },
  "Status to Confirm": {
    dot: "bg-slate-400",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    panel: "border-slate-200 bg-slate-50",
    label: "Confirm status"
  }
};

const cityPositions = [
  { city: "Homosassa", left: "17%", top: "20%" },
  { city: "Spring Hill", left: "27%", top: "48%" },
  { city: "Brooksville", left: "53%", top: "39%" },
  { city: "New Port Richey", left: "25%", top: "76%" },
  { city: "Zephyrhills", left: "72%", top: "72%" }
] as const;

function PropertyTypeIcon({ type }: { type: PropertyType }) {
  if (type === "Finished Home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6" />
      </svg>
    );
  }

  if (type === "Home in Progress") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m14.5 4.5 5 5M13 6l5 5M4 20l8.5-8.5 3 3L7 23H4v-3Z" />
        <path d="M11 5 5 11M3 9l4 4" />
      </svg>
    );
  }

  if (type === "Vacant Lot / Land") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" />
        <path d="M4 11h16M10 5v14M15 11v8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2.1M12 17h.01" />
    </svg>
  );
}

function formatPrice(price: number | null) {
  if (price === null || price <= 0) return "Call for pricing";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

function getStoredProperties() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PropertyRecord[]) : null;
  } catch {
    return null;
  }
}

export function PropertyInventory() {
  const [allProperties, setAllProperties] = useState<PropertyRecord[]>(seededProperties);
  const [usingDraft, setUsingDraft] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PropertyStatus | "All">("All");
  const [propertyType, setPropertyType] = useState<PropertyType | "All">("All");
  const [city, setCity] = useState("All");
  const [sort, setSort] = useState<SortOption>("display-order");

  useEffect(() => {
    const stored = getStoredProperties();
    if (stored) {
      setAllProperties(stored);
      setUsingDraft(true);
    }
  }, []);

  const publicProperties = useMemo(
    () => allProperties.filter((property) => property.publicVisible),
    [allProperties]
  );

  const cities = useMemo(
    () => Array.from(new Set(publicProperties.map((property) => property.city).filter(Boolean))).sort(),
    [publicProperties]
  );

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const next = publicProperties.filter((property) => {
      const searchable = `${property.street} ${property.city} ${property.zip} ${property.notes}`.toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (status === "All" || property.status === status) &&
        (propertyType === "All" || property.propertyType === propertyType) &&
        (city === "All" || property.city === city)
      );
    });

    return [...next].sort((a, b) => {
      if (sort === "city") return `${a.city}${a.street}`.localeCompare(`${b.city}${b.street}`);
      if (sort === "status") return `${a.status}${a.displayOrder}`.localeCompare(`${b.status}${b.displayOrder}`);
      if (sort === "units-desc") return b.units - a.units || a.displayOrder - b.displayOrder;
      return a.displayOrder - b.displayOrder;
    });
  }, [city, propertyType, publicProperties, query, sort, status]);

  const metrics = useMemo(() => {
    const available = publicProperties.filter((property) => property.status === "Available Now");
    return {
      records: publicProperties.length,
      availableRecords: available.length,
      availableUnits: available.reduce((sum, property) => sum + property.units, 0),
      homes: publicProperties.filter((property) => property.propertyType === "Finished Home").length,
      inProgress: publicProperties.filter((property) => property.status === "Coming Soon / In Progress").length,
      underContract: publicProperties.filter((property) => property.status === "Under Contract / Sold").length
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
            units: records.reduce((sum, property) => sum + property.units, 0),
            available: records.filter((property) => property.status === "Available Now").length,
            inProgress: records.filter((property) => property.status === "Coming Soon / In Progress").length,
            underContract: records.filter((property) => property.status === "Under Contract / Sold").length
          }
        ] as const;
      })
    );
  }, [publicProperties]);

  const selectCity = (cityName: string) => {
    setCity((current) => (current === cityName ? "All" : cityName));
    window.setTimeout(() => document.getElementById("property-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate bg-gradient-to-br from-ehsBlack via-ehsNavy to-ehsDeepBlue px-4 py-16 text-white sm:py-20">
        <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #a5e1f8 0, transparent 28%), radial-gradient(circle at 85% 30%, #41a2d9 0, transparent 24%)" }} />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-ehsLightBlue">EHS land and home opportunities</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Property map &amp; sales status</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">Explore finished homes, build-ready land, multi-site opportunities, and homes currently in progress across Central Florida.</p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["Property records", metrics.records],
              ["Available records", metrics.availableRecords],
              ["Available homes & sites", metrics.availableUnits],
              ["Finished homes", metrics.homes],
              ["Coming soon", metrics.inProgress],
              ["Under contract", metrics.underContract]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-1 text-sm font-bold text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            <div className="overflow-hidden rounded-[2rem] border border-ehsBlue/15 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-xl shadow-ehsNavy/8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ehsBlue/10 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-black text-ehsNavy">Regional opportunity map</h2>
                  <p className="mt-1 text-sm text-ehsNavy/65">Select a city to filter the property cards below.</p>
                </div>
                {city !== "All" && (
                  <button type="button" onClick={() => setCity("All")} className="rounded-full border border-ehsBlue/20 bg-white px-4 py-2 text-sm font-black text-ehsDeepBlue hover:border-ehsBlue">Show all cities</button>
                )}
              </div>

              <div className="relative min-h-[480px] overflow-hidden bg-[linear-gradient(rgba(22,136,201,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(22,136,201,0.06)_1px,transparent_1px)] bg-[size:34px_34px] sm:min-h-[560px]">
                <svg viewBox="0 0 900 560" className="absolute inset-0 h-full w-full" role="img" aria-label="Illustrative regional overview connecting Homosassa, Spring Hill, Brooksville, New Port Richey, and Zephyrhills">
                  <path d="M105 20C135 96 100 174 120 248c18 68-18 145 18 294" fill="none" stroke="#a5e1f8" strokeWidth="65" opacity=".8" />
                  <path d="M148 75c130 20 160 160 325 160 94 0 155 45 260 180" fill="none" stroke="#1688c9" strokeDasharray="8 10" strokeLinecap="round" strokeWidth="4" opacity=".32" />
                  <path d="M240 300c145 30 225 7 350-90M250 410c150-60 300-40 455 30" fill="none" stroke="#0b4f86" strokeDasharray="6 11" strokeLinecap="round" strokeWidth="3" opacity=".22" />
                  <circle cx="460" cy="265" r="150" fill="#a5e1f8" opacity=".12" />
                  <circle cx="695" cy="420" r="115" fill="#41a2d9" opacity=".1" />
                </svg>

                {cityPositions.map((position) => {
                  const summary = citySummary.get(position.city);
                  const isSelected = city === position.city;
                  return (
                    <button
                      key={position.city}
                      type="button"
                      onClick={() => selectCity(position.city)}
                      style={{ left: position.left, top: position.top }}
                      className={`absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-3 text-left shadow-lg transition sm:w-44 sm:p-4 ${isSelected ? "scale-105 border-ehsBlue bg-ehsNavy text-white shadow-ehsNavy/25" : "border-white/90 bg-white/95 text-ehsNavy shadow-ehsNavy/10 hover:-translate-y-[54%] hover:border-ehsBlue"}`}
                      aria-pressed={isSelected}
                    >
                      <span className="block text-sm font-black sm:text-base">{position.city}</span>
                      <span className={`mt-1 block text-xs font-bold ${isSelected ? "text-white/70" : "text-ehsNavy/55"}`}>{summary?.records ?? 0} properties · {summary?.units ?? 0} homes/sites</span>
                      <span className="mt-3 flex gap-1.5" aria-label="Status summary">
                        {(summary?.available ?? 0) > 0 && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title={`${summary?.available} available`} />}
                        {(summary?.inProgress ?? 0) > 0 && <span className="h-2.5 w-2.5 rounded-full bg-amber-500" title={`${summary?.inProgress} in progress`} />}
                        {(summary?.underContract ?? 0) > 0 && <span className="h-2.5 w-2.5 rounded-full bg-rose-500" title={`${summary?.underContract} under contract`} />}
                      </span>
                    </button>
                  );
                })}

                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-xs font-bold text-ehsNavy/60 backdrop-blur">
                  City positions are illustrative. Each property card opens the full address in Google Maps for accurate directions.
                </div>
              </div>
            </div>

            <aside className="rounded-[2rem] bg-ehsNavy p-6 text-white shadow-xl shadow-ehsNavy/15">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-ehsLightBlue">Status key</p>
              <div className="mt-5 grid gap-3">
                {(Object.entries(statusThemes) as [PropertyStatus, StatusTheme][]).map(([statusName, theme]) => (
                  <button key={statusName} type="button" onClick={() => setStatus(status === statusName ? "All" : statusName)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${status === statusName ? "border-white bg-white text-ehsNavy" : "border-white/12 bg-white/7 hover:bg-white/12"}`}>
                    <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${theme.dot}`} />
                    <span>
                      <span className="block font-black">{theme.label}</span>
                      <span className={`mt-0.5 block text-xs ${status === statusName ? "text-ehsNavy/60" : "text-white/58"}`}>{statusName}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-7 border-t border-white/12 pt-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-ehsLightBlue">Property type</p>
                <div className="mt-4 grid gap-3 text-sm font-bold text-white/75">
                  {(["Finished Home", "Home in Progress", "Vacant Lot / Land"] as PropertyType[]).map((type) => (
                    <button key={type} type="button" onClick={() => setPropertyType(propertyType === type ? "All" : type)} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${propertyType === type ? "border-white bg-white text-ehsNavy" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                      <PropertyTypeIcon type={type} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="property-results" className="scroll-mt-28 border-t border-ehsBlue/10 bg-ehsSoftBlue px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-ehsBlue">Live inventory view</p>
              <h2 className="mt-2 text-3xl font-black text-ehsNavy">Homes, land &amp; active projects</h2>
              <p className="mt-2 text-ehsNavy/65">Showing {filteredProperties.length} of {publicProperties.length} published property records.</p>
            </div>
            <button type="button" onClick={() => window.print()} className="print:hidden rounded-full border border-ehsBlue/20 bg-white px-5 py-3 text-sm font-black text-ehsDeepBlue shadow-sm hover:border-ehsBlue">Print this view</button>
          </div>

          {usingDraft && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 print:hidden">
              This browser is displaying the saved property-manager draft. Other visitors continue to see the published seed inventory until a database is connected.
            </div>
          )}

          <div className="mt-7 grid gap-3 rounded-[2rem] border border-ehsBlue/10 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5 print:hidden">
            <label className="lg:col-span-2">
              <span className="text-xs font-black uppercase tracking-wider text-ehsNavy/55">Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Address, city, ZIP, or notes" className="mt-1.5 w-full rounded-2xl border border-ehsBlue/15 px-4 py-3 text-base text-ehsNavy outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsLightBlue/45" />
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-wider text-ehsNavy/55">City</span>
              <select value={city} onChange={(event) => setCity(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-ehsBlue/15 bg-white px-4 py-3 text-base text-ehsNavy outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsLightBlue/45">
                <option value="All">All cities</option>
                {cities.map((cityName) => <option key={cityName} value={cityName}>{cityName}</option>)}
              </select>
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-wider text-ehsNavy/55">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as PropertyStatus | "All")} className="mt-1.5 w-full rounded-2xl border border-ehsBlue/15 bg-white px-4 py-3 text-base text-ehsNavy outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsLightBlue/45">
                <option value="All">All statuses</option>
                {(Object.keys(statusThemes) as PropertyStatus[]).map((statusName) => <option key={statusName} value={statusName}>{statusName}</option>)}
              </select>
            </label>
            <label>
              <span className="text-xs font-black uppercase tracking-wider text-ehsNavy/55">Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="mt-1.5 w-full rounded-2xl border border-ehsBlue/15 bg-white px-4 py-3 text-base text-ehsNavy outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsLightBlue/45">
                <option value="display-order">Featured order</option>
                <option value="city">City, then address</option>
                <option value="status">Status</option>
                <option value="units-desc">Most sites first</option>
              </select>
            </label>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => {
              const theme = statusThemes[property.status];
              return (
                <article key={property.id} className={`flex min-h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-lg shadow-ehsNavy/8 ${theme.panel}`}>
                  <div className="flex items-start justify-between gap-4 p-6 pb-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ehsNavy text-white"><PropertyTypeIcon type={property.propertyType} /></div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider text-ehsNavy/45">{property.id}</p>
                        <h3 className="mt-1 text-xl font-black leading-tight text-ehsNavy">{property.street}</h3>
                        <p className="mt-1 text-sm font-bold text-ehsNavy/60">{[property.city, property.state, property.zip].filter(Boolean).join(", ")}</p>
                      </div>
                    </div>
                    <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${theme.dot}`} aria-label={property.status} />
                  </div>

                  <div className="px-6">
                    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${theme.badge}`}>{property.status}</span>
                    <p className="mt-4 leading-7 text-ehsNavy/70">{property.notes}</p>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 px-6">
                    <div className="rounded-2xl bg-white/80 p-3">
                      <dt className="text-xs font-black uppercase tracking-wider text-ehsNavy/45">Type</dt>
                      <dd className="mt-1 text-sm font-black text-ehsNavy">{property.propertyType}</dd>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-3">
                      <dt className="text-xs font-black uppercase tracking-wider text-ehsNavy/45">Homes / sites</dt>
                      <dd className="mt-1 text-lg font-black text-ehsNavy">{property.units}</dd>
                    </div>
                    <div className="col-span-2 rounded-2xl bg-white/80 p-3">
                      <dt className="text-xs font-black uppercase tracking-wider text-ehsNavy/45">Price</dt>
                      <dd className="mt-1 text-lg font-black text-ehsNavy">{formatPrice(property.price)}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto grid grid-cols-2 gap-3 p-6 print:hidden">
                    <a href={getPropertyMapUrl(property)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-ehsBlue/20 bg-white px-4 text-sm font-black text-ehsDeepBlue hover:border-ehsBlue">Directions</a>
                    <Link href={`/get-quote?property=${encodeURIComponent(property.id)}`} className="inline-flex min-h-12 items-center justify-center rounded-full bg-ehsBlue px-4 text-sm font-black text-white hover:bg-ehsDeepBlue">Ask about it</Link>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredProperties.length === 0 && (
            <div className="mt-8 rounded-[2rem] border border-dashed border-ehsBlue/30 bg-white p-10 text-center">
              <p className="text-xl font-black text-ehsNavy">No properties match those filters.</p>
              <button type="button" onClick={() => { setQuery(""); setStatus("All"); setPropertyType("All"); setCity("All"); }} className="mt-4 rounded-full bg-ehsBlue px-5 py-3 text-sm font-black text-white">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
