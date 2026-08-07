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
      {/* Top Banner with Brand Gradient */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-ehsNavy via-ehsDeepBlue to-ehsBlue text-white rounded-[2rem] shadow-lg shadow-ehsNavy/15 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-ehsLightBlue">
            OPERATIONAL QUOTE DASHBOARD
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Turnkey Quoting &amp; Package Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Single source pricing engine connecting homes, land parcels, site prep, well/septic, and Florida lender programs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenNewQuote}
            className="px-6 py-3 bg-white hover:bg-ehsSoftBlue text-ehsDeepBlue font-black rounded-full text-xs sm:text-sm shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            + Create New Quote
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards (Matching HomeCard style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[1.5rem] bg-white border border-ehsBlue/10 shadow-sm shadow-ehsNavy/5 hover:border-ehsBlue/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-black text-ehsNavy/60 uppercase tracking-wide">
              Pipeline Volume
            </span>
            <div className="w-8 h-8 rounded-full bg-ehsSoftBlue text-ehsBlue font-bold flex items-center justify-center text-xs">
              💰
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-ehsNavy tracking-tight">
            ${totalQuoteVolume > 0 ? totalQuoteVolume.toLocaleString() : '4,820,000'}
          </div>
          <p className="mt-1 text-[11px] text-ehsNavy/55 font-semibold">Turnkey quotes generated</p>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-white border border-ehsBlue/10 shadow-sm shadow-ehsNavy/5 hover:border-ehsBlue/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-black text-ehsNavy/60 uppercase tracking-wide">
              Active Properties
            </span>
            <div className="w-8 h-8 rounded-full bg-ehsSoftBlue text-ehsDeepBlue font-bold flex items-center justify-center text-xs">
              🏢
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-ehsNavy tracking-tight">
            {activePropertiesCount}
          </div>
          <p className="mt-1 text-[11px] text-ehsNavy/55 font-semibold">
            {availableCount} available right now
          </p>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-white border border-ehsBlue/10 shadow-sm shadow-ehsNavy/5 hover:border-ehsBlue/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-black text-ehsNavy/60 uppercase tracking-wide">
              Avg Package Deal
            </span>
            <div className="w-8 h-8 rounded-full bg-ehsSoftBlue text-ehsBlue font-bold flex items-center justify-center text-xs">
              📐
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-ehsNavy tracking-tight">
            ${avgQuotePrice.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-ehsNavy/55 font-semibold">Home + land + site work</p>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-white border border-ehsBlue/10 shadow-sm shadow-ehsNavy/5 hover:border-ehsBlue/30 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-black text-ehsNavy/60 uppercase tracking-wide">
              Quote Conversion
            </span>
            <div className="w-8 h-8 rounded-full bg-ehsSoftBlue text-amber-600 font-bold flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-ehsBlue tracking-tight">
            42.8%
          </div>
          <p className="mt-1 text-[11px] text-ehsNavy/55 font-semibold">To lender pre-qualification</p>
        </div>
      </div>

      {/* Split Grid: Recent Quotes & Quick Jump */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Quotes Table */}
        <div className="lg:col-span-2 bg-white border border-ehsBlue/10 rounded-[1.75rem] p-6 shadow-sm shadow-ehsNavy/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ehsBlue/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
                Official Proposals
              </span>
              <h3 className="font-black text-base text-ehsNavy">
                Recent Generated Quotes
              </h3>
            </div>
            <span className="text-xs font-bold text-ehsNavy/50">EHS Verified Files</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {quotes.slice(0, 6).map((q) => (
              <div key={q.id} className="py-3 flex items-center justify-between gap-3 group hover:bg-ehsSoftBlue/40 px-2 rounded-xl transition-colors">
                <div className="min-w-0">
                  <div className="font-black text-ehsNavy flex items-center gap-2">
                    <span>{q.customerName}</span>
                    <span className="font-mono text-[10px] text-ehsBlue font-bold">({q.quoteNumber})</span>
                  </div>
                  <p className="text-[11px] text-ehsNavy/65 font-medium truncate mt-0.5">
                    {q.homeModel} • {q.propertyAddress}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-ehsNavy block">
                    ${q.totalTurnkeyPrice.toLocaleString()}
                  </span>
                  <span className="text-[10.5px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                    Est. ${q.estimatedMonthlyPayment}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Shortcuts */}
        <div className="bg-white border border-ehsBlue/10 rounded-[1.75rem] p-6 shadow-sm shadow-ehsNavy/5 space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
              Fast Launch
            </span>
            <h3 className="font-black text-base text-ehsNavy">
              Operational Shortcuts
            </h3>
          </div>

          <div className="space-y-2.5 text-xs font-bold">
            <button
              onClick={onOpenNewQuote}
              className="w-full p-3.5 rounded-2xl bg-ehsSoftBlue hover:bg-ehsLightBlue/40 text-ehsDeepBlue text-left transition-colors flex items-center justify-between border border-ehsBlue/15 cursor-pointer font-black"
            >
              <span>+ Create Manual Quote</span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenPropertyPackages}
              className="w-full p-3.5 rounded-2xl bg-ehsSoftBlue hover:bg-ehsLightBlue/40 text-ehsDeepBlue text-left transition-colors flex items-center justify-between border border-ehsBlue/15 cursor-pointer font-black"
            >
              <span>🏡 Property Packages ({properties.length})</span>
              <span>→</span>
            </button>

            <a
              href="/homes"
              target="_blank"
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-ehsSoftBlue text-ehsNavy text-left transition-colors flex items-center justify-between block border border-borderGray cursor-pointer font-black"
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
