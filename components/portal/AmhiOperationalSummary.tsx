'use client';

import { useEffect, useMemo, useState } from 'react';
import { PERMIT_PORTAL_COVERAGE } from '@/data/permitPortalCoverage';

interface PermitSummaryJob {
  id: string;
  customer_name?: string;
  project_name?: string;
  address: string;
  county: string;
  status: string;
  permit_number?: string;
  external_status?: string;
  external_status_detail?: string;
  next_action?: string;
}

function needsAttention(job: PermitSummaryJob) {
  const status = `${job.status} ${job.external_status || ''} ${job.external_status_detail || ''}`.toLowerCase();
  return (
    job.status === 'Corrections' ||
    job.status === 'On Hold' ||
    status.includes('document') ||
    status.includes('incomplete') ||
    status.includes('hold')
  );
}

function permitLabel(job: PermitSummaryJob) {
  return job.customer_name || job.project_name || job.address;
}

function badgeClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('hold') || normalized.includes('correction') || normalized.includes('incomplete')) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  if (normalized.includes('inspection') || normalized.includes('issued') || normalized.includes('active')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export function AmhiOperationalSummary() {
  const [jobs, setJobs] = useState<PermitSummaryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch('/api/portal/permitting/jobs', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => []);
        if (!response.ok) throw new Error(payload?.detail || 'Unable to load permit workload.');
        return Array.isArray(payload) ? payload : [];
      })
      .then((payload) => {
        if (!cancelled) setJobs(payload);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load permit workload.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const attentionJobs = useMemo(() => jobs.filter(needsAttention), [jobs]);
  const inspectionJobs = useMemo(
    () => jobs.filter((job) => job.status === 'Inspections' || (job.external_status || '').toLowerCase().includes('issued')),
    [jobs],
  );
  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, PermitSummaryJob[]>();
    for (const job of jobs) {
      const key = job.address.trim().replace(/[.,]/g, '').replace(/\s+/g, ' ').toLowerCase();
      const current = groups.get(key) || [];
      current.push(job);
      groups.set(key, current);
    }
    return Array.from(groups.values()).filter((group) => group.length > 1);
  }, [jobs]);

  return (
    <section className="mx-auto mb-6 w-full max-w-7xl space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1E6FA8]">AMHI Operations</div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0B1E38] sm:text-3xl">Permit Workload Control Center</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
              Permanent EHS permit records, action-required jobs, issued permits and portal-connector readiness. External portal observations are kept separate from the human EHS workflow status.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 lg:max-w-sm">
            <div className="font-black uppercase tracking-wide">Monitoring state</div>
            <p className="mt-1 leading-relaxed">Portal connectors are not yet running automatically. Current external statuses are audited/manual snapshots until each vendor connector is activated.</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Tracked Permits', loading ? '—' : jobs.length, 'Permanent active records'],
            ['Action Required', loading ? '—' : attentionJobs.length, 'Hold, corrections, incomplete or documents'],
            ['Issued / Inspections', loading ? '—' : inspectionJobs.length, 'Open issued permits still requiring completion'],
            ['Duplicate Addresses', loading ? '—' : duplicateGroups.length, 'Properties with multiple permit records'],
          ].map(([label, value, detail]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-1 text-2xl font-black text-[#0B1E38]">{value}</div>
              <div className="mt-1 text-[10px] leading-relaxed text-slate-500">{detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Priority Queue</div>
              <h2 className="mt-1 text-lg font-black text-[#0B1E38]">Jobs Needing Attention</h2>
            </div>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-black text-rose-700">
              {attentionJobs.length} open
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">Loading permit workload…</div>
            ) : attentionJobs.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-xs font-bold text-emerald-700">No permit jobs are currently flagged for action.</div>
            ) : (
              attentionJobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-black text-slate-900">{permitLabel(job)}</div>
                      <div className="mt-0.5 text-[11px] text-slate-500">{job.permit_number || 'Permit number not entered'} · {job.county} County</div>
                    </div>
                    <span className={`w-fit rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${badgeClass(job.external_status || job.status)}`}>
                      {job.external_status || job.status}
                    </span>
                  </div>
                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
                    <span className="font-black text-[#0B1E38]">Next action:</span> {job.next_action || 'Review permit record and assign the next action.'}
                  </div>
                </div>
              ))
            )}
          </div>

          {duplicateGroups.length > 0 && (
            <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Reconciliation Required</div>
              {duplicateGroups.map((group) => (
                <div key={group[0].address} className="mt-2 text-xs text-indigo-950">
                  <span className="font-black">{group[0].address}</span> has {group.length} active permit records: {group.map((job) => job.permit_number || job.id).join(' · ')}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6FA8]">Connector Roadmap</div>
          <h2 className="mt-1 text-lg font-black text-[#0B1E38]">County Portal Readiness</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">This is the verified audit state—not a claim that automated checking is already active.</p>

          <div className="mt-4 space-y-2.5">
            {PERMIT_PORTAL_COVERAGE.map((portal) => (
              <div key={portal.id} className="rounded-2xl border border-slate-200 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-slate-900">{portal.vendor}</div>
                    <div className="mt-0.5 text-[10px] font-semibold text-slate-400">{portal.jurisdictions.join(' · ')}</div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wide ${portal.status === 'audited' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    {portal.label}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{portal.detail}</p>
                <p className="mt-1.5 text-[10px] font-semibold leading-relaxed text-[#1E6FA8]">Next: {portal.connectorPlan}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
