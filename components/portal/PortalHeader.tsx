'use client';

import React from 'react';
import Link from 'next/link';

interface PortalHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalCount: number;
}

export function PortalHeader({
  onOpenMobileMenu,
  onOpenAddModal,
  searchQuery,
  setSearchQuery,
  totalCount
}: PortalHeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile menu button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Property Center</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {totalCount} Total
            </span>
          </h1>
        </div>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, city, parcel #, builder..."
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/40 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
        >
          <span>Marketing Site</span>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-ehsDeepBlue hover:bg-ehsNavy text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Property</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}
