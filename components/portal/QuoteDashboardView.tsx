'use client';

import React from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import type { SavedQuote } from '@/data/quotesStore';

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

  const totalQuoteVolume = quotes.reduce((acc, q) => acc + (q.totalTurnkeyPrice || q.estimatedTotal || 0), 0);
  const avgQuotePrice = quotes.length > 0 ? Math.round(totalQuoteVolume / quotes.length) : 184500;

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto">
      {/* Top Banner with Brand Gradient */}
      <div className="p-5 sm:p-8 bg-gradient-to-br from-[#0B1E38] via-[#0F2A47] to-[#1E6FA8] text-white rounded-2xl sm:rounded-[2rem] shadow-lg shadow-[#0B1E38]/15 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#A8C8E6]">
            OPERATIONAL QUOTE DASHBOARD
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
            Turnkey Quoting &amp; Package Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Single source pricing engine connecting homes, land parcels, site prep, well/septic, and Florida lender programs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/quotes/new"
            className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-white hover:bg-slate-100 text-[#0F2A47] font-black rounded-xl sm:rounded-full text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
          >
            + Create New Master Quote
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards (Fully responsive on all mobile screens) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-white border border-slate-200/80 shadow-2xs hover:border-[#1E6FA8]/30 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wide">
              Pipeline Volume
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 text-[#1E6FA8] font-bold flex items-center justify-center text-xs shrink-0">
              💰
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-black text-[#0B1E38] tracking-tight truncate">
            ${totalQuoteVolume > 0 ? totalQuoteVolume.toLocaleString() : '5,270,000'}
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">
            {quotes.length} Turnkey quotes
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-white border border-slate-200/80 shadow-2xs hover:border-[#1E6FA8]/30 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wide">
              Active Properties
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 text-[#0F2A47] font-bold flex items-center justify-center text-xs shrink-0">
              🏢
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-black text-[#0B1E38] tracking-tight">
            {activePropertiesCount}
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">
            {availableCount} available right now
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-white border border-slate-200/80 shadow-2xs hover:border-[#1E6FA8]/30 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wide">
              Avg Package Deal
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 text-[#1E6FA8] font-bold flex items-center justify-center text-xs shrink-0">
              📐
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-black text-[#0B1E38] tracking-tight truncate">
            ${avgQuotePrice.toLocaleString()}
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">
            Home + land + site work
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-white border border-slate-200/80 shadow-2xs hover:border-[#1E6FA8]/30 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wide">
              Quote Conversion
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xs shrink-0">
              ⚡
            </div>
          </div>
          <div className="mt-2 text-lg sm:text-2xl lg:text-3xl font-black text-[#1E6FA8] tracking-tight">
            42.8%
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate">
            Lender pre-qualified
          </p>
        </div>
      </div>

      {/* Split Grid: Recent Quotes & Quick Jump */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Recent Quotes List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl sm:rounded-[1.75rem] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
                Official Proposals
              </span>
              <h3 className="font-black text-sm sm:text-base text-[#0B1E38]">
                Recent Generated Quotes
              </h3>
            </div>
            <Link
              href="/portal?view=library"
              className="text-xs font-bold text-[#1E6FA8] hover:underline"
            >
              View All ({quotes.length}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {quotes.slice(0, 6).map((q) => (
              <div
                key={q.id}
                className="py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[#0B1E38] flex items-center gap-2 flex-wrap">
                    <Link href={`/quotes/${q.id}`} className="hover:underline hover:text-[#1E6FA8]">
                      {q.customerName}
                    </Link>
                    <span className="font-mono text-[10px] text-[#1E6FA8] font-bold">
                      ({q.quoteNumber})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {q.homeModel} • {q.propertyAddress}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-black text-xs sm:text-sm text-[#0B1E38] block tabular">
                      ${(q.totalTurnkeyPrice || q.estimatedTotal || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                      {q.status}
                    </span>
                  </div>

                  <Link
                    href={`/quotes/${q.id}/edit`}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0B1E38] font-bold rounded-lg text-[11px] border border-slate-200"
                    title="Edit Quote"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Shortcuts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-[1.75rem] p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
              Fast Launch
            </span>
            <h3 className="font-black text-sm sm:text-base text-[#0B1E38]">
              Operational Shortcuts
            </h3>
          </div>

          <div className="space-y-2.5 text-xs font-bold">
            <Link
              href="/quotes/new"
              className="w-full p-3.5 rounded-xl sm:rounded-2xl bg-sky-50 hover:bg-sky-100/70 text-[#0F2A47] text-left transition-colors flex items-center justify-between border border-sky-200/60 font-black block"
            >
              <span>+ Create Master Quote</span>
              <span>→</span>
            </Link>

            <button
              type="button"
              onClick={onOpenPropertyPackages}
              className="w-full p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 text-[#0F2A47] text-left transition-colors flex items-center justify-between border border-slate-200 cursor-pointer font-black"
            >
              <span>🏡 Property Packages ({properties.length})</span>
              <span>→</span>
            </button>

            <Link
              href="/homes"
              target="_blank"
              className="w-full p-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-[#0B1E38] text-left transition-colors flex items-center justify-between border border-slate-200 font-black block"
            >
              <span>📖 Public Homes Catalog (225)</span>
              <span>↗</span>
            </Link>

            <Link
              href="/settings"
              className="w-full p-3.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-left transition-colors flex items-center justify-between border border-slate-200 font-bold block"
            >
              <span>⚙️ Dealership Settings</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
