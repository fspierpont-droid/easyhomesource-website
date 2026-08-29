'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PortalSidebar } from '@/components/portal/PortalSidebar';

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
}: QuotePortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openNewQuote = () => {
    setMobileOpen(false);
    window.location.href = '/quotes/new';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex antialiased w-full overflow-x-hidden">
      <PortalSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeNav={activeNav}
        onNavChange={onNavChange}
      />

      <div className="flex-1 min-w-0 flex flex-col bg-slate-50/50">
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/portal" className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B1E38] to-[#1E6FA8] text-white font-black text-[11px] flex items-center justify-center shadow-xs shrink-0">
                EHS
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-slate-900 leading-tight truncate">EHS PORTAL</div>
                <div className="text-[9px] font-bold text-emerald-600">ERP V05</div>
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={openNewQuote}
            className="px-3 py-1.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-lg text-xs shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            + New Quote
          </button>
        </header>

        <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
