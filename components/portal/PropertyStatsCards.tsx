'use client';

import React from 'react';
import type { PropertyStats, PropertyStatus } from '@/types/property';

interface PropertyStatsCardsProps {
  stats: PropertyStats;
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export function PropertyStatsCards({
  stats,
  activeStatusFilter,
  onSelectStatusFilter
}: PropertyStatsCardsProps) {
  const cards: Array<{
    id: string;
    label: string;
    value: number;
    subtext: string;
    bgHover: string;
    colorClasses: string;
    borderColor: string;
    filterValue: string;
  }> = [
    {
      id: 'total',
      label: 'Total Properties',
      value: stats.totalProperties,
      subtext: `${stats.availableHomes + stats.availableLots} active in inventory`,
      bgHover: 'hover:border-slate-300',
      colorClasses: 'text-slate-900',
      borderColor: activeStatusFilter === 'ALL' ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200',
      filterValue: 'ALL'
    },
    {
      id: 'available',
      label: 'Available',
      value: stats.available,
      subtext: `${stats.availableHomes} Homes • ${stats.availableLots} Lots`,
      bgHover: 'hover:border-emerald-300',
      colorClasses: 'text-emerald-700',
      borderColor: activeStatusFilter === 'AVAILABLE' ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/30' : 'border-slate-200',
      filterValue: 'AVAILABLE'
    },
    {
      id: 'coming_soon',
      label: 'Coming Soon',
      value: stats.comingSoon,
      subtext: 'Setup & flip trades active',
      bgHover: 'hover:border-amber-300',
      colorClasses: 'text-amber-700',
      borderColor: activeStatusFilter === 'COMING_SOON' ? 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/30' : 'border-slate-200',
      filterValue: 'COMING_SOON'
    },
    {
      id: 'under_contract',
      label: 'Under Contract',
      value: stats.underContract,
      subtext: 'In lender appraisal / escrow',
      bgHover: 'hover:border-indigo-300',
      colorClasses: 'text-indigo-700',
      borderColor: activeStatusFilter === 'UNDER_CONTRACT' ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30' : 'border-slate-200',
      filterValue: 'UNDER_CONTRACT'
    },
    {
      id: 'sold',
      label: 'Sold',
      value: stats.sold,
      subtext: 'Archived closed sales',
      bgHover: 'hover:border-slate-300',
      colorClasses: 'text-slate-600',
      borderColor: activeStatusFilter === 'SOLD' ? 'border-slate-600 ring-2 ring-slate-600/20 bg-slate-50' : 'border-slate-200',
      filterValue: 'SOLD'
    },
    {
      id: 'to_confirm',
      label: 'Status To Confirm',
      value: stats.statusToConfirm,
      subtext: 'Title / city check needed',
      bgHover: 'hover:border-rose-300',
      colorClasses: 'text-rose-700',
      borderColor: activeStatusFilter === 'STATUS_TO_CONFIRM' ? 'border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/30' : 'border-slate-200',
      filterValue: 'STATUS_TO_CONFIRM'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const isSelected = activeStatusFilter === card.filterValue;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatusFilter(card.filterValue)}
            className={`text-left p-3.5 rounded-2xl bg-white border ${card.borderColor} ${card.bgHover} shadow-2xs transition-all cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">{card.label}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-ehsDeepBlue" />
              )}
            </div>
            <div className={`mt-1 text-2xl font-extrabold tracking-tight ${card.colorClasses}`}>
              {card.value}
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400 truncate">
              {card.subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
}
