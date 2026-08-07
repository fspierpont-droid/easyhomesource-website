'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PortalSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  totalPropertiesCount: number;
}

export function PortalSidebar({
  mobileOpen,
  setMobileOpen,
  totalPropertiesCount
}: PortalSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'properties',
      label: 'Property Center',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/portal',
      badge: totalPropertiesCount > 0 ? String(totalPropertiesCount) : undefined,
      active: true
    },
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      href: '/portal?view=analytics',
      badge: undefined
    },
    {
      id: 'crm',
      label: 'CRM & Inquiries',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/portal?view=crm',
      badge: 'Live'
    },
    {
      id: 'builder',
      label: 'Builder Lineups',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      href: '/portal?view=builders',
      badge: undefined
    },
    {
      id: 'reporting',
      label: 'Reports & Stats',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/portal?view=analytics',
      badge: undefined
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Portal Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2.5 text-slate-900 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ehsDeepBlue to-ehsNavy text-white font-black text-sm flex items-center justify-center shadow-xs">
              EHS
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>EHS Portal</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                  PROD
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium">Operational Single Source</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-slate-700 lg:hidden p-1"
          >
            ✕
          </button>
        </div>

        {/* Modules Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Core Platform Modules
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    item.id === 'properties'
                      ? 'bg-ehsDeepBlue text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={item.id === 'properties' ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.id === 'properties'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Architecture info */}
          <div className="px-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px] mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Single Source of Truth</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Property Center replaces spreadsheets. Quoting, CRM & website public inventory read directly from this database.
              </p>
            </div>
          </div>
        </div>

        {/* User / Organization Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-ehsSoftBlue text-ehsDeepBlue font-bold text-xs flex items-center justify-center border border-ehsBlue/20 shrink-0">
                TU
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Tinyuniverse</p>
                <p className="text-[10px] text-slate-400 truncate">f.s.pierpont@gmail.com</p>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              title="View Public Marketing Site"
              className="text-slate-400 hover:text-ehsBlue p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
