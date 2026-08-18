'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGate } from '@/components/portal/AuthGate';
import { ManualQuoteBuilderModal } from '@/components/portal/ManualQuoteBuilderModal';
import {
  fetchQuoteFromServer,
  saveQuoteToServer,
  type SavedQuote,
} from '@/data/quotesStore';
import type { Property } from '@/types/property';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = String((params?.id as string) || '');
  const [quote, setQuote] = useState<SavedQuote | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!quoteId) {
        setLoadError('Quote not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const [loadedQuote, propertiesResponse] = await Promise.all([
          fetchQuoteFromServer(quoteId),
          fetch('/api/portal/properties', { cache: 'no-store' }),
        ]);
        const propertiesData = await propertiesResponse.json().catch(() => ({}));
        if (cancelled) return;

        if (!loadedQuote) {
          setLoadError('Quote not found in the permanent EHS quote library.');
          setQuote(null);
        } else {
          setQuote(loadedQuote);
        }

        if (propertiesResponse.ok && propertiesData.success && Array.isArray(propertiesData.properties)) {
          setProperties(propertiesData.properties.filter((property: Property) => property.status === 'AVAILABLE'));
        } else {
          setProperties([]);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load permanent quote editor:', error);
        setQuote(null);
        setLoadError(error instanceof Error ? error.message : 'Unable to load the permanent quote record.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  const handleClose = () => {
    if (savingRef.current) return;
    router.push('/portal?view=library');
  };

  const handleSave = async (updatedQuote: SavedQuote) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      const persisted = await saveQuoteToServer({
        ...updatedQuote,
        customerPhone: updatedQuote.customerPhone.trim(),
        propertyAddress: updatedQuote.propertyAddress.trim(),
        id: quote?.id || updatedQuote.id,
        quoteNumber: quote?.quoteNumber || updatedQuote.quoteNumber,
        createdAt: quote?.createdAt || updatedQuote.createdAt,
      });
      setQuote(persisted);
      savingRef.current = false;
      setSaving(false);
      router.push(`/quotes/${encodeURIComponent(persisted.id)}`);
    } catch (error) {
      console.error('Permanent quote save failed:', error);
      savingRef.current = false;
      setSaving(false);
      setSaveError(error instanceof Error ? error.message : 'The quote was not saved.');
    }
  };

  if (loading) {
    return (
      <AuthGate>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center max-w-md w-full">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Permanent Quote Library</div>
            <h1 className="mt-2 text-xl font-black text-[#0B1E38]">Loading quote editor…</h1>
            <p className="mt-2 text-sm text-slate-500">Retrieving the Mongo-backed quote before enabling edits.</p>
          </div>
        </div>
      </AuthGate>
    );
  }

  if (!quote || loadError) {
    return (
      <AuthGate>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white border border-rose-200 rounded-2xl shadow-sm p-8 text-center max-w-lg w-full">
            <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">Quote unavailable</div>
            <h1 className="mt-2 text-xl font-black text-[#0B1E38]">{loadError || 'Quote not found.'}</h1>
            <p className="mt-2 text-sm text-slate-500">No sample or fallback customer data has been loaded into the editor.</p>
            <button
              type="button"
              onClick={() => router.push('/portal?view=library')}
              className="mt-5 px-5 py-2.5 bg-[#0B1E38] text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              ← Back to Quote Library
            </button>
          </div>
        </div>
      </AuthGate>
    );
  }

  // The legacy full-editor component still uses truthy fallback values for
  // blank optional fields. A single whitespace character renders blank while
  // preventing prototype data from being reintroduced. handleSave trims these
  // values before permanent persistence.
  const editorQuote: SavedQuote = {
    ...quote,
    customerPhone: quote.customerPhone || ' ',
    propertyAddress: quote.propertyAddress || ' ',
  };

  return (
    <AuthGate>
      <div className="ehs-full-quote-editor min-h-screen bg-slate-100">
        <style jsx global>{`
          @media (max-width: 640px) {
            .ehs-full-quote-editor .fixed.inset-0 > div {
              max-height: calc(100dvh - 16px) !important;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) {
              display: block;
              width: 100%;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) thead {
              display: none;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody {
              display: block;
              width: 100%;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody tr {
              display: grid;
              grid-template-columns: minmax(0, 1fr) minmax(0, 0.55fr);
              gap: 10px 12px;
              padding: 14px;
              border-bottom: 1px solid #e2e8f0;
              background: #ffffff;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody tr:last-child {
              border-bottom: 0;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td {
              padding: 0 !important;
              min-width: 0;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(1),
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(2),
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(5),
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(6) {
              grid-column: 1 / -1;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(3),
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(4),
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(5) {
              display: flex;
              flex-direction: column;
              align-items: stretch;
              gap: 5px;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(3)::before,
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(4)::before,
            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(5)::before {
              color: #64748b;
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(3)::before {
              content: 'Price / Custom Price';
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(4)::before {
              content: 'Qty';
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(5)::before {
              content: 'Line Total';
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody input[type='number'] {
              width: 100% !important;
              min-height: 44px;
              padding: 9px 10px;
              border-radius: 10px;
              font-size: 16px !important;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(5) {
              padding: 10px 12px !important;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              background: #f8fafc;
              font-size: 15px;
            }

            .ehs-full-quote-editor table:has(tbody input[type='number']) tbody td:nth-child(6) {
              text-align: right;
            }
          }
        `}</style>

        {(saving || saveError) && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-[min(92vw,620px)]">
            <div
              role={saveError ? 'alert' : 'status'}
              className={`rounded-xl border px-4 py-3 text-xs font-bold shadow-lg ${
                saveError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {saveError || 'Saving quote to the permanent EHS database…'}
            </div>
          </div>
        )}

        <ManualQuoteBuilderModal
          isOpen
          onClose={handleClose}
          onSaveQuote={(updatedQuote) => {
            void handleSave(updatedQuote);
          }}
          existingQuote={editorQuote}
          availableProperties={properties}
        />
      </div>
    </AuthGate>
  );
}
