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
      id: 'dashboard',
      label: 'Quote Dashboard',
      icon: '📊',
      href: '/portal'
    },
    {
      id: 'ready',
      label: 'Ready to Quote',
      icon: '⚡',
      href: '/portal?view=ready'
    },
    {
      id: 'library',
      label: 'Quote Library',
      icon: '📄',
      href: '/portal?view=library'
    },
    {
      id: 'catalog',
      label: 'Home Catalog',
      icon: '📖',
      href: '/homes'
    },
    {
      id: 'inventory',
      label: 'Home Inventory',
      icon: '🏠',
      href: '/portal?view=inventory'
    },
    {
      id: 'property-packages',
      label: 'Property Packages',
      icon: '📍',
      href: '/portal?view=property-packages',
      badge: totalPropertiesCount > 0 ? String(totalPropertiesCount) : undefined
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
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-slate-700 lg:hidden p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modules Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Turnkey Quoting Engine
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Admin & Integrations */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Integrations &amp; Users
            </div>
            <nav className="space-y-0.5">
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span>⚡</span>
                <span>GHL Import Settings</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#0F2A47]/5 text-[#0F2A47] border border-[#0F2A47]/10"
              >
                <span>⚙️</span>
                <span>Pricing / Users</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Verified User: Scott Pierpont (Admin) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0B1E38] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                SP
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Scott Pierpont</p>
                <p className="text-[10px] text-slate-500 font-semibold truncate">Admin</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-500">
            <Link href="/settings" className="hover:text-slate-800 flex items-center gap-1">
              <span>🔑</span>
              <span>Change Password</span>
            </Link>
            <Link href="/portal" className="hover:text-rose-600 flex items-center gap-1">
              <span>↪</span>
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
