'use client';

import React, { useState } from 'react';
import type { SavedQuote } from '@/components/portal/ManualQuoteBuilderModal';
import { EditQuoteModal } from '@/components/portal/EditQuoteModal';

interface QuoteLibraryViewProps {
  quotes: SavedQuote[];
  onOpenQuoteBuilder: () => void;
  onUpdateQuote?: (updatedQuote: SavedQuote) => void;
  onDeleteQuote?: (id: string) => void;
}

export function QuoteLibraryView({
  quotes,
  onOpenQuoteBuilder,
  onUpdateQuote,
  onDeleteQuote
}: QuoteLibraryViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<SavedQuote | null>(null);
  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState<SavedQuote | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const text = [
      q.customerName,
      q.quoteNumber,
      q.homeModel,
      q.propertyAddress,
      q.salesperson,
      q.notes,
      q.customerPhone,
      q.customerEmail
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(search.toLowerCase().trim());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_CONTRACT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'LENDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SENT_TO_BUYER':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-ehsBlue">
            PROCESSED PROPOSALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-ehsNavy mt-0.5">
            Quote Library &amp; Pricing Records ({quotes.length} Quotes)
          </h2>
          <p className="text-xs sm:text-sm text-ehsNavy/65 font-medium mt-1">
            Official EHS proposals with itemized breakdown of home, freight, site prep, utilities, and financing.
          </p>
        </div>

        <button
          onClick={onOpenQuoteBuilder}
          className="px-5 py-2.5 bg-ehsBlue hover:bg-ehsDeepBlue text-white font-black rounded-full text-xs shadow-lg shadow-ehsBlue/20 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <span>+</span>
          <span>New Quote</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="p-4 bg-white border border-ehsBlue/10 rounded-[1.5rem] flex flex-wrap items-center justify-between gap-3 shadow-sm shadow-ehsNavy/5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quote #, customer name, model, address..."
          className="w-full max-w-sm px-4 py-2 border border-borderGray rounded-full text-xs font-semibold focus:outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/50"
        />

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-ehsDeepBlue text-white border-ehsDeepBlue'
                : 'bg-ehsSoftBlue text-ehsNavy border-ehsBlue/20 hover:bg-white'
            }`}
          >
            All ({quotes.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50'
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_CONTRACT')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'IN_CONTRACT'
                ? 'bg-indigo-700 text-white border-indigo-700'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/50'
            }`}
          >
            In Contract
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('LENDER_REVIEW')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'LENDER_REVIEW'
                ? 'bg-amber-700 text-white border-amber-700'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            Lender Review
          </button>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white border border-ehsBlue/10 rounded-[1.75rem] shadow-sm shadow-ehsNavy/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-ehsBlue/10 bg-ehsSoftBlue/70 text-[11px] font-black text-ehsNavy uppercase tracking-wider">
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Home Model</th>
                <th className="py-3 px-4">Homesite / Address</th>
                <th className="py-3 px-4">Turnkey Total</th>
                <th className="py-3 px-4">Est. Monthly</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No proposals match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-ehsSoftBlue/30 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-ehsBlue">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-ehsNavy">{q.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{q.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{q.homeModel}</td>
                    <td className="py-3.5 px-4 text-slate-500 truncate max-w-[200px]" title={q.propertyAddress}>
                      {q.propertyAddress}
                    </td>
                    <td className="py-3.5 px-4 font-black text-ehsNavy text-sm">
                      ${q.totalTurnkeyPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ${q.estimatedMonthlyPayment}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-full border text-[10px] ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteForPreview(q)}
                          className="text-ehsBlue hover:text-ehsDeepBlue font-black hover:underline cursor-pointer"
                        >
                          View Sheet
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedQuoteForEdit(q)}
                          className="px-2.5 py-1 bg-ehsSoftBlue hover:bg-ehsLightBlue/40 text-ehsDeepBlue font-black rounded-lg text-[11px] border border-ehsBlue/20 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete quote ${q.quoteNumber} for ${q.customerName}?`)) {
                              onDeleteQuote?.(q.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1 font-bold cursor-pointer"
                          title="Delete Quote"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Preview & Printable Sheet Modal */}
      {selectedQuoteForPreview && (
        <div className="fixed inset-0 z-50 bg-ehsNavy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-ehsBlue/20 space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-ehsBlue/10">
              <div>
                <span className="text-[10px] font-mono text-ehsBlue font-black">
                  {selectedQuoteForPreview.quoteNumber}
                </span>
                <h3 className="text-xl font-black text-ehsNavy">
                  {selectedQuoteForPreview.customerName}
                </h3>
                <p className="text-slate-500 text-xs">
                  {selectedQuoteForPreview.homeModel} • {selectedQuoteForPreview.propertyAddress}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuoteForPreview(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-ehsSoftBlue/50 rounded-2xl space-y-2 border border-ehsBlue/10">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Base Home Package:</span>
                <span>${selectedQuoteForPreview.homePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Land / Homesite:</span>
                <span>${selectedQuoteForPreview.propertyPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Turnkey Freight, Prep &amp; Utilities:</span>
                <span>${selectedQuoteForPreview.siteWorkTotal.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-ehsBlue/20 flex justify-between font-black text-base text-ehsNavy">
                <span>Total Turnkey Investment:</span>
                <span className="text-ehsBlue text-lg">
                  ${selectedQuoteForPreview.totalTurnkeyPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-ehsBlue/10">
                <span className="text-slate-400 block font-medium">Down Payment ({selectedQuoteForPreview.downPaymentPercent}%):</span>
                <span className="font-black text-sm text-ehsNavy">
                  ${selectedQuoteForPreview.downPaymentAmount.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-ehsBlue/10">
                <span className="text-slate-400 block font-medium">Est. Monthly Mortgage (P&amp;I):</span>
                <span className="font-black text-sm text-emerald-700">
                  ${selectedQuoteForPreview.estimatedMonthlyPayment}/month
                </span>
              </div>
            </div>

            {selectedQuoteForPreview.notes && (
              <p className="p-3 bg-ehsSoftBlue text-ehsDeepBlue rounded-xl text-xs font-semibold border border-ehsBlue/15">
                📝 {selectedQuoteForPreview.notes}
              </p>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedQuoteForEdit(selectedQuoteForPreview);
                  setSelectedQuoteForPreview(null);
                }}
                className="text-ehsBlue hover:text-ehsDeepBlue hover:underline font-black cursor-pointer"
              >
                ✎ Edit Line Items
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-ehsSoftBlue hover:bg-ehsLightBlue/40 text-ehsDeepBlue rounded-full font-black border border-ehsBlue/20 cursor-pointer"
                >
                  🖨️ Print Quote Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForPreview(null)}
                  className="px-5 py-2 bg-ehsBlue hover:bg-ehsDeepBlue text-white rounded-full font-black cursor-pointer shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quote Modal */}
      {selectedQuoteForEdit && (
        <EditQuoteModal
          quote={selectedQuoteForEdit}
          isOpen={Boolean(selectedQuoteForEdit)}
          onClose={() => setSelectedQuoteForEdit(null)}
          onSaveQuote={(updated) => {
            onUpdateQuote?.(updated);
            setSelectedQuoteForEdit(null);
          }}
          onDeleteQuote={(id) => {
            onDeleteQuote?.(id);
            setSelectedQuoteForEdit(null);
          }}
        />
      )}
    </div>
  );
}
