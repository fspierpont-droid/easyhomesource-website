'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SiteLogo } from '@/components/SiteLogo';
import { useAuth } from '@/lib/auth/AuthContext';

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
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'projects',
      label: 'Project Board',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    }
  ];

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SP';

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ehs_token');
      localStorage.removeItem('ehs_user');
    }
    logout();
  };

  const handleNavClick = (id: string) => {
    setMobileOpen(false);
    if (id === 'catalog') {
      window.open('/homes', '_blank');
    } else {
      onNavChange(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row antialiased w-full overflow-x-hidden">
      {/* Mobile Top Header Bar (Only visible on small screens < lg) */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link href="/portal" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B1E38] to-[#1E6FA8] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
              EHS
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900 leading-tight">
                QUOTE PORTAL
              </div>
              <div className="text-[9px] font-bold text-emerald-600">ERP V05</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewManualQuote}
            className="px-3 py-1.5 bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black rounded-lg text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            + New Quote
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Responsive Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 max-w-[85vw] border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen shadow-2xl lg:shadow-2xs transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/portal" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-slate-900 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B1E38] to-[#1E6FA8] text-white font-black text-xs flex items-center justify-center shadow-xs">
              EHS
            </div>
            <div>
              <div className="font-extrabold text-xs tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>QUOTE PORTAL</span>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                  ERP V05
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Operations Single Source</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* New Manual Quote Action Button */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onNewManualQuote?.();
            }}
            className="w-full bg-[#0B1E38] hover:bg-[#081628] text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-black">
              +
            </span>
            <span>New Manual Quote</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-[#0B1E38]' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Settings & User Profile Section */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          {/* GHL & Pricing / Users Links */}
          <div className="space-y-1">
            <Link
              href="/settings?tab=imports"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <span>⚡</span>
              <span>GHL Import Settings</span>
            </Link>

            <Link
              href="/settings?tab=users"
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeNav === 'settings'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span>⚙️</span>
              <span>Pricing / Users</span>
            </Link>
          </div>

          {/* Logged in User Profile Card */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0B1E38] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">
                {user?.name || 'Scott Pierpont'}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>

          {/* Change Password & Sign Out */}
          <div className="space-y-0.5 text-[11px] font-semibold text-slate-500">
            <Link
              href="/settings?tab=users"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-800 transition-colors"
            >
              <span>🔑</span>
              <span>Change Password</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-colors text-left cursor-pointer"
            >
              <span>↪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
