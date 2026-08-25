'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  INVENTORY_DOCUMENT_CATEGORIES,
  type HomeInventoryRecord,
  type HomeInventoryStatus,
  type InventoryDocument,
  type InventoryDocumentCategory,
} from '@/types/homeInventory';

const STATUS_LABELS: Record<HomeInventoryStatus, string> = {
  ON_LOT: 'On Lot',
  ORDERED: 'Ordered',
  IN_TRANSIT: 'In Transit',
  SETUP_IN_PROGRESS: 'Setup in Progress',
  SOLD_AWAITING_DELIVERY: 'Sold — Awaiting Delivery',
  OFF_LOT: 'Off Lot',
  STATUS_TO_CONFIRM: 'Status to Confirm',
};

const EMPTY_FORM = {
  display_name: '',
  manufacturer: '',
  model_name: '',
  series: '',
  serial_number: '',
  hud_labels: '',
  status: 'STATUS_TO_CONFIRM' as HomeInventoryStatus,
  lot_location: '',
  financing_provider: '',
  ordered_date: '',
  delivered_date: '',
  estimated_offline_date: '',
  notes: '',
  ehs_retail_price: '',
  invoice_without_freight: '',
  freight_financed: '',
  freight_paid: '',
  final_invoice_total: '',
  floorplan_financing_balance: '',
  active: true,
};

type InventoryForm = typeof EMPTY_FORM;

function money(value?: number | null) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function shortMoney(value?: number | null) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dateLabel(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

function nullableText(value: string) {
  const cleaned = value.trim();
  return cleaned || null;
}

function nullableMoney(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned.replace(/[$,]/g, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function nullableDate(value: string) {
  const cleaned = value.trim();
  return cleaned || null;
}

function hudLabels(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    ),
  );
}

function toForm(record: HomeInventoryRecord): InventoryForm {
  return {
    display_name: record.display_name || '',
    manufacturer: record.manufacturer || '',
    model_name: record.model_name || '',
    series: record.series || '',
    serial_number: record.serial_number || '',
    hud_labels: (record.hud_labels || []).join(', '),
    status: record.status || 'STATUS_TO_CONFIRM',
    lot_location: record.lot_location || '',
    financing_provider: record.financing_provider || '',
    ordered_date: record.ordered_date || '',
    delivered_date: record.delivered_date || '',
    estimated_offline_date: record.estimated_offline_date || '',
    notes: record.notes || '',
    ehs_retail_price: record.ehs_retail_price == null ? '' : String(record.ehs_retail_price),
    invoice_without_freight:
      record.invoice_without_freight == null ? '' : String(record.invoice_without_freight),
    freight_financed: record.freight_financed == null ? '' : String(record.freight_financed),
    freight_paid: record.freight_paid == null ? '' : String(record.freight_paid),
    final_invoice_total: record.final_invoice_total == null ? '' : String(record.final_invoice_total),
    floorplan_financing_balance:
      record.floorplan_financing_balance == null ? '' : String(record.floorplan_financing_balance),
    active: record.active !== false,
  };
}

function statusClass(status: HomeInventoryStatus) {
  if (status === 'ON_LOT') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (status === 'STATUS_TO_CONFIRM') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (status === 'SOLD_AWAITING_DELIVERY') return 'bg-violet-50 text-violet-800 border-violet-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export function HomeInventoryView() {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Manager';
  const [inventory, setInventory] = useState<HomeInventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<HomeInventoryRecord | null>(null);
  const [documents, setDocuments] = useState<InventoryDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<InventoryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [documentCategory, setDocumentCategory] = useState<InventoryDocumentCategory>('Other');
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portal/home-inventory', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.inventory)) {
        throw new Error(data.error || 'Unable to retrieve permanent home inventory.');
      }
      setInventory(data.inventory);
      setSelected((current) => {
        if (!current) return null;
        return data.inventory.find((record: HomeInventoryRecord) => record.id === current.id) || null;
      });
    } catch (cause) {
      setInventory([]);
      setSelected(null);
      setError(cause instanceof Error ? cause.message : 'Unable to retrieve permanent home inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDocuments = useCallback(async (inventoryId: string) => {
    setDocumentsLoading(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/portal/home-inventory/${encodeURIComponent(inventoryId)}/documents`, {
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !Array.isArray(data.documents)) {
        throw new Error(data.error || 'Unable to retrieve inventory documents.');
      }
      setDocuments(data.documents);
    } catch (cause) {
      setDocuments([]);
      setActionError(cause instanceof Error ? cause.message : 'Unable to retrieve inventory documents.');
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (selected) void loadDocuments(selected.id);
    else setDocuments([]);
  }, [selected, loadDocuments]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return inventory;
    return inventory.filter((record) =>
      [
        record.display_name,
        record.manufacturer,
        record.model_name,
        record.series,
        record.serial_number,
        ...(record.hud_labels || []),
        record.lot_location,
        record.financing_provider,
        STATUS_LABELS[record.status],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [inventory, search]);

  const totals = useMemo(() => ({
    records: inventory.length,
    onLot: inventory.filter((record) => record.status === 'ON_LOT').length,
    finalInvoices: inventory.reduce((sum, record) => sum + (record.final_invoice_total || 0), 0),
    floorplan: inventory.reduce((sum, record) => sum + (record.floorplan_financing_balance || 0), 0),
  }), [inventory]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSelected(null);
    setEditorOpen(true);
    setActionError(null);
  };

  const openEdit = (record: HomeInventoryRecord) => {
    setSelected(record);
    setForm(toForm(record));
    setEditorOpen(true);
    setActionError(null);
  };

  const saveRecord = async () => {
    if (!canManage || !form.display_name.trim()) return;
    setSaving(true);
    setActionError(null);
    const body = {
      display_name: form.display_name.trim(),
      manufacturer: nullableText(form.manufacturer),
      model_name: nullableText(form.model_name),
      series: nullableText(form.series),
      serial_number: nullableText(form.serial_number),
      hud_labels: hudLabels(form.hud_labels),
      status: form.status,
      lot_location: nullableText(form.lot_location),
      financing_provider: nullableText(form.financing_provider),
      ordered_date: nullableDate(form.ordered_date),
      delivered_date: nullableDate(form.delivered_date),
      estimated_offline_date: nullableDate(form.estimated_offline_date),
      notes: form.notes.trim(),
      ehs_retail_price: nullableMoney(form.ehs_retail_price),
      invoice_without_freight: nullableMoney(form.invoice_without_freight),
      freight_financed: nullableMoney(form.freight_financed),
      freight_paid: nullableMoney(form.freight_paid),
      final_invoice_total: nullableMoney(form.final_invoice_total),
      floorplan_financing_balance: nullableMoney(form.floorplan_financing_balance),
      active: form.active,
    };
    const editing = selected?.id;
    try {
      const response = await fetch(
        editing
          ? `/api/portal/home-inventory/${encodeURIComponent(editing)}`
          : '/api/portal/home-inventory',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Inventory record was not saved.');
      }
      setEditorOpen(false);
      setSelected(data.inventory || null);
      await loadInventory();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Inventory record was not saved.');
    } finally {
      setSaving(false);
    }
  };

  const archiveRecord = async (record: HomeInventoryRecord) => {
    if (!canManage) return;
    if (!window.confirm(`Archive ${record.display_name}? The record will remain in the permanent database.`)) return;
    setActionError(null);
    try {
      const response = await fetch(`/api/portal/home-inventory/${encodeURIComponent(record.id)}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to archive inventory record.');
      setSelected(null);
      await loadInventory();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Unable to archive inventory record.');
    }
  };

  const uploadDocument = async (file: File | null) => {
    if (!canManage || !selected || !file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setActionError('Only PDF documents can be uploaded to inventory records.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setActionError('This PDF exceeds the current 4 MB secure portal limit.');
      return;
    }
    setUploading(true);
    setActionError(null);
    try {
      const response = await fetch(
        `/api/portal/home-inventory/${encodeURIComponent(selected.id)}/documents?category=${encodeURIComponent(documentCategory)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/pdf',
            'X-Filename': encodeURIComponent(file.name),
          },
          body: file,
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Document upload failed.');
      await loadDocuments(selected.id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (document: InventoryDocument) => {
    if (!canManage || !selected) return;
    if (!window.confirm(`Remove ${document.filename} from this inventory record?`)) return;
    setActionError(null);
    try {
      const response = await fetch(
        `/api/portal/home-inventory/${encodeURIComponent(selected.id)}/documents/${encodeURIComponent(document.id)}`,
        { method: 'DELETE' },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to remove document.');
      await loadDocuments(selected.id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Unable to remove document.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">Permanent Operations</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Home Inventory</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
            Verified physical inventory with separate invoice, freight, floorplan, timeline, and private document records. Catalog homes are not inventory unless a permanent inventory record exists here.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadInventory()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
          {canManage && (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-[#0B1E38] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#081628]"
            >
              + Add Inventory Home
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          {error} No browser seed or placeholder records were loaded.
        </div>
      )}
      {actionError && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Active records" value={String(totals.records)} />
        <Metric label="Confirmed on lot" value={String(totals.onLot)} />
        <Metric label="Final invoices" value={shortMoney(totals.finalInvoices)} />
        <Metric label="Floorplan balance" value={shortMoney(totals.floorplan)} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search home, serial, HUD label, model, provider, status…"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 md:max-w-2xl"
          />
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-400">Loading permanent inventory…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No permanent inventory records match this view.</div>
          ) : filtered.map((record) => (
            <div key={record.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => setSelected(record)} className="min-w-0 text-left">
                  <div className="truncate text-base font-extrabold text-slate-900">{record.display_name}</div>
                  <div className="mt-1 truncate font-mono text-[11px] text-slate-500">{record.serial_number || 'Serial not confirmed'}</div>
                </button>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${statusClass(record.status)}`}>
                  {STATUS_LABELS[record.status]}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <MiniValue label="Financing" value={record.financing_provider || '—'} />
                <MiniValue label="Final invoice" value={money(record.final_invoice_total)} />
                <MiniValue label="Floorplan" value={money(record.floorplan_financing_balance)} />
                <MiniValue label="Delivered" value={dateLabel(record.delivered_date)} />
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setSelected(record)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Open details</button>
                {canManage && <button type="button" onClick={() => openEdit(record)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Edit</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Inventory Home</th>
                <th className="px-4 py-3">Serial / HUD</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Financing</th>
                <th className="px-4 py-3 text-right">Final Invoice</th>
                <th className="px-4 py-3 text-right">Floorplan Balance</th>
                <th className="px-4 py-3">Details / Vault</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={canManage ? 8 : 7} className="px-4 py-12 text-center text-sm text-slate-400">Loading permanent inventory…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={canManage ? 8 : 7} className="px-4 py-12 text-center text-sm text-slate-400">No permanent inventory records match this view.</td></tr>
              ) : filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelected(record)} className="text-left">
                      <div className="font-bold text-slate-900 hover:text-sky-700">{record.display_name}</div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {[record.manufacturer, record.model_name].filter(Boolean).join(' · ') || 'Model details not yet confirmed'}
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-slate-600">{record.serial_number || '—'}</div>
                    {(record.hud_labels || []).length > 0 && <div className="mt-1 text-[10px] text-slate-400">HUD {(record.hud_labels || []).join(', ')}</div>}
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${statusClass(record.status)}`}>{STATUS_LABELS[record.status]}</span></td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{record.financing_provider || '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{money(record.final_invoice_total)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{money(record.floorplan_financing_balance)}</td>
                  <td className="px-4 py-3"><button type="button" onClick={() => setSelected(record)} className="text-xs font-bold text-sky-700 hover:underline">Open details</button></td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(record)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Edit</button>
                        <button type="button" onClick={() => void archiveRecord(record)} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">Archive</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && !editorOpen && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Permanent Inventory Record</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selected.display_name}</h2>
              <p className="mt-1 text-xs text-slate-500">Serial: {selected.serial_number || 'Not confirmed'}</p>
            </div>
            <div className="flex gap-2">
              {canManage && <button type="button" onClick={() => openEdit(selected)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Edit record</button>}
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500">Close</button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailValue label="Manufacturer / Model" value={[selected.manufacturer, selected.model_name].filter(Boolean).join(' · ') || '—'} />
            <DetailValue label="HUD label(s)" value={(selected.hud_labels || []).join(', ') || '—'} mono />
            <DetailValue label="Financing provider" value={selected.financing_provider || '—'} />
            <DetailValue label="Lot location" value={selected.lot_location || '—'} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <MoneyDetail label="EHS Retail Price" value={selected.ehs_retail_price} />
            <MoneyDetail label="Invoice w/o Freight" value={selected.invoice_without_freight} />
            <MoneyDetail label="Freight Financed" value={selected.freight_financed} />
            <MoneyDetail label="Freight Paid" value={selected.freight_paid} />
            <MoneyDetail label="Final Invoice" value={selected.final_invoice_total} />
            <MoneyDetail label="Floorplan Balance" value={selected.floorplan_financing_balance} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DetailValue label="Ordered" value={dateLabel(selected.ordered_date)} />
            <DetailValue label="Delivered" value={dateLabel(selected.delivered_date)} />
            <DetailValue label="Estimated Offline" value={dateLabel(selected.estimated_offline_date)} />
          </div>

          {selected.notes && <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600"><span className="font-bold text-slate-800">Internal notes:</span> {selected.notes}</div>}

          <div className="border-t border-slate-100 pt-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Private Document Vault</p>
              <p className="mt-1 text-xs text-slate-500">Authenticated PDF storage for this exact physical unit.</p>
            </div>

            {canManage && (
              <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[240px_1fr] md:items-end">
                <label className="text-xs font-bold text-slate-700">
                  Document category
                  <select
                    value={documentCategory}
                    onChange={(event) => setDocumentCategory(event.target.value as InventoryDocumentCategory)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {INVENTORY_DOCUMENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-700">
                  Secure PDF upload
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      void uploadDocument(file);
                      event.currentTarget.value = '';
                    }}
                    className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-bold"
                  />
                </label>
                {uploading && <p className="text-xs font-semibold text-sky-700 md:col-span-2">Uploading PDF to private permanent storage…</p>}
              </div>
            )}

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              {documentsLoading ? (
                <div className="p-6 text-center text-sm text-slate-400">Loading documents…</div>
              ) : documents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No documents are attached to this inventory record.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map((document) => (
                    <div key={document.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-900">{document.filename}</div>
                        <div className="mt-1 text-xs text-slate-500">{document.category} · {fileSize(document.size_bytes)}</div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/api/portal/home-inventory/${encodeURIComponent(selected.id)}/documents/${encodeURIComponent(document.id)}/download`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Download</a>
                        {canManage && <button type="button" onClick={() => void removeDocument(document)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Remove</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editorOpen && canManage && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">Permanent Inventory Record</p>
                <h2 className="text-xl font-extrabold text-slate-900">{selected ? `Edit ${selected.display_name}` : 'Add Inventory Home'}</h2>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} className="text-xl text-slate-400 hover:text-slate-900">×</button>
            </div>

            <div className="space-y-5 p-5">
              <section>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Unit identity</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Field label="Inventory display name *" value={form.display_name} onChange={(value) => setForm((current) => ({ ...current, display_name: value }))} />
                  <Field label="Serial / VIN" value={form.serial_number} onChange={(value) => setForm((current) => ({ ...current, serial_number: value }))} />
                  <Field label="Manufacturer" value={form.manufacturer} onChange={(value) => setForm((current) => ({ ...current, manufacturer: value }))} />
                  <Field label="Model name / number" value={form.model_name} onChange={(value) => setForm((current) => ({ ...current, model_name: value }))} />
                  <Field label="Series" value={form.series} onChange={(value) => setForm((current) => ({ ...current, series: value }))} />
                  <Field label="HUD label(s) — comma separated" value={form.hud_labels} onChange={(value) => setForm((current) => ({ ...current, hud_labels: value }))} />
                  <Field label="Lot location" value={form.lot_location} onChange={(value) => setForm((current) => ({ ...current, lot_location: value }))} />
                  <label className="text-xs font-bold text-slate-700">
                    Status
                    <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as HomeInventoryStatus }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
                      {(Object.keys(STATUS_LABELS) as HomeInventoryStatus[]).map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 self-end pb-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /> Active inventory record</label>
                </div>
              </section>

              <section className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-800">Financial structure</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <MoneyField label="EHS Retail Price" value={form.ehs_retail_price} onChange={(value) => setForm((current) => ({ ...current, ehs_retail_price: value }))} />
                  <MoneyField label="Invoice w/o Freight" value={form.invoice_without_freight} onChange={(value) => setForm((current) => ({ ...current, invoice_without_freight: value }))} />
                  <MoneyField label="Freight Financed" value={form.freight_financed} onChange={(value) => setForm((current) => ({ ...current, freight_financed: value }))} />
                  <MoneyField label="Freight Paid" value={form.freight_paid} onChange={(value) => setForm((current) => ({ ...current, freight_paid: value }))} />
                  <MoneyField label="Final Invoice Total" value={form.final_invoice_total} onChange={(value) => setForm((current) => ({ ...current, final_invoice_total: value }))} />
                  <MoneyField label="Floorplan / Financing Balance" value={form.floorplan_financing_balance} onChange={(value) => setForm((current) => ({ ...current, floorplan_financing_balance: value }))} />
                </div>
                <p className="mt-3 text-[11px] font-semibold leading-relaxed text-slate-500">These values remain independent. Invoice without freight, freight allocation, final invoice, retail price, and floorplan balance are separate business facts and are never substituted for one another.</p>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Financing & timeline</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Financing provider" value={form.financing_provider} onChange={(value) => setForm((current) => ({ ...current, financing_provider: value }))} />
                  <DateField label="Ordered" value={form.ordered_date} onChange={(value) => setForm((current) => ({ ...current, ordered_date: value }))} />
                  <DateField label="Delivered" value={form.delivered_date} onChange={(value) => setForm((current) => ({ ...current, delivered_date: value }))} />
                  <DateField label="Estimated Offline" value={form.estimated_offline_date} onChange={(value) => setForm((current) => ({ ...current, estimated_offline_date: value }))} />
                </div>
              </section>

              <label className="block text-xs font-bold text-slate-700">
                Internal inventory notes
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
              <button type="button" disabled={saving || !form.display_name.trim()} onClick={() => void saveRecord()} className="rounded-xl bg-[#0B1E38] px-5 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save to Permanent Inventory'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-[11px] font-bold text-slate-500">{label}</div><div className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{value}</div></div>;
}

function MiniValue({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 font-semibold text-slate-800">{value}</div></div>;
}

function DetailValue({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</div><div className={`mt-1 text-sm font-bold text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</div></div>;
}

function MoneyDetail({ label, value }: { label: string; value?: number | null }) {
  return <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3"><div className="text-[10px] font-black uppercase tracking-wide text-sky-700">{label}</div><div className="mt-1 text-sm font-extrabold text-slate-900">{money(value)}</div></div>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>;
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold text-slate-700">{label}<input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Leave blank if unconfirmed" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-bold text-slate-700">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>;
}
