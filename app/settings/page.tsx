'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { AuthGate } from '@/components/portal/AuthGate';
import { useAuth } from '@/lib/auth/AuthContext';
import { canAccessSettings } from '@/data/teamMembers';
import { getEffectiveMasterCatalog, type MasterCatalogHome } from '@/data/fullMasterCatalog.generated';

interface SystemCounts {
  properties: number | null;
  quotes: number | null;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalog, setCatalog] = useState<MasterCatalogHome[]>([]);
  const [counts, setCounts] = useState<SystemCounts>({ properties: null, quotes: null });
  const [countsError, setCountsError] = useState<string | null>(null);
  const [isSyncingGhl, setIsSyncingGhl] = useState(false);
  const [ghlCount, setGhlCount] = useState<number | null>(null);
  const [ghlStatus, setGhlStatus] = useState<'unchecked' | 'connected' | 'error'>('unchecked');
  const [ghlMessage, setGhlMessage] = useState<string | null>(null);

  const hasAccess = canAccessSettings(user);

  useEffect(() => {
    setCatalog(getEffectiveMasterCatalog());
  }, []);

  useEffect(() => {
    if (!user || !hasAccess) return;
    let cancelled = false;

    async function loadPermanentCounts() {
      setCountsError(null);
      try {
        const [propertiesResponse, quotesResponse] = await Promise.all([
          fetch('/api/portal/properties', { cache: 'no-store' }),
          fetch('/api/portal/quotes', { cache: 'no-store' }),
        ]);
        const [propertiesData, quotesData] = await Promise.all([
          propertiesResponse.json(),
          quotesResponse.json(),
        ]);
        if (cancelled) return;

        if (!propertiesResponse.ok || !propertiesData.success || !Array.isArray(propertiesData.properties)) {
          throw new Error(propertiesData.error || 'Unable to read permanent property inventory.');
        }
        if (!quotesResponse.ok || !quotesData.success || !Array.isArray(quotesData.quotes)) {
          throw new Error(quotesData.error || 'Unable to read permanent quote library.');
        }

        setCounts({
          properties: propertiesData.properties.length,
          quotes: quotesData.quotes.length,
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Settings permanent-data health check failed:', error);
        setCounts({ properties: null, quotes: null });
        setCountsError(error instanceof Error ? error.message : 'Permanent data health check failed.');
      }
    }

    void loadPermanentCounts();
    return () => {
      cancelled = true;
    };
  }, [user, hasAccess]);

  const manufacturers = useMemo(
    () => [...new Set(catalog.map((home) => home.manufacturer).filter(Boolean))],
    [catalog],
  );

  const handleSyncGhlLeads = async () => {
    setIsSyncingGhl(true);
    setGhlMessage(null);
    try {
      const response = await fetch('/api/portal/ready-to-quote/ghl-sync', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.readyBuyers)) {
        throw new Error(data.error || 'GoHighLevel request failed.');
      }
      const actualCount = Number.isFinite(Number(data.count)) ? Number(data.count) : data.readyBuyers.length;
      setGhlCount(actualCount);
      setGhlStatus('connected');
      setGhlMessage(`Live GoHighLevel check succeeded. ${actualCount} Ready-to-Quote opportunities returned.`);
    } catch (error) {
      console.error('Settings GHL health check failed:', error);
      setGhlCount(null);
      setGhlStatus('error');
      setGhlMessage(error instanceof Error ? error.message : 'Unable to reach GoHighLevel.');
    } finally {
      setIsSyncingGhl(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Checking dealership authorization…</div>;
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
        <PortalSidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          totalPropertiesCount={counts.properties ?? 0}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                aria-label="Open navigation menu"
              >
                ☰
              </button>
              <div>
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1E6FA8]">DEALERSHIP CONFIGURATION</div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1E38] tracking-tight">Settings &amp; System Status</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">Stable baseline controls and live integration health.</p>
              </div>
            </div>
            <Link href="/portal" className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">← Back to dashboard</Link>
          </header>

          {!hasAccess ? (
            <div className="p-8 max-w-2xl mx-auto my-12 w-full text-center">
              <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-2xl mx-auto">🔒</div>
                <h2 className="text-xl font-black text-[#0B1E38]">Management Access Restricted</h2>
                <p className="text-xs text-slate-600 leading-relaxed">Dealership configuration is restricted to Managers and Admins.</p>
                <Link href="/portal" className="inline-flex px-5 py-2.5 bg-[#0B1E38] text-white font-bold rounded-xl text-xs">Return to Quote Dashboard →</Link>
              </div>
            </div>
          ) : (
            <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
              <section className="p-5 sm:p-6 rounded-2xl border border-amber-200 bg-amber-50/70">
                <div className="flex gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <h2 className="font-black text-[#0B1E38]">Baseline stabilization lock</h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      Company-wide configuration editing is intentionally frozen while the permanent platform is stabilized. The former Settings controls changed browser-only state while appearing to save globally. Those controls will be redesigned after the baseline is merged and the EHS operating-model workshop is complete.
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Permanent Properties</span>
                  <div className="mt-2 text-3xl font-black text-[#0B1E38]">{counts.properties ?? '—'}</div>
                  <p className="mt-1 text-[11px] text-slate-500">Mongo-backed records only</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Permanent Quotes</span>
                  <div className="mt-2 text-3xl font-black text-[#0B1E38]">{counts.quotes ?? '—'}</div>
                  <p className="mt-1 text-[11px] text-slate-500">Mongo-backed records only</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verified Catalog</span>
                  <div className="mt-2 text-3xl font-black text-[#0B1E38]">{catalog.length}</div>
                  <p className="mt-1 text-[11px] text-slate-500">{manufacturers.length} manufacturers loaded</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">GHL Ready to Quote</span>
                  <div className="mt-2 text-3xl font-black text-[#0B1E38]">{ghlCount ?? '—'}</div>
                  <p className="mt-1 text-[11px] text-slate-500">Live value after connection check</p>
                </div>
              </section>

              {countsError && (
                <div role="alert" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-800">Permanent data check failed: {countsError}</div>
              )}

              <section className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">CRM INTEGRATION</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ghlStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ghlStatus === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {ghlStatus === 'connected' ? 'Live connection verified' : ghlStatus === 'error' ? 'Connection error' : 'Not checked this session'}
                      </span>
                    </div>
                    <h2 className="mt-1 text-lg font-black text-[#0B1E38]">GoHighLevel Opportunity Connection</h2>
                    <p className="text-xs text-slate-500">Runs the same real GHL Ready-to-Quote query used by the portal. No simulated success or hard-coded counts.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncGhlLeads}
                    disabled={isSyncingGhl}
                    className="px-5 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    {isSyncingGhl ? 'Checking GHL…' : 'Run Live GHL Check'}
                  </button>
                </div>
                {ghlMessage && (
                  <div role="status" className={`p-4 rounded-xl border text-xs font-bold ${ghlStatus === 'connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {ghlMessage}
                  </div>
                )}
              </section>

              <section className="grid lg:grid-cols-2 gap-5">
                <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">CURRENT QUOTE BASELINE</span>
                  <h2 className="mt-1 text-lg font-black text-[#0B1E38]">ERP V05 Pricing Rules</h2>
                  <div className="mt-4 divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between"><span className="text-slate-600">Florida sales tax</span><strong>3.00%</strong></div>
                    <div className="py-2.5 flex justify-between"><span className="text-slate-600">Internal admin fee</span><strong>5.00%</strong></div>
                    <div className="py-2.5 flex justify-between"><span className="text-slate-600">Sales commission</span><strong>20% of commissionable house margin</strong></div>
                    <div className="py-2.5 flex justify-between"><span className="text-slate-600">Net take-home indicator</span><strong>$20,000</strong></div>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">Read-only during stabilization so browser-local edits cannot diverge from permanent quote calculations.</p>
                </div>

                <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">EMPLOYEE ACCESS</span>
                  <h2 className="mt-1 text-lg font-black text-[#0B1E38]">Permanent Authentication Active</h2>
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div><strong>Signed in:</strong> {user?.name || user?.email}</div>
                    <div><strong>Role:</strong> {user?.role}</div>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">Employee add/edit controls are frozen here during stabilization. Existing accounts continue to authenticate against the permanent EHS database.</p>
                </div>
              </section>

              <section className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">HOME CATALOG</span>
                    <h2 className="mt-1 text-lg font-black text-[#0B1E38]">Current Catalog Snapshot</h2>
                    <p className="text-xs text-slate-500">Read-only confirmation of the catalog currently used by the quote interface.</p>
                  </div>
                  <div className="text-xs font-bold text-slate-600">{catalog.length} models · {manufacturers.length} manufacturers</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {manufacturers.map((manufacturer) => (
                    <span key={manufacturer} className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">{manufacturer}</span>
                  ))}
                </div>
              </section>
            </main>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
