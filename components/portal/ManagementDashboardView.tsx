'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import type {
  DashboardAlert,
  DashboardSourceHealth,
  DashboardStageValue,
  DashboardTrendPoint,
  ManagementOverview,
} from '@/types/management';

const PALETTE = ['#0B4F86', '#1E6FA8', '#0284C7', '#10B981', '#F59E0B', '#EF4444', '#64748B', '#8B5CF6'];

function currency(value: number | null, compact = true) {
  if (value === null) return 'No data';
  if (!Number.isFinite(value)) return 'No data';
  if (compact && Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`;
  if (compact && Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function number(value: number | null) {
  return value === null || !Number.isFinite(value) ? '—' : value.toLocaleString();
}

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sourceStatusLabel(sources: DashboardSourceHealth) {
  const values = Object.values(sources);
  const failures = values.filter((value) => value === 'error').length;
  if (failures === 0) return { label: 'All systems reporting', tone: 'emerald' };
  return { label: `${failures} source${failures === 1 ? '' : 's'} degraded`, tone: 'amber' };
}

function KpiCard({
  label,
  value,
  detail,
  href,
  accent = 'navy',
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  accent?: 'navy' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
}) {
  const styles = {
    navy: 'from-[#0B1E38] to-[#0F2A47] text-white',
    blue: 'from-[#0B4F86] to-[#1E6FA8] text-white',
    emerald: 'from-emerald-600 to-emerald-500 text-white',
    amber: 'from-amber-500 to-orange-500 text-white',
    rose: 'from-rose-600 to-rose-500 text-white',
    violet: 'from-violet-600 to-indigo-500 text-white',
  }[accent];

  return (
    <Link href={href} className={`group min-h-[128px] rounded-2xl bg-gradient-to-br ${styles} p-4 shadow-sm transition-transform hover:-translate-y-0.5`}>
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">{label}</div>
      <div className="mt-3 truncate text-2xl font-black tracking-tight sm:text-3xl">{value}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-semibold text-white/75">
        <span className="truncate">{detail}</span>
        <span className="opacity-70 transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

function Gauge({ value, label, detail }: { value: number | null; label: string; detail: string }) {
  const safe = value === null ? 0 : Math.max(0, Math.min(100, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (safe / 100);
  const tone = safe >= 75 ? '#10B981' : safe >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-2 flex items-center justify-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={value === null ? '#CBD5E1' : tone}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-black text-[#0B1E38]">{value === null ? '—' : `${safe}%`}</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Current</div>
          </div>
        </div>
      </div>
      <div className="text-center text-[11px] font-semibold text-slate-500">{detail}</div>
    </div>
  );
}

function FunnelChart({ ready, stages }: { ready: number | null; stages: DashboardStageValue[] }) {
  const values = [
    { label: 'Ready to Quote', count: ready ?? 0 },
    ...stages.map((stage) => ({ label: stage.label, count: stage.count })),
  ];
  const max = Math.max(1, ...values.map((item) => item.count));

  return (
    <div className="space-y-2.5">
      {values.map((item, index) => {
        const width = Math.max(24, (item.count / max) * 100);
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-right text-[10px] font-bold text-slate-500 sm:w-28">{item.label}</div>
            <div className="flex-1">
              <div
                className="flex h-8 items-center justify-end rounded-lg px-3 text-xs font-black text-white shadow-2xs transition-all"
                style={{ width: `${width}%`, backgroundColor: PALETTE[index % PALETTE.length] }}
              >
                {item.count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({ values, valueMode = 'count' }: { values: DashboardStageValue[]; valueMode?: 'count' | 'value' }) {
  const measured = values.map((item) => valueMode === 'value' ? Number(item.value || 0) : item.count);
  const max = Math.max(1, ...measured);
  return (
    <div className="space-y-3">
      {values.map((item, index) => {
        const measuredValue = valueMode === 'value' ? Number(item.value || 0) : item.count;
        return (
          <div key={item.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 text-slate-700">{valueMode === 'value' ? currency(measuredValue) : measuredValue.toLocaleString()}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${Math.max(measuredValue > 0 ? 4 : 0, (measuredValue / max) * 100)}%`, backgroundColor: PALETTE[index % PALETTE.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ values, centerLabel }: { values: DashboardStageValue[]; centerLabel: string }) {
  const total = values.reduce((sum, item) => sum + item.count, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[170px_1fr]">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="13" />
          {values.map((item, index) => {
            const portion = total > 0 ? item.count / total : 0;
            const dash = portion * circumference;
            const segment = (
              <circle
                key={item.key}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={PALETTE[index % PALETTE.length]}
                strokeWidth="13"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-[#0B1E38]">{total}</div>
          <div className="max-w-[80px] text-[9px] font-black uppercase tracking-wider text-slate-400">{centerLabel}</div>
        </div>
      </div>
      <div className="space-y-2">
        {values.slice(0, 7).map((item, index) => (
          <div key={item.key} className="flex items-center justify-between gap-3 text-[10px] font-bold">
            <span className="flex min-w-0 items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
              <span className="truncate">{titleCase(item.label)}</span>
            </span>
            <span className="text-slate-800">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ points }: { points: DashboardTrendPoint[] }) {
  const width = 520;
  const height = 180;
  const padX = 28;
  const padY = 24;
  const maxValue = Math.max(1, ...points.map((point) => point.value));
  const usableWidth = width - padX * 2;
  const usableHeight = height - padY * 2;
  const coords = points.map((point, index) => ({
    ...point,
    x: padX + (points.length <= 1 ? usableWidth / 2 : (index / (points.length - 1)) * usableWidth),
    y: padY + usableHeight - (point.value / maxValue) * usableHeight,
  }));
  const polyline = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const area = coords.length > 0
    ? `${coords[0].x},${height - padY} ${polyline} ${coords[coords.length - 1].x},${height - padY}`
    : '';

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full overflow-visible">
        {[0.25, 0.5, 0.75].map((level) => (
          <line key={level} x1={padX} x2={width - padX} y1={padY + usableHeight * level} y2={padY + usableHeight * level} stroke="#E2E8F0" strokeDasharray="4 5" />
        ))}
        {area && <polygon points={area} fill="#E0F2FE" opacity="0.7" />}
        {polyline && <polyline points={polyline} fill="none" stroke="#0B4F86" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
        {coords.map((point) => (
          <g key={point.key}>
            <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#0B4F86" strokeWidth="3" />
            <text x={point.x} y={height - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748B">{point.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-slate-400">
        <span>Six-month quote value trend</span>
        <span>{currency(points.reduce((sum, point) => sum + point.value, 0), false)} total</span>
      </div>
    </div>
  );
}

function FinancialBars({ overview }: { overview: ManagementOverview }) {
  const values = [
    { label: 'Retail Value', value: overview.inventory.retailValue || 0, color: '#0B4F86' },
    { label: 'Invoice Value', value: overview.inventory.invoiceValue || 0, color: '#1E6FA8' },
    { label: 'Floorplan Balance', value: overview.inventory.floorplanBalance || 0, color: '#F59E0B' },
  ];
  const max = Math.max(1, ...values.map((item) => item.value));
  return (
    <div className="flex h-52 items-end justify-around gap-4 border-b border-slate-200 px-3 pb-2">
      {values.map((item) => (
        <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end">
          <div className="mb-2 text-center text-[10px] font-black text-slate-700">{currency(item.value)}</div>
          <div className="w-full max-w-16 rounded-t-xl" style={{ height: `${Math.max(item.value > 0 ? 10 : 1, (item.value / max) * 130)}px`, backgroundColor: item.color }} />
          <div className="mt-2 text-center text-[9px] font-bold uppercase leading-tight text-slate-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function AlertTile({ alert }: { alert: DashboardAlert }) {
  const tone = alert.severity === 'critical'
    ? 'border-rose-200 bg-rose-50 text-rose-800'
    : alert.severity === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-sky-200 bg-sky-50 text-sky-900';
  return (
    <Link href={alert.destination} className={`flex min-h-24 items-center justify-between gap-4 rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 ${tone}`}>
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-wider opacity-60">Needs Attention</div>
        <div className="mt-1 text-xs font-black leading-snug">{alert.label}</div>
      </div>
      <div className="shrink-0 text-3xl font-black">{alert.value}</div>
    </Link>
  );
}

function EmptyVisual({ label }: { label: string }) {
  return <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-bold text-slate-400">{label}</div>;
}

export function ManagementDashboardView() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<ManagementOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const allowed = user?.role === 'Admin' || user?.role === 'Manager';

  const load = useCallback(async (background = false) => {
    if (!allowed) return;
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch('/api/portal/management/overview', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success || !payload.overview) {
        throw new Error(payload.error || 'Unable to load management dashboard.');
      }
      setOverview(payload.overview);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load management dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    void load(false);
    const timer = window.setInterval(() => void load(true), 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [allowed, load]);

  const sourceHealth = useMemo(() => overview ? sourceStatusLabel(overview.sources) : null, [overview]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400">Management Access</div>
        <div className="mt-2 text-xl font-black text-[#0B1E38]">This dashboard is restricted to Admin and Manager roles.</div>
      </div>
    );
  }

  if (loading && !overview) {
    return <div className="flex min-h-[50vh] items-center justify-center text-xs font-black uppercase tracking-wider text-slate-400">Building live management view…</div>;
  }

  if (error && !overview) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-bold text-rose-800">
        {error}
        <button type="button" onClick={() => void load(false)} className="ml-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-black text-white">Retry</button>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#081628] via-[#0B1E38] to-[#0B4F86] p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Executive Operations</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Management Command Center</h1>
            <p className="mt-2 max-w-2xl text-xs font-medium text-white/65">Live visual pulse across GHL, quotes, active projects, inventory, properties and permitting.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sourceHealth && <div className={`rounded-full border px-3 py-2 text-[10px] font-black ${sourceHealth.tone === 'emerald' ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/30 bg-amber-400/10 text-amber-200'}`}>{sourceHealth.label}</div>}
            <button type="button" disabled={refreshing} onClick={() => void load(true)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black text-white transition-colors hover:bg-white/15 disabled:opacity-50">{refreshing ? 'Refreshing…' : '↻ Refresh Live Data'}</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-wider text-white/45">
          <span>Updated {new Date(overview.generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          {Object.entries(overview.sources).map(([key, value]) => <span key={key} className={value === 'ok' ? 'text-emerald-300/70' : 'text-amber-300'}>● {key}</span>)}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Ready To Quote" value={number(overview.sales.readyToQuote)} detail="GHL queue" href="/portal?view=ready" accent="blue" />
        <KpiCard label="Quote Pipeline" value={currency(overview.sales.activeQuoteValue)} detail={`${number(overview.sales.activeQuoteCount)} active quotes`} href="/portal?view=library" accent="navy" />
        <KpiCard label="In Contract" value={currency(overview.sales.inContractValue)} detail={`${number(overview.sales.inContractCount)} contracts`} href="/portal?view=library" accent="emerald" />
        <KpiCard label="Active Projects" value={number(overview.projects.active)} detail={`${number(overview.projects.completed)} completed`} href="/portal?view=projects" accent="violet" />
        <KpiCard label="Inventory Units" value={number(overview.inventory.count)} detail={currency(overview.inventory.retailValue)} href="/portal?view=inventory" accent="blue" />
        <KpiCard label="Floorplan Exposure" value={currency(overview.inventory.floorplanBalance)} detail="Financing balance" href="/portal?view=inventory" accent="amber" />
        <KpiCard label="Active Permits" value={number(overview.permitting.active)} detail={`${number(overview.permitting.stale14Days)} stale 14+ days`} href="/portal/amhi" accent={Number(overview.permitting.stale14Days || 0) > 0 ? 'rose' : 'emerald'} />
        <KpiCard label="Available Property" value={number(overview.properties.available)} detail={currency(overview.properties.availableValue)} href="/portal?view=property-packages" accent="navy" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div><div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Sales Flow</div><h2 className="text-base font-black text-[#0B1E38]">Current Pipeline Stage Snapshot</h2></div>
            <div className="text-right"><div className="text-[10px] font-bold text-slate-400">Avg Active Quote</div><div className="text-lg font-black text-[#0B1E38]">{currency(overview.sales.avgActiveQuote)}</div></div>
          </div>
          <FunnelChart ready={overview.sales.readyToQuote} stages={overview.sales.stages} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Gauge value={overview.sales.marginHealthPct} label="Quote Margin Health" detail={overview.sales.marginHealthSample > 0 ? `${overview.sales.marginHealthSample} quotes with recorded EHS take-home checks` : 'No priced quote health data yet'} />
          <Gauge value={overview.projects.averageProgressPct} label="Active Project Progress" detail={overview.projects.active !== null ? `${overview.projects.active} active GHL projects` : 'GHL project feed unavailable'} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-2"><div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Momentum</div><h2 className="text-base font-black text-[#0B1E38]">Quote Value Trend</h2></div>
          {overview.sales.trend.length > 0 ? <LineChart points={overview.sales.trend} /> : <EmptyVisual label="No quote trend data available" />}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black uppercase tracking-wider text-violet-600">Operations</div><h2 className="text-base font-black text-[#0B1E38]">Project Stage Distribution</h2></div><div className="text-right text-[10px] font-bold text-slate-400">{currency(overview.projects.dealValue)} linked value</div></div>
          {overview.projects.stages.length > 0 ? <HorizontalBars values={overview.projects.stages} /> : <EmptyVisual label="No GHL project-stage data available" />}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-2"><div className="text-[10px] font-black uppercase tracking-wider text-amber-600">Capital</div><h2 className="text-base font-black text-[#0B1E38]">Inventory Financial Exposure</h2></div>
          <FinancialBars overview={overview} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-3"><div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Inventory</div><h2 className="text-base font-black text-[#0B1E38]">Home Status Mix</h2></div>
          {overview.inventory.statuses.length > 0 ? <DonutChart values={overview.inventory.statuses} centerLabel="Inventory Homes" /> : <EmptyVisual label="No inventory status data available" />}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-end justify-between"><div><div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Permitting</div><h2 className="text-base font-black text-[#0B1E38]">Permit Stage Mix</h2></div><div className="text-right"><div className="text-[9px] font-bold uppercase text-slate-400">Oldest Active</div><div className="text-lg font-black text-slate-800">{overview.permitting.oldestActiveDays === null ? '—' : `${overview.permitting.oldestActiveDays}d`}</div></div></div>
          {overview.permitting.statuses.length > 0 ? <DonutChart values={overview.permitting.statuses} centerLabel="Permit Jobs" /> : <EmptyVisual label="No permit data available" />}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5"><div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Sales Team</div><h2 className="text-base font-black text-[#0B1E38]">Quote Volume by Consultant</h2></div>
          {overview.sales.reps.length > 0 ? (
            <div className="space-y-3">
              {overview.sales.reps.map((rep, index) => {
                const max = Math.max(1, ...overview.sales.reps.map((item) => item.quoteValue));
                return <div key={rep.name}><div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-bold"><span className="truncate text-slate-600">{rep.name}</span><span className="shrink-0 text-slate-800">{currency(rep.quoteValue)} · {rep.contractCount} contract{rep.contractCount === 1 ? '' : 's'}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${Math.max(rep.quoteValue > 0 ? 4 : 0, rep.quoteValue / max * 100)}%`, backgroundColor: PALETTE[index % PALETTE.length] }} /></div></div>;
              })}
            </div>
          ) : <EmptyVisual label="No consultant quote data available" />}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Land / Packages</div><h2 className="text-base font-black text-[#0B1E38]">Property Status</h2></div><div className="text-right text-[10px] font-bold text-slate-400">{number(overview.properties.publiclyVisible)} public</div></div>
          {overview.properties.statuses.length > 0 ? <HorizontalBars values={overview.properties.statuses} /> : <EmptyVisual label="No property status data available" />}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-wider text-rose-600">Exception Center</div><h2 className="text-base font-black text-[#0B1E38]">Management Attention</h2></div><div className="text-[10px] font-bold text-slate-400">Click any tile to drill in</div></div>
        {overview.alerts.length > 0 ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{overview.alerts.map((alert) => <AlertTile key={alert.id} alert={alert} />)}</div> : <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm font-black text-emerald-800">No management exceptions detected from reporting sources.</div>}
      </section>

      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">Last refresh warning: {error}</div>}
    </div>
  );
}
