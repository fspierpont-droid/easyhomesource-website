'use client';

import React from 'react';
import { SiteLogo } from '@/components/SiteLogo';

interface QuotePortalShellProps {
  children: React.ReactNode;
  activeNav: string;
  onNavChange: (navId: string) => void;
  onNewManualQuote?: () => void;
}

export function QuotePortalShell({
  children,
  activeNav = 'dashboard',
  onNavChange,
  onNewManualQuote
}: QuotePortalShellProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Quote Dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'ready',
      label: 'Ready to Quote',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'library',
      label: 'Quote Library',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'catalog',
      label: 'Home Catalog',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'inventory',
      label: 'Home Inventory',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'property-packages',
      label: 'Property Packages',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-ehsSoftBlue/40 text-ehsBlack font-sans flex antialiased w-full">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-ehsBlue/10 bg-white flex flex-col shrink-0 min-h-screen shadow-sm shadow-ehsNavy/5">
        {/* Brand Header */}
        <div className="p-5 border-b border-ehsBlue/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SiteLogo />
          </div>
        </div>

        {/* New Manual Quote Action Button (Matching website's bold CTA style) */}
        <div className="p-4">
          <button
            type="button"
            onClick={onNewManualQuote}
            className="w-full bg-ehsBlue hover:bg-ehsDeepBlue text-white font-black py-3 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-lg shadow-ehsBlue/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-ehsLightBlue/60"
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-black">
              +
            </span>
            <span>New Manual Quote</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'catalog') {
                    window.open('/homes', '_blank');
                  } else {
                    onNavChange(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-ehsSoftBlue text-ehsDeepBlue ring-1 ring-ehsBlue/20 shadow-xs'
                    : 'text-ehsNavy/70 hover:bg-ehsSoftBlue/60 hover:text-ehsDeepBlue'
                }`}
              >
                <span className={isActive ? 'text-ehsBlue' : 'text-ehsNavy/40'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-ehsBlue/10 bg-ehsSoftBlue/30 text-[11px] text-ehsNavy/60 space-y-1.5 rounded-b-2xl m-3">
          <div className="flex items-center justify-between font-black text-ehsNavy">
            <span>Single Source System</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10.5px] leading-relaxed text-ehsNavy/55 font-medium">
            Authenticated operational portal. Single source of truth for quoting &amp; inventory.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-ehsSoftBlue/20">
        {children}
      </div>
    </div>
  );
}
