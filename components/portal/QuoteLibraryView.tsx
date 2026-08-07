'use client';

import React, { useState } from 'react';
import type { SavedQuote } from '@/components/portal/ManualQuoteBuilderModal';

interface QuoteLibraryViewProps {
  quotes: SavedQuote[];
  onOpenQuoteBuilder: () => void;
}

export function QuoteLibraryView({ quotes, onOpenQuoteBuilder }: QuoteLibraryViewProps) {
  const [search, setSearch] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    if (!search.trim()) return true;
    const text = [q.customerName, q.quoteNumber, q.homeModel, q.propertyAddress, q.salesperson]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(search.toLowerCase().trim());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0284c7]">
            PROCESSED PROPOSALS
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Quote Library &amp; Pricing Records ({quotes.length} Quotes)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official EHS proposals with itemized breakdown of home, freight, site prep, utilities, and financing.
          </p>
        </div>

        <button
          onClick={onOpenQuoteBuilder}
          className="px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl text-xs shadow-xs"
        >
          + New Quote
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by quote #, customer name, home model..."
          className="w-full max-w-sm px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0B4F86]"
        />
        <span className="text-xs font-bold text-slate-400">
          {filteredQuotes.length} proposals found
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase">
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
            {filteredQuotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[#0B4F86]">{q.quoteNumber}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{q.customerName}</td>
                <td className="py-3 px-4">{q.homeModel}</td>
                <td className="py-3 px-4 text-slate-500 truncate max-w-[180px]">{q.propertyAddress}</td>
                <td className="py-3 px-4 font-black text-slate-900">${q.totalTurnkeyPrice.toLocaleString()}</td>
                <td className="py-3 px-4 font-bold text-emerald-700">${q.estimatedMonthlyPayment}/mo</td>
                <td className="py-3 px-4">
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    {q.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedQuote(q)}
                    className="text-[#0B4F86] hover:underline font-bold"
                  >
                    View Sheet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quote Preview Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{selectedQuote.quoteNumber}</span>
                <h3 className="text-lg font-black text-slate-900">{selectedQuote.customerName}</h3>
                <p className="text-slate-500">{selectedQuote.homeModel} • {selectedQuote.propertyAddress}</p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex justify-between font-bold">
                <span>Base Home:</span>
                <span>${selectedQuote.homePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Land / Homesite:</span>
                <span>${selectedQuote.propertyPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Site Work & Logistics:</span>
                <span>${selectedQuote.siteWorkTotal.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Total Turnkey Price:</span>
                <span className="text-emerald-700">${selectedQuote.totalTurnkeyPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Down Payment:</span>
                <span className="font-bold text-slate-800">${selectedQuote.downPaymentAmount.toLocaleString()} ({selectedQuote.downPaymentPercent}%)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Est. Monthly:</span>
                <span className="font-bold text-emerald-700">${selectedQuote.estimatedMonthlyPayment}/month</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                🖨️ Print Quote
              </button>
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 bg-[#0B1E38] text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
