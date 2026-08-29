'use client';

import { useEffect, useState } from 'react';
import QuoteBuilderUnified from '@/components/portal/QuoteBuilderUnified';
import { FULL_MASTER_CATALOG_HOMES } from '@/data/fullMasterCatalog.generated';
import {
  applyMasterCatalogOverrides,
  type CatalogOverride,
} from '@/lib/catalog/catalogAuthority';

const LEGACY_OVERRIDE_STORAGE_KEY = 'ehs_catalog_overrides';

export default function QuoteBuilderCatalogAuthority({ quoteId }: { quoteId?: string }) {
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function synchronizeCatalog() {
      try {
        // Remove old browser-authored catalog state before loading permanent data.
        localStorage.removeItem(LEGACY_OVERRIDE_STORAGE_KEY);

        const response = await fetch('/api/portal/catalog/overrides', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.success || !Array.isArray(payload.overrides)) {
          throw new Error(payload.error || 'Permanent catalog overrides are unavailable.');
        }

        const catalog = applyMasterCatalogOverrides(
          FULL_MASTER_CATALOG_HOMES,
          payload.overrides as CatalogOverride[],
        );
        localStorage.setItem(LEGACY_OVERRIDE_STORAGE_KEY, JSON.stringify(catalog));
        window.dispatchEvent(new Event('ehs_catalog_updated'));
      } catch (error) {
        console.warn('Quote Builder is using the verified Master Quote catalog baseline.', error);
        try {
          localStorage.removeItem(LEGACY_OVERRIDE_STORAGE_KEY);
        } catch {
          // Storage can be unavailable in hardened/private browser contexts.
        }
        if (!cancelled) {
          setWarning('Live catalog changes could not be loaded. Verified Master Quote 5 baseline pricing is being used.');
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void synchronizeCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-bold text-slate-600 shadow-sm">
          Loading verified EHS catalog…
        </div>
      </div>
    );
  }

  return (
    <>
      {warning && (
        <div className="fixed left-1/2 top-3 z-[100] w-[min(92vw,760px)] -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900 shadow-lg">
          {warning}
        </div>
      )}
      <QuoteBuilderUnified quoteId={quoteId} />
    </>
  );
}
