'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const text = [
      q.quoteNumber,
      q.customerName,
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

  const getShareUrl = (q: SavedQuote) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/quote/${q.shareToken || q.id}`;
  };

  const handleCopyShareLink = (q: SavedQuote) => {
    const url = getShareUrl(q);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToken(q.id);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  const handlePrintQuote = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1E6FA8]">
            PROCESSED PROPOSALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E38] mt-0.5">
            Quote Library &amp; Pricing Records ({quotes.length} Quotes)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Official EHS proposals with itemized breakdown of home, freight, site prep, utilities, 3% sales tax, and PDF export.
          </p>
        </div>

        <button
          onClick={onOpenQuoteBuilder}
          className="px-5 py-2.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <span>+</span>
          <span>New Manual Quote</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="p-4 bg-white border border-slate-200 rounded-[1.5rem] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quote #, customer name, model, address..."
          className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E6FA8] focus:ring-2 focus:ring-[#1E6FA8]/20"
        />

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All ({quotes.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
      <div className="bg-white border border-slate-200 rounded-[1.75rem] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Home Model</th>
                <th className="py-3 px-4">Homesite / Address</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">3% Tax</th>
                <th className="py-3 px-4">Estimated Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    No proposals match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const homeP = Number(q.homePrice) || 0;
                  const landP = Number(q.propertyPrice) || 0;
                  const freightP = Number(q.freightDelivery) || 0;
                  const siteP = Number(q.siteWorkTotal) || 0;
                  const disc = Number(q.discounts) || 0;

                  const subtotal = q.subtotal || (homeP + landP + freightP + siteP - disc);
                  const tax = q.salesTax || Math.round(subtotal * 0.03 * 100) / 100;
                  const estimatedTotal = q.estimatedTotal || q.totalTurnkeyPrice || Math.round((subtotal + tax) * 100) / 100;

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1E6FA8]">
                        {q.quoteNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-black text-[#0B1E38]">{q.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{q.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{q.homeModel}</td>
                      <td className="py-3.5 px-4 text-slate-500 truncate max-w-[180px]" title={q.propertyAddress}>
                        {q.propertyAddress}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E6FA8]">
                        ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#0F2A47] text-sm">
                        ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            className="text-[#1E6FA8] hover:text-[#0B1E38] font-black hover:underline cursor-pointer"
                          >
                            View Sheet
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedQuoteForEdit(q)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0B1E38] font-black rounded-lg text-[11px] border border-slate-200 cursor-pointer"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Preview Modal (Sized Generously: max-w-4xl max-h-[92vh] so nothing is squished) */}
      {selectedQuoteForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#1E6FA8] font-bold">
                    {selectedQuoteForPreview.quoteNumber}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px]">
                    {selectedQuoteForPreview.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#0B1E38] mt-1">
                  {selectedQuoteForPreview.customerName}
                </h3>
                <p className="text-slate-500 text-xs">
                  {selectedQuoteForPreview.homeModel} • {selectedQuoteForPreview.propertyAddress}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getShareUrl(selectedQuoteForPreview)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#0F2A47] font-bold rounded-xl text-xs border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <span>🌐</span>
                  <span>Open Customer View ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handlePrintQuote}
                  className="px-4 py-2 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📄</span>
                  <span>Download / Print PDF</span>
                </button>

                <button
                  onClick={() => setSelectedQuoteForPreview(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Financial Breakdown Box (100% Mathematically Exact) */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Itemized Turnkey Investment Breakdown
                </span>

                {(() => {
                  const homeP = Number(selectedQuoteForPreview.homePrice) || 0;
                  const landP = Number(selectedQuoteForPreview.propertyPrice) || 0;
                  const freightP = Number(selectedQuoteForPreview.freightDelivery) || 0;
                  const siteP = Number(selectedQuoteForPreview.siteWorkTotal) || 0;
                  const disc = Number(selectedQuoteForPreview.discounts) || 0;

                  const subtotal = homeP + landP + freightP + siteP - disc;
                  const tax = Math.round(subtotal * 0.03 * 100) / 100;
                  const estimatedTotal = Math.round((subtotal + tax) * 100) / 100;

                  return (
                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex justify-between font-semibold">
                        <span>Base Manufactured Home:</span>
                        <span className="tabular font-bold text-slate-900">${homeP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {landP > 0 && (
                        <div className="flex justify-between font-semibold">
                          <span>Land / Homesite Parcel:</span>
                          <span className="tabular font-bold text-slate-900">${landP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-semibold">
                        <span>Freight Transport &amp; Delivery:</span>
                        <span className="tabular font-bold text-slate-900">${freightP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex justify-between font-semibold">
                        <span>Site Work, Prep &amp; Utilities:</span>
                        <span className="tabular font-bold text-slate-900">${siteP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {disc > 0 && (
                        <div className="flex justify-between font-semibold text-rose-600">
                          <span>Discounts &amp; Adjustments:</span>
                          <span className="tabular font-bold">- ${disc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="my-2 border-t border-slate-200" />

                      <div className="flex justify-between font-bold text-slate-900 text-sm">
                        <span>Subtotal:</span>
                        <span className="tabular">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Financed subtotal:</span>
                        <span className="tabular">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 text-[11px]">
                        <span>Tax basis:</span>
                        <span className="tabular">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#1E6FA8]">
                        <span>3% Florida Sales Tax (3.00%):</span>
                        <span className="tabular">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {/* Prominent Dark Navy ESTIMATED TOTAL banner */}
                      <div className="flex justify-between items-center bg-[#0F2A47] text-white p-4 rounded-xl shadow-md mt-3">
                        <span className="font-extrabold text-xs uppercase tracking-wider">ESTIMATED TOTAL</span>
                        <span className="font-black text-2xl tracking-tight tabular">
                          ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Itemized Line Items Detail */}
              {selectedQuoteForPreview.lineItems && selectedQuoteForPreview.lineItems.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Itemized Scope of Services
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {selectedQuoteForPreview.lineItems.map((item) => (
                      <div key={item.id} className="p-3 flex justify-between items-center bg-white hover:bg-slate-50/80">
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[10.5px] text-slate-500">{item.description}</div>
                        </div>
                        <div className="font-black text-slate-900 ml-4 shrink-0 tabular">
                          ${(item.totalPrice || item.unitPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consultant Notes */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed space-y-1">
                <span className="font-bold text-slate-900 block">Consultant Notes:</span>
                <p>{selectedQuoteForPreview.notes || 'Standard turnkey package estimate for Central Florida with site prep, delivery, tie-downs, A/C, and permits.'}</p>
              </div>

              {/* Footer Share Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  Easy HomeSource • 9011 McIntyre Rd, Brooksville, FL 34601 • (352) 558-8888
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(selectedQuoteForPreview)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F2A47] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {copiedToken === selectedQuoteForPreview.id ? '✓ Copied Share Link!' : '🔗 Copy Customer Share Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedQuoteForEdit && (
        <EditQuoteModal
          quote={selectedQuoteForEdit}
          isOpen={true}
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
