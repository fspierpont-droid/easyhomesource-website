'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  COUNTY_PERMIT_RESOURCES,
  FLORIDA_BUILDING_JURISDICTION_SEARCH,
  FLORIDA_COUNTIES,
  PERMIT_RESOURCE_LINKS,
} from '@/data/floridaPermittingResources';

type PermitStatus =
  | 'Research'
  | 'Intake'
  | 'Ready to Submit'
  | 'Submitted'
  | 'Corrections'
  | 'Approved'
  | 'Inspections'
  | 'Final / CO'
  | 'On Hold';

interface PermitDocument {
  document_id: string;
  filename: string;
  category: string;
  size: number;
  uploaded_at: string;
  archived?: boolean;
}

interface PermitJob {
  id: string;
  customer_name?: string;
  project_name?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  county: string;
  municipality?: string;
  parcel_number?: string;
  jurisdiction?: string;
  permit_type?: string;
  status: PermitStatus;
  permit_number?: string;
  application_number?: string;
  assigned_to?: string;
  installer?: string;
  submitted_at?: string;
  issued_at?: string;
  expires_at?: string;
  target_install_date?: string;
  next_action?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
  documents?: PermitDocument[];
  updated_at?: string;
}

type EditableJobField =
  | 'permit_number'
  | 'application_number'
  | 'parcel_number'
  | 'assigned_to'
  | 'next_action'
  | 'target_install_date';

const STATUSES: PermitStatus[] = [
  'Research',
  'Intake',
  'Ready to Submit',
  'Submitted',
  'Corrections',
  'Approved',
  'Inspections',
  'Final / CO',
  'On Hold',
];

const PERMIT_TYPES = [
  'Manufactured Home Installation',
  'Historical / After-the-Fact',
  'Replacement Home',
  'Demo / Removal',
  'Electrical',
  'Well',
  'Septic',
  'Driveway / ROW',
  'Other',
];

const DOCUMENT_CATEGORIES = [
  'Permit Application',
  'Survey / Site Plan',
  'Deed / Ownership',
  'Property Appraiser',
  'Floor Plan / Elevations',
  'Manufacturer / HUD Documents',
  'Installation Manual',
  'Foundation / Tie-Down Plan',
  'Installer / Contractor License',
  'Septic',
  'Well',
  'Electrical',
  'Driveway / ROW',
  'Impact Fees',
  'Flood / Elevation',
  'Approved Plans',
  'Corrections / Comments',
  'Inspection Report',
  'Certificate of Occupancy / Completion',
  'Photos',
  'Other',
];

const CHECKLIST = [
  ['parcel', 'Parcel / ownership verified'],
  ['zoning', 'Zoning & manufactured-home use verified'],
  ['setbacks', 'Setbacks / site placement verified'],
  ['flood', 'Flood zone / elevation reviewed'],
  ['survey', 'Survey / site plan ready'],
  ['installer', 'Installer / contractor registration verified'],
  ['hud', 'HUD / manufacturer documents ready'],
  ['septic_well', 'Septic / well requirements resolved'],
  ['electric', 'Electric / utility requirements resolved'],
  ['driveway', 'Driveway / ROW requirements resolved'],
  ['impact_fees', 'Impact fees researched / paid'],
  ['application', 'Permit application complete'],
  ['submitted', 'Permit submitted'],
  ['corrections', 'Corrections cleared'],
  ['issued', 'Permit issued'],
  ['inspections', 'Required inspections passed'],
  ['final', 'Final / CO / completion received'],
] as const;

const EDITABLE_FIELDS: Array<[string, EditableJobField]> = [
  ['Permit #', 'permit_number'],
  ['Application #', 'application_number'],
  ['Parcel #', 'parcel_number'],
  ['Assigned To', 'assigned_to'],
  ['Next Action', 'next_action'],
  ['Target Install Date', 'target_install_date'],
];

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AmhiPermittingHub() {
  const [tab, setTab] = useState<'jobs' | 'counties' | 'tools'>('jobs');
  const [jobs, setJobs] = useState<PermitJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [countySearch, setCountySearch] = useState('');
  const [documentCategory, setDocumentCategory] = useState('Permit Application');
  const [editValues, setEditValues] = useState<Record<EditableJobField, string>>({
    permit_number: '',
    application_number: '',
    parcel_number: '',
    assigned_to: '',
    next_action: '',
    target_install_date: '',
  });
  const [notesDraft, setNotesDraft] = useState('');
  const [newJob, setNewJob] = useState({
    customer_name: '',
    project_name: '',
    address: '',
    city: '',
    zip: '',
    county: 'Hernando',
    permit_type: 'Manufactured Home Installation',
    status: 'Research' as PermitStatus,
  });

  const selected = jobs.find((job) => job.id === selectedId) || null;

  useEffect(() => {
    if (!selected) {
      setEditValues({
        permit_number: '',
        application_number: '',
        parcel_number: '',
        assigned_to: '',
        next_action: '',
        target_install_date: '',
      });
      setNotesDraft('');
      return;
    }

    setEditValues({
      permit_number: selected.permit_number || '',
      application_number: selected.application_number || '',
      parcel_number: selected.parcel_number || '',
      assigned_to: selected.assigned_to || '',
      next_action: selected.next_action || '',
      target_install_date: selected.target_install_date || '',
    });
    setNotesDraft(selected.notes || '');
  }, [selectedId]);

  async function loadJobs(preferredId?: string | null) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portal/permitting/jobs', { cache: 'no-store' });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload?.detail || 'Unable to load permit jobs.');
      const nextJobs = Array.isArray(payload) ? payload : [];
      setJobs(nextJobs);
      const requested = preferredId || selectedId;
      if (requested && nextJobs.some((job: PermitJob) => job.id === requested)) {
        setSelectedId(requested);
      } else if (nextJobs[0]) {
        setSelectedId(nextJobs[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load permit jobs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
    // Initial authenticated load only. Subsequent refreshes are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createJob(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/portal/permitting/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.detail || 'Unable to create permit job.');
      setJobs((current) => [payload, ...current]);
      setSelectedId(payload.id);
      setShowNew(false);
      setNewJob({
        customer_name: '',
        project_name: '',
        address: '',
        city: '',
        zip: '',
        county: 'Hernando',
        permit_type: 'Manufactured Home Installation',
        status: 'Research',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create permit job.');
    } finally {
      setSaving(false);
    }
  }

  async function patchJob(patch: Partial<PermitJob>) {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/portal/permitting/jobs/${encodeURIComponent(selected.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.detail || 'Unable to update permit job.');
      setJobs((current) => current.map((job) => (job.id === payload.id ? payload : job)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update permit job.');
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(file: File) {
    if (!selected) return;
    const currentId = selected.id;
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('category', documentCategory);
      const response = await fetch(
        `/api/portal/permitting/jobs/${encodeURIComponent(currentId)}/documents`,
        { method: 'POST', body: form },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.detail || 'Upload failed.');
      await loadJobs(currentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  }

  const filteredCounties = useMemo(
    () => COUNTY_PERMIT_RESOURCES.filter((item) =>
      item.county.toLowerCase().includes(countySearch.toLowerCase().trim()),
    ),
    [countySearch],
  );

  const counts = useMemo(
    () => ({
      active: jobs.filter((job) => job.status !== 'Final / CO' && job.status !== 'On Hold').length,
      submitted: jobs.filter((job) => ['Submitted', 'Corrections', 'Approved', 'Inspections'].includes(job.status)).length,
      corrections: jobs.filter((job) => job.status === 'Corrections').length,
      final: jobs.filter((job) => job.status === 'Final / CO').length,
    }),
    [jobs],
  );

  const visibleDocuments = (selected?.documents || []).filter((document) => !document.archived);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1E6FA8]">
              Advance Mobile Home Installation
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#0B1E38] tracking-tight">AMHI Permitting Hub</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-3xl">
              Permit jobs, jurisdiction research, county portals, property tools, inspection tracking and secure project documents in one operational workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="https://app.landglide.com/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-sm"
            >
              📍 LandGlide
            </a>
            <button
              type="button"
              onClick={() => {
                setTab('jobs');
                setShowNew(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#0B1E38] text-white text-xs font-black shadow-sm"
            >
              + New Permit Job
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Active Jobs', counts.active],
            ['In County Review', counts.submitted],
            ['Corrections', counts.corrections],
            ['Final / CO', counts.final],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider font-black text-slate-400">{label}</div>
              <div className="mt-2 text-2xl font-black text-[#0B1E38]">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 w-fit shadow-sm">
          {([
            ['jobs', 'Permit Jobs'],
            ['counties', 'County Portals'],
            ['tools', 'Permit Tools'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-xs font-black ${
                tab === id ? 'bg-[#0B1E38] text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {tab === 'jobs' && (
          <div className="grid lg:grid-cols-[0.9fr_1.35fr] gap-5 items-start">
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-black text-[#0B1E38]">Permit Jobs</h2>
                <button type="button" onClick={() => void loadJobs(selectedId)} className="text-xs font-bold text-[#1E6FA8]">
                  Refresh
                </button>
              </div>
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading permit jobs…</div>
              ) : jobs.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No permit jobs yet. Create the first AMHI job.</div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedId(job.id)}
                      className={`w-full text-left p-4 hover:bg-slate-50 ${selectedId === job.id ? 'bg-blue-50/60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-black text-sm text-slate-900">{job.customer_name || job.project_name || job.address}</div>
                        <span className="text-[9px] font-black uppercase tracking-wide rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {job.address}{job.city ? `, ${job.city}` : ''}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 font-semibold">
                        {job.county} County · {job.permit_type || 'Manufactured Home Installation'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              {!selected ? (
                <div className="py-16 text-center text-sm text-slate-400">Select a permit job to view its workspace.</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-black text-[#1E6FA8]">{selected.county} County</p>
                      <h2 className="text-xl font-black text-[#0B1E38]">{selected.customer_name || selected.project_name || 'Permit Job'}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {selected.address}{selected.city ? `, ${selected.city}` : ''} {selected.zip || ''}
                      </p>
                    </div>
                    <select
                      value={selected.status}
                      onChange={(event) => void patchJob({ status: event.target.value as PermitStatus })}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black bg-white"
                    >
                      {STATUSES.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {EDITABLE_FIELDS.map(([label, field]) => (
                      <label key={field} className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                        {label}
                        <input
                          value={editValues[field]}
                          onChange={(event) => setEditValues((current) => ({ ...current, [field]: event.target.value }))}
                          onBlur={() => {
                            const value = editValues[field];
                            if (value !== (selected[field] || '')) void patchJob({ [field]: value });
                          }}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-800 normal-case tracking-normal"
                        />
                      </label>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Permit Checklist</h3>
                      <span className="text-[10px] text-slate-400">
                        {CHECKLIST.filter(([key]) => selected.checklist?.[key]).length}/{CHECKLIST.length} complete
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {CHECKLIST.map(([key, label]) => (
                        <label key={key} className="flex items-start gap-2 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(selected.checklist?.[key])}
                            onChange={(event) => void patchJob({
                              checklist: { ...(selected.checklist || {}), [key]: event.target.checked },
                            })}
                            className="mt-0.5"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Notes</h3>
                    <textarea
                      value={notesDraft}
                      onChange={(event) => setNotesDraft(event.target.value)}
                      onBlur={() => {
                        if (notesDraft !== (selected.notes || '')) void patchJob({ notes: notesDraft });
                      }}
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-700"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1E38]">Permit Document Vault</h3>
                        <p className="text-[11px] text-slate-400">Stored securely with the permit job. PDF, Office documents and images up to 25 MB.</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={documentCategory}
                          onChange={(event) => setDocumentCategory(event.target.value)}
                          className="rounded-xl border border-slate-200 px-2 py-2 text-[10px] font-bold bg-white"
                        >
                          {DOCUMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                        </select>
                        <label className={`cursor-pointer rounded-xl bg-[#1E6FA8] px-3 py-2 text-xs font-black text-white ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void uploadDocument(file);
                              event.currentTarget.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {visibleDocuments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
                          No documents uploaded yet.
                        </div>
                      ) : (
                        visibleDocuments.map((document) => (
                          <div key={document.document_id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                            <div className="min-w-0">
                              <div className="truncate text-xs font-black text-slate-800">{document.filename}</div>
                              <div className="text-[10px] text-slate-400">{document.category} · {formatFileSize(document.size)}</div>
                            </div>
                            <a
                              href={`/api/portal/permitting/jobs/${encodeURIComponent(selected.id)}/documents/${encodeURIComponent(document.document_id)}/download`}
                              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-black text-[#1E6FA8]"
                            >
                              Download
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'counties' && (
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#0B1E38]">Florida County Building Portals</h2>
                <p className="text-xs text-slate-500 mt-1">
                  All 67 counties are indexed. Direct operational portals are pinned where verified; the Florida Building Commission jurisdiction search is the fallback for counties or municipalities with separate systems.
                </p>
              </div>
              <input
                value={countySearch}
                onChange={(event) => setCountySearch(event.target.value)}
                placeholder="Search county…"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs w-full sm:w-64"
              />
            </div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCounties.map((item) => (
                <div key={item.county} className="rounded-xl border border-slate-200 p-3">
                  <div className="font-black text-sm text-slate-900">{item.county} County</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.portalUrl ? (
                      <a href={item.portalUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#0B1E38] px-2.5 py-1.5 text-[10px] font-black text-white">
                        {item.portalLabel || 'Permit Portal'} ↗
                      </a>
                    ) : (
                      <a href={FLORIDA_BUILDING_JURISDICTION_SEARCH} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-black text-slate-700">
                        Find Jurisdiction ↗
                      </a>
                    )}
                    {item.departmentUrl && (
                      <a href={item.departmentUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-black text-[#1E6FA8]">
                        Building Dept ↗
                      </a>
                    )}
                  </div>
                  {item.notes && <p className="mt-2 text-[10px] text-amber-700">{item.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'tools' && (
          <div className="space-y-5">
            {(['Parcel & Property', 'State & Licensing', 'Flood & Environmental', 'Utilities & Field'] as const).map((group) => (
              <section key={group} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-black text-[#0B1E38]">{group}</h2>
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PERMIT_RESOURCE_LINKS.filter((item) => item.group === group).map((item) => (
                    <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-4 hover:border-[#1E6FA8] hover:bg-blue-50/30 transition-colors">
                      <div className="text-sm font-black text-slate-900">{item.label} ↗</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.description}</p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/55 backdrop-blur-sm p-4 flex items-center justify-center">
          <form onSubmit={createJob} className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">AMHI</p>
                <h2 className="text-xl font-black text-[#0B1E38]">New Permit Job</h2>
              </div>
              <button type="button" onClick={() => setShowNew(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500">×</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Customer name" value={newJob.customer_name} onChange={(event) => setNewJob({ ...newJob, customer_name: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
              <input placeholder="Project name" value={newJob.project_name} onChange={(event) => setNewJob({ ...newJob, project_name: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
              <input required placeholder="Property address *" value={newJob.address} onChange={(event) => setNewJob({ ...newJob, address: event.target.value })} className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
              <input placeholder="City" value={newJob.city} onChange={(event) => setNewJob({ ...newJob, city: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
              <input placeholder="ZIP" value={newJob.zip} onChange={(event) => setNewJob({ ...newJob, zip: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs" />
              <select required value={newJob.county} onChange={(event) => setNewJob({ ...newJob, county: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white">
                {FLORIDA_COUNTIES.map((county) => <option key={county}>{county}</option>)}
              </select>
              <select value={newJob.permit_type} onChange={(event) => setNewJob({ ...newJob, permit_type: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white">
                {PERMIT_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600">Cancel</button>
              <button disabled={saving} className="px-4 py-2 rounded-xl bg-[#0B1E38] text-white text-xs font-black disabled:opacity-50">
                {saving ? 'Creating…' : 'Create Permit Job'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
