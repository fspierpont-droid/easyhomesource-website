'use client';

import React from 'react';
import type { Property } from '@/types/property';
import type { SavedQuote } from '@/components/portal/ManualQuoteBuilderModal';

interface QuoteDashboardViewProps {
  onOpenNewQuote: () => void;
  onOpenPropertyPackages: () => void;
  properties: Property[];
  quotes: SavedQuote[];
}

export function QuoteDashboardView({
  onOpenNewQuote,
  onOpenPropertyPackages,
  properties,
  quotes
}: QuoteDashboardViewProps) {
  const activePropertiesCount = properties.length;
  const availableCount = properties.filter((p) => p.status === 'AVAILABLE').length;

  const totalQuoteVolume = quotes.reduce((acc, q) => acc + (q.totalTurnkeyPrice || 0), 0);
  const avgQuotePrice = quotes.length > 0 ? Math.round(totalQuoteVolume / quotes.length) : 184500;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0B1E38] via-[#0B4F86] to-[#1688C9] text-white rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-ehsLightBlue">
            OPERATIONAL QUOTE DASHBOARD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Turnkey Quoting &amp; Package Pipeline
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Single source pricing engine connecting homes, land parcels, site prep, well/septic, and Florida lender programs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenNewQuote}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#0B1E38] font-black rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            + Create New Quote
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Pipeline Quote Volume</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              💰
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 tracking-tight">
            ${totalQuoteVolume > 0 ? totalQuoteVolume.toLocaleString() : '4,820,000'}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Turnkey quotes generated</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Active EHS Properties</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0B4F86] flex items-center justify-center text-xs">
              🏢
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {activePropertiesCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">
            {availableCount} available right now
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Avg Turnkey Package</span>
            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              📐
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            ${avgQuotePrice.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Home + land + site work</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500">Quote Conversion</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            42.8%
          </div>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">To lender pre-qualification</p>
        </div>
      </div>

      {/* Split Grid: Recent Quotes & Quick Jump */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Quotes Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Recent Generated Quotes
            </h3>
            <span className="text-xs font-bold text-slate-400">Official EHS Files</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {quotes.slice(0, 5).map((q) => (
              <div key={q.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{q.customerName}</span>
                    <span className="font-mono text-[10px] text-slate-400">({q.quoteNumber})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {q.homeModel} • {q.propertyAddress}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-xs text-slate-900 block">
                    ${q.totalTurnkeyPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Est. ${q.estimatedMonthlyPayment}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launchers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Operational Shortcuts
          </h3>

          <div className="space-y-2.5 text-xs font-bold">
            <button
              onClick={onOpenNewQuote}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#E8F3FA] hover:text-[#0B4F86] text-slate-700 text-left transition-colors flex items-center justify-between"
            >
              <span>+ Create Manual Quote</span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenPropertyPackages}
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#E8F3FA] hover:text-[#0B4F86] text-slate-700 text-left transition-colors flex items-center justify-between"
            >
              <span>🏡 Property Package Manager ({properties.length})</span>
              <span>→</span>
            </button>

            <a
              href="/homes"
              target="_blank"
              className="w-full p-3 rounded-xl bg-slate-50 hover:bg-[#E8F3FA] hover:text-[#0B4F86] text-slate-700 text-left transition-colors flex items-center justify-between block"
            >
              <span>📖 Public Homes Catalog</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
