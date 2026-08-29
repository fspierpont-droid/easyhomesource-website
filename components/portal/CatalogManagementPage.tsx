'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/portal/AuthGate';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { homes as publicHomes, type Home } from '@/data/homes';
import {
  FULL_MASTER_CATALOG_HOMES,
  type MasterCatalogHome,
} from '@/data/fullMasterCatalog.generated';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  applyMasterCatalogOverrides,
  catalogOverrideKey,
  findPublicCatalogMatch,
  type CatalogOverride,
} from '@/lib/catalog/catalogAuthority';

const PAGE_SIZE = 25;

type EditorState = {
  hudBasePrice: string;
  estFactoryCost: string;
  msrp: string;
  ehsPrice: string;
  publicStartingPrice: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  width: string;
  length: string;
  dimensions: string;
  quoteEnabled: boolean;
  publicEnabled: boolean;
  publicStatus: Home['status'];
  isOnDisplay: boolean;
  note: string;
};

function money(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function numeric(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formFor(
  home: MasterCatalogHome,
  publicMatch: Home | null,
  override: CatalogOverride | null,
): EditorState {
  const value = <T,>(overrideValue: T | null | undefined, fallback: T | null | undefined) =>
    overrideValue == null ? fallback : overrideValue;

  return {
    hudBasePrice: String(value(override?.hud_base_price, home.hudBasePrice) ?? ''),
    estFactoryCost: String(value(override?.est_factory_cost, home.estFactoryCost) ?? ''),
    msrp: String(value(override?.msrp, home.msrp) ?? ''),
    ehsPrice: String(value(override?.ehs_price, home.ehsPrice) ?? ''),
    publicStartingPrice: String(value(override?.starting_price, publicMatch?.startingPrice ?? home.startingPrice) ?? ''),
    bedrooms: String(value(override?.bedrooms, home.bedrooms) ?? ''),
    bathrooms: String(value(override?.bathrooms, home.bathrooms) ?? ''),
    squareFeet: String(value(override?.square_feet, home.squareFeet) ?? ''),
    width: String(value(override?.width, home.width) ?? ''),
    length: String(value(override?.length, home.length) ?? ''),
    dimensions: String(value(override?.dimensions, home.dimensions) ?? ''),
    quoteEnabled: override?.quote_enabled ?? true,
    publicEnabled: publicMatch ? (override?.public_enabled ?? true) : false,
    publicStatus: override?.public_status ?? publicMatch?.status ?? 'Available',
    isOnDisplay: override?.is_on_display ?? publicMatch?.isOnDisplay ?? false,
    note: override?.note ?? '',
  };
}

export function CatalogManagementPage() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overrides, setOverrides] = useState<CatalogOverride[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [manufacturer, setManufacturer] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MasterCatalogHome | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const isAdmin = user?.role === 'Admin';

  async function loadOverrides() {
    setLoadState('loading');
    setLoadError('');
    try {
      const response = await fetch('/api/portal/catalog/overrides', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.overrides)) {
        throw new Error(data.error || 'Unable to load permanent catalog changes.');
      }
      setOverrides(data.overrides as CatalogOverride[]);
      setLoadState('ready');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load permanent catalog changes.');
      setLoadState('error');
    }
  }

  useEffect(() => {
    if (!loading && isAdmin) void loadOverrides();
    if (!loading && !isAdmin) setLoadState('ready');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAdmin]);

  const effectiveCatalog = useMemo(
    () => applyMasterCatalogOverrides(FULL_MASTER_CATALOG_HOMES, overrides),
    [overrides],
  );

  const manufacturers = useMemo(
    () => Array.from(new Set(FULL_MASTER_CATALOG_HOMES.map((home) => home.manufacturer))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return FULL_MASTER_CATALOG_HOMES.filter((home) => {
      if (manufacturer !== 'ALL' && home.manufacturer !== manufacturer) return false;
      if (!needle) return true;
      return [home.name, home.manufacturer, home.series, home.slug]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [manufacturer, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleHomes = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, manufacturer]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function overrideFor(home: MasterCatalogHome) {
    return overrides.find((item) => item.quote_slug === home.slug) || null;
  }

  function openEditor(home: MasterCatalogHome) {
    const publicMatch = findPublicCatalogMatch(home, publicHomes);
    const override = overrideFor(home);
    setSelected(home);
    setEditor(formFor(home, publicMatch, override));
    setMessage(null);
  }

  function closeEditor() {
    setSelected(null);
    setEditor(null);
    setMessage(null);
  }

  async function saveOverride(event: FormEvent) {
    event.preventDefault();
    if (!selected || !editor || saving) return;

    const publicMatch = findPublicCatalogMatch(selected, publicHomes);
    const key = catalogOverrideKey(selected.slug, publicMatch?.slug);
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        quote_slug: selected.slug,
        public_slug: publicMatch?.slug || null,
        name: selected.name,
        manufacturer: selected.manufacturer,
        quote_enabled: editor.quoteEnabled,
        ...(publicMatch ? {
          public_enabled: editor.publicEnabled,
          public_status: editor.publicStatus,
          is_on_display: editor.isOnDisplay,
        } : {}),
        hud_base_price: numeric(editor.hudBasePrice),
        est_factory_cost: numeric(editor.estFactoryCost),
        msrp: numeric(editor.msrp),
        ehs_price: numeric(editor.ehsPrice),
        ...(publicMatch ? { starting_price: numeric(editor.publicStartingPrice) } : {}),
        bedrooms: numeric(editor.bedrooms),
        bathrooms: numeric(editor.bathrooms),
        square_feet: numeric(editor.squareFeet),
        width: numeric(editor.width),
        length: numeric(editor.length),
        dimensions: editor.dimensions.trim() || null,
        note: editor.note.trim() || null,
      };

      const response = await fetch(`/api/portal/admin/catalog-overrides/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.override) {
        throw new Error(data.error || 'Unable to save catalog change.');
      }

      setOverrides((current) => [
        ...current.filter((item) => item.catalog_key !== key && item.quote_slug !== selected.slug),
        data.override as CatalogOverride,
      ]);
      setMessage({
        ok: true,
        text: 'Saved. Quote Builder uses this change on next open; the website and AI refresh within about 60 seconds.',
      });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : 'Unable to save catalog change.' });
    } finally {
      setSaving(false);
    }
  }

  async function resetOverride() {
    if (!selected || saving) return;
    const publicMatch = findPublicCatalogMatch(selected, publicHomes);
    const existing = overrideFor(selected);
    if (!existing) {
      setEditor(formFor(selected, publicMatch, null));
      setMessage({ ok: true, text: 'This home is already using the verified baseline.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/portal/admin/catalog-overrides/${encodeURIComponent(existing.catalog_key)}`,
        { method: 'DELETE' },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to reset catalog change.');
      }
      setOverrides((current) => current.filter((item) => item.catalog_key !== existing.catalog_key));
      setEditor(formFor(selected, publicMatch, null));
      setMessage({
        ok: true,
        text: 'Reset to the verified repository baseline. The public catalog will refresh within about 60 seconds.',
      });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : 'Unable to reset catalog change.' });
    } finally {
      setSaving(false);
    }
  }

  if (!loading && !isAdmin) {
    return (
      <AuthGate>
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-6 text-sm font-bold text-rose-700 shadow-sm">
            Admin access is required for Catalog Management.
          </div>
        </div>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <PortalSidebar
          activeNav="catalog-management"
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 shadow-xs sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                  <Link href="/settings" className="hover:underline">Settings</Link>
                  <span className="text-slate-300">/</span>
                  <span>Catalog Management</span>
                </div>
                <h1 className="mt-1 text-xl font-black text-[#0B1E38]">Catalog Management</h1>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">Permanent overrides on top of the verified EHS catalog baseline.</p>
              </div>
              <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold lg:hidden">Menu</button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <Stat label="Verified quote homes" value={FULL_MASTER_CATALOG_HOMES.length} />
              <Stat label="Permanent overrides" value={overrides.length} />
              <Stat label="Effective quote homes" value={effectiveCatalog.length} />
            </div>

            <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs leading-5 text-sky-950">
              <strong>One authority, safe fallback:</strong> catalog changes saved here are stored permanently in Mongo. Quote Builder reads internal pricing and factory cost; the public website and AI receive only public-safe fields. If the override service is unavailable, EHS falls back to the verified repository catalog. Names and manufacturers remain locked in this first release to protect model/URL mapping.
            </div>

            {loadState === 'error' && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
                {loadError} <button type="button" onClick={() => void loadOverrides()} className="ml-2 underline">Retry</button>
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-4">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_260px]">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search home, series, manufacturer…"
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E6FA8]"
                  />
                  <select
                    value={manufacturer}
                    onChange={(event) => setManufacturer(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold"
                  >
                    <option value="ALL">All manufacturers</option>
                    {manufacturers.map((maker) => <option key={maker} value={maker}>{maker}</option>)}
                  </select>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-slate-500">{filtered.length.toLocaleString()} matching homes · {PAGE_SIZE} per page</div>
              </div>

              {loadState === 'loading' ? (
                <div className="p-8 text-center text-sm font-bold text-slate-500">Loading permanent catalog state…</div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Home</th>
                          <th className="px-4 py-3">Series</th>
                          <th className="px-4 py-3">MSRP</th>
                          <th className="px-4 py-3">EHS Price</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleHomes.map((home) => {
                          const effective = effectiveCatalog.find((item) => item.slug === home.slug) || home;
                          const changed = Boolean(overrideFor(home));
                          const publicMatch = findPublicCatalogMatch(home, publicHomes);
                          return (
                            <tr key={home.slug} className="border-t border-slate-100">
                              <td className="px-4 py-3"><div className="font-black text-slate-900">{home.name}</div><div className="mt-0.5 text-[10px] font-semibold text-slate-500">{home.manufacturer}</div></td>
                              <td className="px-4 py-3 font-semibold text-slate-600">{home.series || '—'}</td>
                              <td className="px-4 py-3 font-bold text-slate-700">{money(effective.msrp)}</td>
                              <td className="px-4 py-3 font-black text-[#0B4F86]">{money(effective.ehsPrice)}</td>
                              <td className="px-4 py-3"><div className="flex flex-wrap gap-1"><Badge text={changed ? 'Override' : 'Baseline'} tone={changed ? 'amber' : 'slate'} />{publicMatch && <Badge text="Website" tone="blue" />}</div></td>
                              <td className="px-4 py-3 text-right"><button type="button" onClick={() => openEditor(home)} className="rounded-lg bg-[#0B1E38] px-3 py-2 font-black text-white hover:bg-[#16395f]">Edit</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-slate-100 md:hidden">
                    {visibleHomes.map((home) => {
                      const effective = effectiveCatalog.find((item) => item.slug === home.slug) || home;
                      return (
                        <button key={home.slug} type="button" onClick={() => openEditor(home)} className="block w-full p-4 text-left hover:bg-slate-50">
                          <div className="flex items-start justify-between gap-3"><div><div className="font-black text-slate-900">{home.name}</div><div className="text-[11px] font-semibold text-slate-500">{home.manufacturer} · {home.series}</div></div>{overrideFor(home) && <Badge text="Override" tone="amber" />}</div>
                          <div className="mt-2 flex gap-4 text-xs"><span>MSRP <strong>{money(effective.msrp)}</strong></span><span>EHS <strong className="text-[#0B4F86]">{money(effective.ehsPrice)}</strong></span></div>
                        </button>
                      );
                    })}
                  </div>

                  {visibleHomes.length === 0 && <div className="p-8 text-center text-sm font-bold text-slate-500">No homes match this search.</div>}

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs font-bold text-slate-600">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Previous</button>
                    <span>Page {page} of {pageCount}</span>
                    <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>

        {selected && editor && (
          <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/45" onMouseDown={(event) => { if (event.currentTarget === event.target) closeEditor(); }}>
            <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
              <form onSubmit={saveOverride} className="min-h-full">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
                  <div><div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Catalog record</div><h2 className="mt-1 text-xl font-black text-[#0B1E38]">{selected.name}</h2><p className="text-xs font-semibold text-slate-500">{selected.manufacturer} · {selected.series}</p></div>
                  <button type="button" onClick={closeEditor} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">Close</button>
                </div>

                <div className="space-y-6 p-5">
                  {message && <div className={`rounded-xl border p-3 text-xs font-bold ${message.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{message.text}</div>}

                  <section>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Internal pricing authority</h3>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">Factory cost stays inside the authenticated portal and is never returned by the public catalog API.</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <NumberField label="Base Price List" value={editor.hudBasePrice} onChange={(value) => setEditor({ ...editor, hudBasePrice: value })} />
                      <NumberField label="Factory / Estimated Cost" value={editor.estFactoryCost} onChange={(value) => setEditor({ ...editor, estFactoryCost: value })} />
                      <NumberField label="MSRP" value={editor.msrp} onChange={(value) => setEditor({ ...editor, msrp: value })} />
                      <NumberField label="EHS Price" value={editor.ehsPrice} onChange={(value) => setEditor({ ...editor, ehsPrice: value })} />
                    </div>
                  </section>

                  <section className="border-t border-slate-200 pt-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Home specifications</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <NumberField label="Bedrooms" value={editor.bedrooms} onChange={(value) => setEditor({ ...editor, bedrooms: value })} step="1" />
                      <NumberField label="Bathrooms" value={editor.bathrooms} onChange={(value) => setEditor({ ...editor, bathrooms: value })} step="0.5" />
                      <NumberField label="Square Feet" value={editor.squareFeet} onChange={(value) => setEditor({ ...editor, squareFeet: value })} step="1" />
                      <NumberField label="Width" value={editor.width} onChange={(value) => setEditor({ ...editor, width: value })} />
                      <NumberField label="Length" value={editor.length} onChange={(value) => setEditor({ ...editor, length: value })} />
                      <label className="text-xs font-bold text-slate-700">Dimensions<input value={editor.dimensions} onChange={(event) => setEditor({ ...editor, dimensions: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                    </div>
                  </section>

                  <section className="border-t border-slate-200 pt-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Visibility</h3>
                    <div className="mt-3 grid gap-3">
                      <Toggle label="Available in Quote Builder" checked={editor.quoteEnabled} onChange={(checked) => setEditor({ ...editor, quoteEnabled: checked })} />
                      {findPublicCatalogMatch(selected, publicHomes) ? (
                        <>
                          <Toggle label="Visible on public website / AI" checked={editor.publicEnabled} onChange={(checked) => setEditor({ ...editor, publicEnabled: checked })} />
                          <Toggle label="On display in Brooksville" checked={editor.isOnDisplay} onChange={(checked) => setEditor({ ...editor, isOnDisplay: checked })} />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <NumberField label="Public Starting Price" value={editor.publicStartingPrice} onChange={(value) => setEditor({ ...editor, publicStartingPrice: value })} />
                            <label className="text-xs font-bold text-slate-700">Public Status<select value={editor.publicStatus} onChange={(event) => setEditor({ ...editor, publicStatus: event.target.value as Home['status'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"><option>Available</option><option>Coming Soon</option><option>Sold</option></select></label>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-600">No verified public website record is mapped to this Master Quote home yet. Internal quote pricing/spec overrides are still safe to use.</div>
                      )}
                    </div>
                  </section>

                  <section className="border-t border-slate-200 pt-5">
                    <label className="text-xs font-bold text-slate-700">Internal change note<textarea value={editor.note} onChange={(event) => setEditor({ ...editor, note: event.target.value })} rows={3} placeholder="Optional reason/source for this change" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                  </section>
                </div>

                <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
                  <button type="button" onClick={() => void resetOverride()} disabled={saving} className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-700 disabled:opacity-50">Reset to Verified Baseline</button>
                  <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm disabled:opacity-50">{saving ? 'Saving…' : 'Save Catalog Change'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-2xl font-black text-[#0B1E38]">{value.toLocaleString()}</div></div>;
}

function Badge({ text, tone }: { text: string; tone: 'amber' | 'blue' | 'slate' }) {
  const classes = tone === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-800' : tone === 'blue' ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-50 text-slate-600';
  return <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${classes}`}>{text}</span>;
}

function NumberField({ label, value, onChange, step = '0.01' }: { label: string; value: string; onChange: (value: string) => void; step?: string }) {
  return <label className="text-xs font-bold text-slate-700">{label}<input type="number" min="0" step={step} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-700"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#1E6FA8]" /></label>;
}
