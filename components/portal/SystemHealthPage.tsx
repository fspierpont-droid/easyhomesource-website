'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/portal/AuthGate';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { useAuth } from '@/lib/auth/AuthContext';

type SystemCheck = {
  ok: boolean;
  service: string;
  database?: string | null;
  collection_counts: Record<string, number>;
};

type AuditItem = {
  audit_id?: string;
  timestamp?: string;
  action?: string;
  actor_email?: string | null;
  target_user_id?: string | null;
  success?: boolean;
  reason?: string | null;
};

type AuditPayload = {
  items: AuditItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type AiStatus = {
  provider: string;
  model: string;
  configured: boolean;
  paidFallbackEnabled: boolean;
};

const PAGE_SIZE = 25;

function formatTimestamp(value?: string) {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function actionLabel(value?: string) {
  if (!value) return 'System activity';
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SystemHealthPage() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === 'Admin';

  const [system, setSystem] = useState<SystemCheck | null>(null);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [activePropertyCount, setActivePropertyCount] = useState<number | null>(null);

  const [audit, setAudit] = useState<AuditPayload>({ items: [], total: 0, page: 1, page_size: PAGE_SIZE, total_pages: 1 });
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState<'all' | 'true' | 'false'>('all');

  const [ghl, setGhl] = useState<{ ok: boolean; message: string } | null>(null);
  const [ghlChecking, setGhlChecking] = useState(false);
  const [ai, setAi] = useState<AiStatus | null>(null);

  const loadSystem = useCallback(async () => {
    if (!isAdmin) return;
    setSystemLoading(true);
    setSystemError(null);
    try {
      const response = await fetch('/api/portal/admin/system-check', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.system?.ok) throw new Error(data.error || 'Unable to read system health.');
      setSystem(data.system);

      try {
        const propertyResponse = await fetch('/api/portal/properties/stats', { cache: 'no-store' });
        const propertyData = await propertyResponse.json().catch(() => ({}));
        if (!propertyResponse.ok || !propertyData.success || !propertyData.stats) {
          throw new Error(propertyData.error || 'Unable to read active property statistics.');
        }
        setActivePropertyCount(Number(propertyData.stats.totalProperties) || 0);
      } catch {
        setActivePropertyCount(null);
      }
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : 'Unable to read system health.');
      setSystem(null);
      setActivePropertyCount(null);
    } finally {
      setSystemLoading(false);
    }
  }, [isAdmin]);

  const loadAudit = useCallback(async () => {
    if (!isAdmin) return;
    setAuditLoading(true);
    setAuditError(null);
    try {
      const params = new URLSearchParams({ page: String(auditPage), page_size: String(PAGE_SIZE) });
      if (actionFilter) params.set('action', actionFilter);
      if (successFilter !== 'all') params.set('success', successFilter);
      const response = await fetch(`/api/portal/admin/audit-logs?${params.toString()}`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.items)) throw new Error(data.error || 'Unable to load activity.');
      setAudit({
        items: data.items,
        total: Number(data.total) || 0,
        page: Number(data.page) || 1,
        page_size: Number(data.page_size) || PAGE_SIZE,
        total_pages: Math.max(1, Number(data.total_pages) || 1),
      });
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : 'Unable to load activity.');
    } finally {
      setAuditLoading(false);
    }
  }, [isAdmin, auditPage, actionFilter, successFilter]);

  const loadAi = useCallback(async () => {
    try {
      const response = await fetch('/api/portal/admin/ai-status', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setAi({
          provider: String(data.provider || 'Cloudflare Workers AI'),
          model: String(data.model || ''),
          configured: Boolean(data.configured),
          paidFallbackEnabled: Boolean(data.paidFallbackEnabled),
        });
      }
    } catch {
      setAi(null);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadSystem();
    void loadAi();
  }, [isAdmin, loadSystem, loadAi]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadAudit();
  }, [isAdmin, loadAudit]);

  async function checkGhl() {
    setGhlChecking(true);
    setGhl(null);
    try {
      const response = await fetch('/api/portal/ready-to-quote/ghl-sync', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.readyBuyers)) throw new Error(data.error || 'GHL check failed.');
      const count = Number.isFinite(Number(data.count)) ? Number(data.count) : data.readyBuyers.length;
      setGhl({ ok: true, message: `${count} Ready-to-Quote opportunit${count === 1 ? 'y' : 'ies'} returned.` });
    } catch (error) {
      setGhl({ ok: false, message: error instanceof Error ? error.message : 'GHL check failed.' });
    } finally {
      setGhlChecking(false);
    }
  }

  const counts = system?.collection_counts || {};
  const countCards = useMemo(() => {
    const totalPropertyRecords = typeof counts.properties === 'number' ? counts.properties : undefined;
    const activeProperties = activePropertyCount === null ? undefined : activePropertyCount;
    const archivedProperties =
      typeof totalPropertyRecords === 'number' && typeof activeProperties === 'number'
        ? Math.max(0, totalPropertyRecords - activeProperties)
        : undefined;

    return [
      ['Employees', counts.users],
      ['Current Quotes', counts.quotes],
      ['Historical Quotes', counts.legacy_quotes],
      ['Home Inventory', counts.home_inventory],
      ['Property Records', totalPropertyRecords],
      ['Active Properties', activeProperties],
      ['Archived Properties', archivedProperties],
      ['Permit Jobs', counts.permit_jobs],
    ] as Array<[string, number | undefined]>;
  }, [activePropertyCount, counts]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Checking system access…</div>;
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
        <PortalSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100" aria-label="Open navigation">☰</button>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6FA8]">Diagnostics</div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1E38]">System Health</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Live platform status and bounded audit activity.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" className="px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-bold">Settings</Link>
              <button type="button" onClick={() => { void loadSystem(); void loadAudit(); void loadAi(); }} disabled={systemLoading || auditLoading} className="px-3.5 py-2 rounded-xl bg-[#0B1E38] text-white text-xs font-bold disabled:opacity-50">Refresh</button>
            </div>
          </header>

          {!isAdmin ? (
            <main className="p-6 sm:p-10 max-w-2xl w-full mx-auto">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-black text-[#0B1E38]">Admin Access Required</h2>
                <p className="mt-2 text-sm text-slate-600">System diagnostics and audit activity are restricted to Admins.</p>
              </div>
            </main>
          ) : (
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
              <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <HealthCard title="Permanent API" status={system?.ok ? 'healthy' : systemError ? 'error' : 'unknown'} detail={system?.ok ? `${system.service} · ${system.database || 'database connected'}` : systemError || 'Checking…'} />
                <HealthCard title="GoHighLevel" status={ghl ? (ghl.ok ? 'healthy' : 'error') : 'unknown'} detail={ghl?.message || 'Run a live opportunity query to verify.'} action={ghlChecking ? 'Checking…' : 'Run GHL Check'} onAction={checkGhl} disabled={ghlChecking} />
                <HealthCard title="Website AI" status={ai?.configured ? 'healthy' : ai ? 'warning' : 'unknown'} detail={ai ? `${ai.provider} · ${ai.configured ? 'configured' : 'credentials missing'} · paid fallback ${ai.paidFallbackEnabled ? 'enabled' : 'off'}` : 'Checking…'} />
              </section>

              {systemError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">{systemError}</div>}

              <section>
                <div className="flex items-end justify-between gap-3 mb-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Permanent Database</div>
                    <h2 className="text-lg font-black text-[#0B1E38]">Record Counts</h2>
                    <p className="mt-1 text-xs text-slate-500">Collection totals include archived history. Property records are split below into active and archived counts.</p>
                  </div>
                  {systemLoading && <span className="text-xs text-slate-400">Refreshing…</span>}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {countCards.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
                      <div className="mt-1 text-2xl font-black text-[#0B1E38]">{typeof value === 'number' ? value.toLocaleString() : '—'}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Audit Trail</div>
                  <h2 className="mt-1 text-xl font-black text-[#0B1E38]">System Activity</h2>
                  <p className="mt-1 text-xs text-slate-500">Newest first. The backend returns only {PAGE_SIZE} rows per page.</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <select value={actionFilter} onChange={(event) => { setActionFilter(event.target.value); setAuditPage(1); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm">
                      <option value="">All actions</option>
                      <option value="login_attempt">Login attempts</option>
                      <option value="password_change">Password changes</option>
                      <option value="user_created">Users created</option>
                      <option value="user_updated">Users updated</option>
                    </select>
                    <select value={successFilter} onChange={(event) => { setSuccessFilter(event.target.value as typeof successFilter); setAuditPage(1); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm">
                      <option value="all">All results</option>
                      <option value="true">Success only</option>
                      <option value="false">Failed only</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {auditError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">{auditError}</div> : auditLoading ? <div className="py-10 text-center text-xs font-bold text-slate-400">Loading activity…</div> : (
                    <>
                      <div className="space-y-2">
                        {audit.items.map((item, index) => (
                          <div key={item.audit_id || `${item.timestamp}-${index}`} className="rounded-2xl border border-slate-200 p-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-black text-[#0B1E38]">{actionLabel(item.action)}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.success === false ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{item.success === false ? 'Failed' : 'Success'}</span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500 break-words">{item.actor_email || 'System'}{item.reason ? ` · ${item.reason}` : ''}</div>
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400 sm:text-right">{formatTimestamp(item.timestamp)}</div>
                          </div>
                        ))}
                        {!audit.items.length && <div className="py-10 text-center text-sm text-slate-500">No activity matches these filters.</div>}
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs text-slate-500">Showing {audit.total ? (audit.page - 1) * audit.page_size + 1 : 0}–{Math.min(audit.page * audit.page_size, audit.total)} of {audit.total.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                          <button type="button" disabled={auditPage <= 1} onClick={() => setAuditPage((value) => Math.max(1, value - 1))} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40">Previous</button>
                          <span className="text-xs font-bold text-slate-600">Page {audit.page} of {audit.total_pages}</span>
                          <button type="button" disabled={auditPage >= audit.total_pages} onClick={() => setAuditPage((value) => Math.min(audit.total_pages, value + 1))} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40">Next</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </main>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function HealthCard({ title, status, detail, action, onAction, disabled = false }: {
  title: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  detail: string;
  action?: string;
  onAction?: () => void;
  disabled?: boolean;
}) {
  const dot = status === 'healthy' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : status === 'error' ? 'bg-rose-500' : 'bg-slate-300';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${dot}`} /><span className="text-sm font-black text-[#0B1E38]">{title}</span></div>
      <p className="mt-2 text-xs leading-5 text-slate-500 break-words">{detail}</p>
      {action && onAction && <button type="button" onClick={onAction} disabled={disabled} className="mt-3 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold disabled:opacity-50">{action}</button>}
    </div>
  );
}
