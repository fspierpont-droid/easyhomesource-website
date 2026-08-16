'use client';

import React from 'react';
import Link from 'next/link';

export function HomeInventoryView() {
  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1E6FA8]">
            DEALERSHIP DISPLAY INVENTORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E38] mt-0.5">
            Home Inventory &amp; Display Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-3xl leading-relaxed">
            This module is intentionally frozen for the platform baseline while the verified on-lot inventory and floorplan-financing workflow are defined and migrated.
          </p>
        </div>
        <span className="inline-flex self-start px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-black text-[10px] uppercase tracking-wider">
          Migration Frozen
        </span>
      </div>

      <div className="p-6 sm:p-8 bg-white border border-amber-200 rounded-[2rem] shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-black text-[#0B1E38]">Unverified prototype inventory removed from runtime</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-3xl">
                The previous screen used browser-only seeded records containing model names alongside unverified serial numbers, lender balances, interest rates, transport/setup costs, key-box codes, order dates, and other operational values. Those records are not being promoted into the permanent EHS database.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Displayed records</span>
                <div className="mt-1 text-2xl font-black text-[#0B1E38]">0</div>
                <p className="mt-1 text-[11px] text-slate-500">Until verified inventory is migrated</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Financial balances</span>
                <div className="mt-1 text-sm font-black text-[#0B1E38]">Not displayed</div>
                <p className="mt-1 text-[11px] text-slate-500">No unverified floorplan amounts</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Editing</span>
                <div className="mt-1 text-sm font-black text-[#0B1E38]">Locked</div>
                <p className="mt-1 text-[11px] text-slate-500">Prevents browser-only changes</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 text-slate-700 leading-relaxed">
              <strong className="text-[#0B1E38]">After the baseline:</strong> we will define exactly what “inventory” means for EHS—display homes, homes owned by EHS, consignment units, customer-sold units awaiting delivery, factory orders, floorplan-financed units, and lot location—and then build that workflow against verified data.
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/portal?view=property-packages" className="px-4 py-2.5 rounded-xl bg-[#0B1E38] text-white font-bold text-xs">
                Open Property Packages
              </Link>
              <Link href="/settings" className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs">
                View System Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
