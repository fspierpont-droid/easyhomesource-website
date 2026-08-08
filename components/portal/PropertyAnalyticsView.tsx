'use client';

import React from 'react';
import type { PropertyStats } from '@/types/property';

interface PropertyAnalyticsViewProps {
  stats: PropertyStats;
}

export function PropertyAnalyticsView({ stats }: PropertyAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Executive Key Figures */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Active Inventory Value
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            ${stats.totalActiveValue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Based on {stats.available} currently available units
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Pipeline Value
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ${stats.totalPipelineValue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Active, Coming Soon & In-Contract combined
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Average Offering Price
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-black text-ehsDeepBlue tracking-tight">
            ${stats.averagePrice.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Across all turnkey homes and multi-site packages
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available Inventory Ratio
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.availableHomes}
            </span>
            <span className="text-xs font-bold text-slate-500">Homes</span>
            <span className="text-slate-300">•</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.availableLots}
            </span>
            <span className="text-xs font-bold text-slate-500">Lots</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Single source verified balance
          </p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Breakdown by County */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Inventory Distribution by County
            </h3>
            <span className="text-xs font-bold text-slate-400">Central Florida</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(stats.byCounty).map(([county, count]) => {
              const pct = Math.round((count / stats.totalProperties) * 100) || 0;
              return (
                <div key={county} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{county}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-ehsDeepBlue h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Builder */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Inventory by Builder & Manufacturer
            </h3>
            <span className="text-xs font-bold text-slate-400">Approved Partners</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(stats.byBuilder).map(([builder, count]) => {
              const pct = Math.round((count / stats.totalProperties) * 100) || 0;
              return (
                <div key={builder} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{builder}</span>
                    <span>
                      {count} units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
