'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface QuotePortalShellProps {
  children: React.ReactNode;
  activeNav?: string;
  onNewManualQuote?: () => void;
}

export function QuotePortalShell({
  children,
  activeNav = 'property-packages',
  onNewManualQuote
}: QuotePortalShellProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'quote-dashboard',
      label: 'Quote Dashboard',
      href: '/portal?module=dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'ready-to-quote',
      label: 'Ready to Quote',
      href: '/portal?module=ready',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'quote-library',
      label: 'Quote Library',
      href: '/portal?module=library',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'home-catalog',
      label: 'Home Catalog',
      href: '/homes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'home-inventory',
      label: 'Home Inventory',
      href: '/portal?module=inventory',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'property-packages',
      label: 'Property Packages',
      href: '/property-packages',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
            <span className="text-xl">🏡</span>
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
              Easy HomeSource
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quote Portal
            </div>
          </div>
        </div>

        {/* New Manual Quote Action */}
        <div className="p-4">
          <button
            type="button"
            onClick={onNewManualQuote || (() => alert('Ready to configure a new quote. Property Center single source data is loaded!'))}
            className="w-full bg-[#0B1E38] hover:bg-[#081628] text-white font-bold py-2.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-95"
          >
            <span className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[11px] font-bold">
              +
            </span>
            <span>New Manual Quote</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.id === activeNav ||
              (item.id === 'property-packages' && (pathname === '/property-packages' || pathname === '/portal'));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#E8F3FA] text-[#0B4F86] font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-[#0B4F86]' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-600">
            <span>Single Source Database</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Authenticated operational hub. Replacing spreadsheets.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {children}
      </div>
    </div>
  );
}
