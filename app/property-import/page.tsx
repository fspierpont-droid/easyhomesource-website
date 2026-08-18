'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/portal/AuthGate';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Property, PropertyStatus, PropertyType } from '@/types/property';

type ImportRecord = {
  legacyId: string;
  address: string;
  city: string;
  state: 'FL';
  zip: string;
  status: PropertyStatus;
  propertyType: PropertyType;
  units: number;
  notes: string;
};

const VERIFIED_TRACKER_RECORDS: ImportRecord[] = [
  { legacyId: 'EHS-001', address: '6645 W Erlen Ln', city: 'Homosassa', state: 'FL', zip: '34446', status: 'AVAILABLE', propertyType: 'HOME', units: 1, notes: 'Finished home, ready on market' },
  { legacyId: 'EHS-002', address: '3219 Welsh St', city: 'Spring Hill', state: 'FL', zip: '34606', status: 'AVAILABLE', propertyType: 'HOME', units: 1, notes: 'Finished home, ready on market' },
  { legacyId: 'EHS-003', address: '18810 St Paul Dr', city: 'Spring Hill', state: 'FL', zip: '34610', status: 'AVAILABLE', propertyType: 'HOME', units: 1, notes: 'Finished home, ready on market' },
  { legacyId: 'EHS-004', address: '7112 Fitzpatrick Ave', city: 'Brooksville', state: 'FL', zip: '34613', status: 'AVAILABLE', propertyType: 'LAND', units: 1, notes: 'Vacant lot' },
  { legacyId: 'EHS-005', address: '9248 Denmarsh Dr', city: 'Brooksville', state: 'FL', zip: '34613', status: 'AVAILABLE', propertyType: 'LAND', units: 1, notes: 'Vacant lot' },
  { legacyId: 'EHS-006', address: '9254 Denmarsh Dr', city: 'Brooksville', state: 'FL', zip: '34613', status: 'AVAILABLE', propertyType: 'LAND', units: 1, notes: 'Vacant lot' },
  { legacyId: 'EHS-007', address: '9868 Lake Dr', city: 'Spring Hill', state: 'FL', zip: '34613', status: 'AVAILABLE', propertyType: 'LAND', units: 1, notes: 'Vacant lot' },
  { legacyId: 'EHS-008', address: '9862 Lake Dr', city: 'Spring Hill', state: 'FL', zip: '34446', status: 'AVAILABLE', propertyType: 'LAND', units: 1, notes: 'Vacant lot; city/ZIP combination retained from the verified tracker and should still be reviewed' },
  { legacyId: 'EHS-009', address: '5043 Southtowne Loop', city: 'New Port Richey', state: 'FL', zip: '34652', status: 'AVAILABLE', propertyType: 'LAND', units: 15, notes: '15 on-stilts vacant lots' },
  { legacyId: 'EHS-010', address: '1295 S Rock Crusher Rd', city: 'Homosassa', state: 'FL', zip: '34448', status: 'AVAILABLE', propertyType: 'LAND', units: 23, notes: '23 vacant lots; approximately half-acre home sites' },
  { legacyId: 'EHS-011', address: '26007 Shangri Dr', city: 'Brooksville', state: 'FL', zip: '34601', status: 'COMING_SOON', propertyType: 'SPEC_HOME', units: 1, notes: 'Home in progress; expected to be ready in a few months' },
  { legacyId: 'EHS-012', address: '26314 Glenwood Dr', city: 'Zephyrhills', state: 'FL', zip: '33544', status: 'COMING_SOON', propertyType: 'SPEC_HOME', units: 1, notes: 'Flip/stick home; work finishing or beginning' },
  { legacyId: 'EHS-013', address: '18034 Ferry Ave', city: 'Brooksville', state: 'FL', zip: '34604', status: 'UNDER_CONTRACT', propertyType: 'SPEC_HOME', units: 1, notes: 'Under contract' },
];

const HELD_OUT_RECORDS = ['EHS-014', 'EHS-015', 'EHS-016', 'EHS-017'];

function normalizedAddress(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function PropertyImportPage() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string>('');
  const [details, setDetails] = useState<string[]>([]);

  const canImport = useMemo(() => user?.role === 'Admin' || user?.role === 'Manager', [user]);

  async function runImport() {
    if (!canImport || running) return;
    setRunning(true);
    setResult('');
    setDetails([]);

    try {
      const currentResponse = await fetch('/api/portal/properties', { cache: 'no-store' });
      const currentPayload = await currentResponse.json().catch(() => ({}));
      if (!currentResponse.ok || !currentPayload.success || !Array.isArray(currentPayload.properties)) {
        throw new Error(currentPayload.error || 'Could not read the permanent Property Center.');
      }

      const existing = new Set(
        (currentPayload.properties as Property[]).map((property) =>
          normalizedAddress(`${property.address}${property.city}${property.state}${property.zip}`),
        ),
      );

      let created = 0;
      let skipped = 0;
      const log: string[] = [];

      for (const record of VERIFIED_TRACKER_RECORDS) {
        const key = normalizedAddress(`${record.address}${record.city}${record.state}${record.zip}`);
        if (existing.has(key)) {
          skipped += 1;
          log.push(`${record.legacyId}: skipped — address already exists`);
          continue;
        }

        const response = await fetch('/api/portal/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: record.address,
            city: record.city,
            county: '',
            state: record.state,
            zip: record.zip,
            status: record.status,
            propertyType: record.propertyType,
            price: null,
            photos: [],
            description: record.notes,
            salesperson: 'Unassigned',
            publicVisible: false,
            featured: false,
            notes: '',
            internalNotes: `${record.notes}. Imported from EHS Property Tracker dated 2026-08-04; legacy record ${record.legacyId}. Sales price was blank in source tracker and remains unverified. Units/sites: ${record.units}.`,
            utilities: { water: 'UNKNOWN', sewer: 'UNKNOWN', electric: 'UNKNOWN' },
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.success) {
          throw new Error(`${record.legacyId}: ${payload.error || 'import failed'}`);
        }

        created += 1;
        existing.add(key);
        log.push(`${record.legacyId}: imported`);
      }

      setDetails(log);
      setResult(
        `Import complete: ${created} created, ${skipped} already present. ${HELD_OUT_RECORDS.length} unresolved tracker records were intentionally held out.`,
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Property import failed.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-3xl space-y-5">
          <div>
            <Link href="/portal?view=property-packages" className="text-sm font-bold text-sky-700">
              ← Back to Property Center
            </Link>
            <h1 className="mt-3 text-3xl font-black">Verified Property Tracker Import</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Temporary migration utility for the EHS Property Tracker dated August 4, 2026. It imports only the 13 records with known city, ZIP, status and property type. It never assigns a sales price and never publishes a property to the public website.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Held out intentionally:</strong> EHS-014 through EHS-017. Those records have unconfirmed location/status/type details and will not be imported until verified.
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><div className="text-xs font-black uppercase text-slate-500">Verified records</div><div className="mt-1 text-2xl font-black">13</div></div>
              <div><div className="text-xs font-black uppercase text-slate-500">Available</div><div className="mt-1 text-2xl font-black text-emerald-700">10</div></div>
              <div><div className="text-xs font-black uppercase text-slate-500">Source prices</div><div className="mt-1 text-2xl font-black">0 verified</div></div>
            </div>

            <button
              type="button"
              onClick={runImport}
              disabled={!canImport || running}
              className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running ? 'Importing…' : 'Import 13 Verified Records'}
            </button>
            {!canImport && (
              <p className="mt-3 text-sm font-semibold text-rose-700">Admin or Manager access is required.</p>
            )}
          </div>

          {result && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="font-black">{result}</div>
              {details.length > 0 && (
                <div className="mt-4 max-h-72 overflow-y-auto rounded-xl bg-slate-50 p-4 font-mono text-xs leading-6">
                  {details.map((line) => <div key={line}>{line}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGate>
  );
}
