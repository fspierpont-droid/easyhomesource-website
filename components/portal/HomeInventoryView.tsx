'use client';

import React from 'react';
import { homes } from '@/data/homes';
import Link from 'next/link';

export function HomeInventoryView() {
  const displayModels = homes.filter((h) => h.isOnDisplay || h.isFeatured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-[#0284c7]">
            DEALERSHIP DISPLAY &amp; FACTORY ALLOCATIONS
          </p>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Brooksville Display Lot Inventory ({displayModels.length} Models On Lot)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            9011 McIntyre Rd, Brooksville, FL 34601 • Factory build allocations &amp; lot display staging.
          </p>
        </div>

        <Link
          href="/homes"
          target="_blank"
          className="px-4 py-2 bg-white border border-slate-200 text-[#0B4F86] font-bold rounded-xl text-xs hover:bg-slate-50"
        >
          View Public Catalog ↗
        </Link>
      </div>

      {/* Grid of Display Models */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayModels.map((home) => (
          <div
            key={home.slug}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="relative h-36 bg-slate-100 overflow-hidden">
                {home.gallery?.[0]?.src ? (
                  <img
                    src={home.gallery[0].src}
                    alt={home.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-xs font-bold text-slate-400">
                    🏡 Display Lot
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  {home.isOnDisplay ? 'On Display' : 'Catalog Order'}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {home.manufacturer || 'Clayton / Cavco'}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {home.displayName ?? home.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {home.bedrooms} bed • {home.bathrooms} bath • {home.squareFeet} sq ft
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Starting Retail MSRP
                  </span>
                  <span className="text-base font-black text-[#0B4F86]">
                    {home.startingPrice ? `$${Math.round(home.startingPrice).toLocaleString()}` : 'Call for price'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Link
                href={`/get-quote?home=${home.slug}`}
                target="_blank"
                className="w-full py-2 bg-slate-100 hover:bg-[#E8F3FA] hover:text-[#0B4F86] text-slate-700 font-bold rounded-xl text-xs text-center block transition-colors"
              >
                Configure Master Quote
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
