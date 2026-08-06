"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PROPERTY_STORAGE_KEY,
  properties as seededProperties,
  propertyStatuses,
  propertyTypes,
  type PropertyRecord,
  type PropertyStatus
} from "@/data/properties";

type ManagerSort = "display-order" | "address" | "city" | "status" | "units-desc";

const statusStyles: Record<PropertyStatus, string> = {
  "Available Now": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Coming Soon / In Progress": "border-amber-200 bg-amber-50 text-amber-900",
  "Under Contract / Sold": "border-rose-200 bg-rose-50 text-rose-900",
  "Status to Confirm": "border-slate-200 bg-slate-100 text-slate-700"
};

function cloneSeedData() {
  return seededProperties.map((property) => ({ ...property }));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextPropertyId(records: PropertyRecord[]) {
  const highest = records.reduce((max, property) => {
    const value = Number(property.id.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
  return `EHS-${String(highest + 1).padStart(3, "0")}`;
}

function isPropertyRecord(value: unknown): value is PropertyRecord {
  if (!value || typeof value !== "object") return false;
  const property = value as Partial<PropertyRecord>;
  return Boolean(
    typeof property.id === "string" &&
    typeof property.street === "string" &&
    typeof property.city === "string" &&
    typeof property.state === "string" &&
    typeof property.zip === "string" &&
    propertyStatuses.includes(property.status as PropertyStatus) &&
    propertyTypes.includes(property.propertyType as PropertyRecord["propertyType"]) &&
    typeof property.units === "number" &&
    (property.price === null || typeof property.price === "number") &&
    typeof property.salesRep === "string" &&
    typeof property.notes === "string" &&
    typeof property.source === "string" &&
    typeof property.updatedAt === "string" &&
    typeof property.displayOrder === "number" &&
    typeof property.publicVisible === "boolean"
  );
}

export function PropertyManager() {
  const [records, setRecords] = useState<PropertyRecord[]>(cloneSeedData);
  const [selectedId, setSelectedId] = useState(seededProperties[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "All">("All");
  const [sort, setSort] = useState<ManagerSort>("display-order");
  const [message, setMessage] = useState("Published seed inventory loaded.");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROPERTY_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every(isPropertyRecord) && parsed.length > 0) {
        setRecords(parsed);
        setSelectedId(parsed[0].id);
        setMessage("Saved browser draft loaded.");
      }
    } catch {
      setMessage("The saved browser draft could not be loaded; published data is shown.");
    }
  }, []);

  const selected = records.find((property) => property.id === selectedId) ?? null;

  const displayedRecords = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = records.filter((property) => {
      const haystack = `${property.id} ${property.street} ${property.city} ${property.zip} ${property.notes}`.toLowerCase();
      return (!needle || haystack.includes(needle)) && (statusFilter === "All" || property.status === statusFilter);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "address") return a.street.localeCompare(b.street);
      if (sort === "city") return `${a.city}${a.street}`.localeCompare(`${b.city}${b.street}`);
      if (sort === "status") return `${a.status}${a.displayOrder}`.localeCompare(`${b.status}${b.displayOrder}`);
      if (sort === "units-desc") return b.units - a.units || a.displayOrder - b.displayOrder;
      return a.displayOrder - b.displayOrder;
    });
  }, [query, records, sort, statusFilter]);

  const summary = useMemo(() => {
    const available = records.filter((property) => property.status === "Available Now");
    return {
      records: records.length,
      public: records.filter((property) => property.publicVisible).length,
      available: available.length,
      units: available.reduce((total, property) => total + property.units, 0),
      confirm: records.filter((property) => property.status === "Status to Confirm").length
    };
  }, [records]);

  function updateSelected<K extends keyof PropertyRecord>(key: K, value: PropertyRecord[K]) {
    setRecords((current) => current.map((property) => property.id === selectedId ? { ...property, [key]: value, updatedAt: today() } : property));
    setMessage("Unsaved changes.");
  }

  function addProperty() {
    const id = nextPropertyId(records);
    const property: PropertyRecord = {
      id,
      street: "New property",
      city: "",
      state: "FL",
      zip: "",
      status: "Status to Confirm",
      propertyType: "Unknown",
      units: 1,
      price: null,
      salesRep: "Unassigned",
      notes: "",
      source: "Property manager",
      updatedAt: today(),
      displayOrder: records.length + 1,
      publicVisible: false
    };
    setRecords((current) => [...current, property]);
    setSelectedId(id);
    setMessage("New hidden property added. Complete the details before making it public.");
  }

  function duplicateProperty() {
    if (!selected) return;
    const id = nextPropertyId(records);
    const duplicate: PropertyRecord = {
      ...selected,
      id,
      street: `${selected.street} copy`,
      displayOrder: records.length + 1,
      publicVisible: false,
      updatedAt: today()
    };
    setRecords((current) => [...current, duplicate]);
    setSelectedId(id);
    setMessage("Property duplicated as a hidden record.");
  }

  function deleteProperty() {
    if (!selected || !window.confirm(`Delete ${selected.street}?`)) return;
    const next = records.filter((property) => property.id !== selected.id);
    setRecords(next);
    setSelectedId(next[0]?.id ?? "");
    setMessage("Property removed from the unsaved draft.");
  }

  function saveDraft() {
    window.localStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(records));
    setMessage(`Saved ${records.length} property records on this browser.`);
  }

  function resetDraft() {
    if (!window.confirm("Discard this browser draft and restore the published seed inventory?")) return;
    window.localStorage.removeItem(PROPERTY_STORAGE_KEY);
    const restored = cloneSeedData();
    setRecords(restored);
    setSelectedId(restored[0]?.id ?? "");
    setMessage("Published seed inventory restored.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ehs-property-inventory-${today()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage("Property inventory JSON exported.");
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!Array.isArray(parsed) || !parsed.every(isPropertyRecord)) throw new Error("That is not a valid EHS property inventory export.");
      setRecords(parsed);
      setSelectedId(parsed[0]?.id ?? "");
      setMessage(`Imported ${parsed.length} records. Review and save the browser draft.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import that file.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-ehsNavy sm:py-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[2rem] bg-gradient-to-br from-ehsBlack via-ehsNavy to-ehsDeepBlue p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-ehsLightBlue">Internal property workspace</p>
              <h1 className="mt-3 text-3xl font-black sm:text-5xl">Property inventory manager</h1>
              <p className="mt-3 max-w-3xl leading-7 text-white/70">Edit records, control public visibility, sort inventory, and preview the visual property page.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/properties" target="_blank" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-ehsDeepBlue hover:bg-ehsSoftBlue">Open visual preview</Link>
              <button type="button" onClick={saveDraft} className="min-h-12 rounded-full bg-ehsBlue px-5 text-sm font-black text-white hover:bg-ehsMediumBlue">Save on this browser</button>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Records", summary.records],
              ["Publicly visible", summary.public],
              ["Available records", summary.available],
              ["Available homes/sites", summary.units],
              ["Need confirmation", summary.confirm]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-1 text-sm font-bold text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
          <strong>Phase 1:</strong> changes save on this browser and appear in the visual preview on this device. A secure database and staff login are still required before edits are shared with every user.
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mr-auto text-sm font-bold text-slate-600" aria-live="polite">{message}</p>
          <button type="button" onClick={addProperty} className="min-h-11 rounded-full bg-ehsNavy px-4 text-sm font-black text-white">Add property</button>
          <button type="button" onClick={exportJson} className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-black">Export JSON</button>
          <label htmlFor="property-json-import" className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-slate-300 px-4 text-sm font-black">Import JSON</label>
          <input id="property-json-import" type="file" accept="application/json,.json" className="sr-only" onChange={(event) => { void importJson(event.target.files?.[0]); event.currentTarget.value = ""; }} />
          <button type="button" onClick={resetDraft} className="min-h-11 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-800">Reset draft</button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-black">Property records</h2>
              <label className="mt-4 block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Search</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Address, ID, city, or ZIP" className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-ehsBlue focus:ring-4 focus:ring-ehsLightBlue/45" />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Status</span>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PropertyStatus | "All")} className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base">
                    <option value="All">All statuses</option>
                    {propertyStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Sort</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value as ManagerSort)} className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base">
                    <option value="display-order">Display order</option>
                    <option value="address">Street address</option>
                    <option value="city">City</option>
                    <option value="status">Status</option>
                    <option value="units-desc">Most sites first</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="max-h-[920px] overflow-y-auto p-3">
              <div className="grid gap-2">
                {displayedRecords.map((property) => (
                  <button key={property.id} type="button" onClick={() => setSelectedId(property.id)} className={`rounded-2xl border p-4 text-left transition ${selectedId === property.id ? "border-ehsBlue bg-ehsSoftBlue shadow-sm" : "border-slate-200 hover:border-ehsBlue/50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">{property.id} · Order {property.displayOrder}</p>
                        <p className="mt-1 truncate font-black">{property.street}</p>
                        <p className="mt-1 text-sm font-bold text-slate-500">{[property.city, property.state, property.zip].filter(Boolean).join(", ") || "Location incomplete"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${statusStyles[property.status]}`}>{property.status === "Coming Soon / In Progress" ? "In progress" : property.status}</span>
                    </div>
                    <div className="mt-3 flex justify-between text-xs font-bold text-slate-500"><span>{property.units} homes/sites</span><span>{property.publicVisible ? "Public" : "Hidden"}</span></div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg sm:p-7">
            {selected ? (
              <>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-ehsBlue">Editing {selected.id}</p>
                    <h2 className="mt-2 text-2xl font-black">{selected.street}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-500">Last changed {selected.updatedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={duplicateProperty} className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-black">Duplicate</button>
                    <button type="button" onClick={deleteProperty} className="min-h-11 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-800">Delete</button>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label className="md:col-span-2"><span className="text-sm font-black">Street address</span><input value={selected.street} onChange={(event) => updateSelected("street", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label><span className="text-sm font-black">City</span><input value={selected.city} onChange={(event) => updateSelected("city", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <div className="grid grid-cols-[0.65fr_1fr] gap-3">
                    <label><span className="text-sm font-black">State</span><input value={selected.state} onChange={(event) => updateSelected("state", event.target.value.toUpperCase().slice(0, 2))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base uppercase" /></label>
                    <label><span className="text-sm font-black">ZIP</span><input value={selected.zip} onChange={(event) => updateSelected("zip", event.target.value.replace(/[^0-9-]/g, "").slice(0, 10))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  </div>
                  <label><span className="text-sm font-black">Sales status</span><select value={selected.status} onChange={(event) => updateSelected("status", event.target.value as PropertyStatus)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base">{propertyStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                  <label><span className="text-sm font-black">Property type</span><select value={selected.propertyType} onChange={(event) => updateSelected("propertyType", event.target.value as PropertyRecord["propertyType"])} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base">{propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                  <label><span className="text-sm font-black">Homes / sites</span><input type="number" min="0" step="1" value={selected.units} onChange={(event) => updateSelected("units", Math.max(0, Number(event.target.value) || 0))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label><span className="text-sm font-black">Sales price</span><input type="number" min="0" step="1" value={selected.price ?? ""} placeholder="Blank means call for pricing" onChange={(event) => updateSelected("price", event.target.value === "" ? null : Math.max(0, Number(event.target.value) || 0))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label><span className="text-sm font-black">Sales representative</span><input value={selected.salesRep} onChange={(event) => updateSelected("salesRep", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label><span className="text-sm font-black">Display order</span><input type="number" min="1" step="1" value={selected.displayOrder} onChange={(event) => updateSelected("displayOrder", Math.max(1, Number(event.target.value) || 1))} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label className="md:col-span-2"><span className="text-sm font-black">Public description / notes</span><textarea rows={4} value={selected.notes} onChange={(event) => updateSelected("notes", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label><span className="text-sm font-black">Source</span><input value={selected.source} onChange={(event) => updateSelected("source", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base" /></label>
                  <label><span className="text-sm font-black">Record ID</span><input value={selected.id} disabled className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-base font-bold text-slate-500" /></label>
                  <label className="md:col-span-2 flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
                    <span><span className="block font-black">Show on public property page</span><span className="mt-0.5 block text-sm text-slate-500">Keep incomplete or internal-only records hidden.</span></span>
                    <input type="checkbox" checked={selected.publicVisible} onChange={(event) => updateSelected("publicVisible", event.target.checked)} className="h-6 w-6 accent-[#1688C9]" />
                  </label>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                  <p className="text-sm font-bold text-slate-500">Changes are retained after you save the browser draft.</p>
                  <button type="button" onClick={saveDraft} className="min-h-12 rounded-full bg-ehsBlue px-6 text-sm font-black text-white">Save draft</button>
                </div>
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center text-center"><div><p className="text-2xl font-black">No property selected</p><p className="mt-2 text-slate-500">Choose a record or add a new property.</p></div></div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
