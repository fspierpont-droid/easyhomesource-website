'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Property, PropertyStats } from '@/types/property';
import { INITIAL_PROPERTIES, calculatePropertyStats } from '@/lib/db/propertyStore';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';
import { PropertyTable } from '@/components/portal/PropertyTable';
import { PropertyMap } from '@/components/portal/PropertyMap';
import { PropertyKanban } from '@/components/portal/PropertyKanban';
import { PropertyEditor } from '@/components/portal/PropertyEditor';
import { AddPropertyModal } from '@/components/portal/AddPropertyModal';
import { PropertyAnalyticsView } from '@/components/portal/PropertyAnalyticsView';
import { ManualQuoteBuilderModal, type SavedQuote } from '@/components/portal/ManualQuoteBuilderModal';
import { QuoteDashboardView } from '@/components/portal/QuoteDashboardView';
import { ReadyToQuoteView, type ReadyBuyer } from '@/components/portal/ReadyToQuoteView';
import { QuoteLibraryView } from '@/components/portal/QuoteLibraryView';
import { HomeInventoryView } from '@/components/portal/HomeInventoryView';

interface PropertyPackageManagerProps {
  initialNav?: string;
}

export function PropertyPackageManager({ initialNav = 'property-packages' }: PropertyPackageManagerProps) {
  const [activeModule, setActiveModule] = useState<string>(initialNav);

  // Seed with verified production single source of truth data immediately
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [stats, setStats] = useState<PropertyStats>(calculatePropertyStats());
  const [quotes, setQuotes] = useState<SavedQuote[]>([
    {
      id: 'quote-1',
      quoteNumber: 'Q-2026-0801',
      customerName: 'Sarah Jenkins',
      customerPhone: '352-555-0192',
      customerEmail: 'sarah.j@example.com',
      homeModel: 'Move on Up (3b/2ba)',
      homePrice: 94900,
      propertyAddress: '6645 W Erlen Ln, Homosassa',
      propertyPrice: 49900,
      siteWorkTotal: 34500,
      freightDelivery: 3850,
      acSystem: 5400,
      permitsFees: 2650,
      skirtingSteps: 3200,
      totalTurnkeyPrice: 179300,
      downPaymentPercent: 10,
      downPaymentAmount: 17930,
      estimatedMonthlyPayment: 1058,
      salesperson: 'Ken License',
      status: 'APPROVED',
      notes: 'FHA pre-approval with local Florida manufactured lender.',
      createdAt: '2026-08-07T09:30:00Z',
      updatedAt: '2026-08-07T09:30:00Z'
    },
    {
      id: 'quote-2',
      quoteNumber: 'Q-2026-0802',
      customerName: 'Carlos Mendez',
      customerPhone: '813-555-0481',
      customerEmail: 'cmendez88@example.com',
      homeModel: 'The Tulip ($39,888)',
      homePrice: 39888,
      propertyAddress: 'Buyer Owned Land (Spring Hill)',
      propertyPrice: 0,
      siteWorkTotal: 28900,
      freightDelivery: 3850,
      acSystem: 5400,
      permitsFees: 2650,
      skirtingSteps: 3200,
      totalTurnkeyPrice: 68788,
      downPaymentPercent: 10,
      downPaymentAmount: 6878,
      estimatedMonthlyPayment: 406,
      salesperson: 'Kristen Overstreet',
      status: 'SENT_TO_BUYER',
      notes: 'Customer owns land in Hernando County. Standard well & septic hookup.',
      createdAt: '2026-08-07T08:45:00Z',
      updatedAt: '2026-08-07T08:45:00Z'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'table' | 'map' | 'kanban' | 'analytics'>('table');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');

  // Drawer / Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [quoteBuilderCustomer, setQuoteBuilderCustomer] = useState<string>('');

  // Fetch properties from live Single Source API (background sync)
  const loadData = useCallback(async () => {
    try {
      const [propsRes, statsRes] = await Promise.all([
        fetch('/api/portal/properties'),
        fetch('/api/portal/properties/stats')
      ]);

      const propsData = await propsRes.json();
      const statsData = await statsRes.json();

      if (propsData.success && Array.isArray(propsData.properties) && propsData.properties.length > 0) {
        setProperties(propsData.properties);
      }
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.warn('Syncing from in-memory store:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
      );

      const res = await fetch(`/api/portal/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, _user: 'Portal Operator' })
      });
      const data = await res.json();
      if (data.success && data.property) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? data.property : p))
        );
        if (selectedProperty?.id === id) {
          setSelectedProperty(data.property);
        }
        await loadData();
      }
    } catch (err) {
      console.error('Failed to update property:', err);
      alert('Failed to update property.');
    }
  };

  const handleAddProperty = async (newPropData: Partial<Property>) => {
    try {
      const res = await fetch('/api/portal/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPropData, user: 'Portal Operator' })
      });
      const data = await res.json();
      if (data.success && data.property) {
        setProperties((prev) => [data.property, ...prev]);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to add property:', err);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/portal/properties/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        if (selectedProperty?.id === id) {
          setSelectedProperty(null);
          setIsEditorOpen(false);
        }
        await loadData();
      }
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  const handleSaveNewQuote = (newQuote: SavedQuote) => {
    setQuotes((prev) => [newQuote, ...prev]);
  };

  const handleStartQuoteForBuyer = (buyer: ReadyBuyer) => {
    setQuoteBuilderCustomer(buyer.name);
    setIsQuoteBuilderOpen(true);
  };

  // Metrics from actual data
  const totalCount = properties.length;
  const availableNowCount = properties.filter((p) => p.status === 'AVAILABLE').length;
  const availableHomesSitesCount = properties.filter(
    (p) =>
      p.status === 'AVAILABLE' &&
      (p.propertyType === 'HOME' || p.propertyType === 'LAND' || p.propertyType === 'LAND_HOME_PACKAGE')
  ).length;
  const publiclyApprovedCount = properties.filter((p) => p.publicVisible).length;
  const needsConfirmationCount = properties.filter((p) => p.status === 'STATUS_TO_CONFIRM').length;

  const filteredProperties = properties.filter((p) => {
    if (activeStatusFilter !== 'ALL' && p.status !== activeStatusFilter) return false;
    if (searchQuery.trim()) {
      const text = [p.address, p.city, p.county, p.zip, p.parcelNumber, p.builder, p.community, p.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!text.includes(searchQuery.toLowerCase().trim())) return false;
    }
    return true;
  });

  return (
    <QuotePortalShell
      activeNav={activeModule}
      onNavChange={(navId) => setActiveModule(navId)}
      onNewManualQuote={() => {
        setQuoteBuilderCustomer('');
        setIsQuoteBuilderOpen(true);
      }}
    >
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* 1. MODULE: Quote Dashboard */}
        {activeModule === 'dashboard' && (
          <QuoteDashboardView
            onOpenNewQuote={() => {
              setQuoteBuilderCustomer('');
              setIsQuoteBuilderOpen(true);
            }}
            onOpenPropertyPackages={() => setActiveModule('property-packages')}
            properties={properties}
            quotes={quotes}
          />
        )}

        {/* 2. MODULE: Ready to Quote */}
        {activeModule === 'ready' && (
          <ReadyToQuoteView onStartQuoteForBuyer={handleStartQuoteForBuyer} />
        )}

        {/* 3. MODULE: Quote Library */}
        {activeModule === 'library' && (
          <QuoteLibraryView
            quotes={quotes}
            onOpenQuoteBuilder={() => {
              setQuoteBuilderCustomer('');
              setIsQuoteBuilderOpen(true);
            }}
          />
        )}

        {/* 4. MODULE: Home Inventory */}
        {activeModule === 'inventory' && <HomeInventoryView />}

        {/* 5. MODULE: Property Packages (The Core Property Center) */}
        {(activeModule === 'property-packages' || activeModule === 'properties') && (
          <>
            {/* Top Header Section (Matching screenshot exactly) */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">
                  LAND AND PACKAGE OPERATIONS
                </p>
                <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
                  Property Package Manager
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                  Maintain land, completed homes, in-progress properties, pricing, compatible home models, public visibility, and internal sales details from the authenticated quote portal.
                </p>
              </div>

              {/* Top Header Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl shadow-xs text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>+</span>
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            {/* 5 Summary KPI Cards (Pixel-accurate match to screenshot with live numbers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
              {/* Card 1: Active records */}
              <div
                onClick={() => setActiveStatusFilter('ALL')}
                className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                  activeStatusFilter === 'ALL'
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-600">Active records</span>
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    🏢
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {totalCount}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Internal inventory</p>
              </div>

              {/* Card 2: Available now */}
              <div
                onClick={() => setActiveStatusFilter('AVAILABLE')}
                className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                  activeStatusFilter === 'AVAILABLE'
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/20 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-600">Available now</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    📍
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
                  {availableNowCount}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Property records</p>
              </div>

              {/* Card 3: Available homes / sites */}
              <div
                onClick={() => setActiveStatusFilter('AVAILABLE')}
                className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                  activeStatusFilter === 'AVAILABLE'
                    ? 'border-slate-900 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-600">Available homes / sites</span>
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    🏠
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {availableHomesSitesCount}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Across available records</p>
              </div>

              {/* Card 4: Publicly approved */}
              <div
                onClick={() => setActiveStatusFilter('ALL')}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-600">Publicly approved</span>
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    🌐
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {publiclyApprovedCount}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Safe for website feed</p>
              </div>

              {/* Card 5: Needs confirmation */}
              <div
                onClick={() => setActiveStatusFilter('STATUS_TO_CONFIRM')}
                className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                  activeStatusFilter === 'STATUS_TO_CONFIRM'
                    ? 'border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/20 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-slate-600">Needs confirmation</span>
                  <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                    🔒
                  </div>
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight">
                  {needsConfirmationCount}
                </div>
                <p className="mt-1 text-[11px] text-slate-400 font-medium">Status or details incomplete</p>
              </div>
            </div>

            {/* Main Controls & View Switcher Bar */}
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveView('table')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeView === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>📊</span>
                  <span>Airtable Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('map')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeView === 'map'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>🗺️</span>
                  <span>Central Florida Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('kanban')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeView === 'kanban'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>📋</span>
                  <span>Pipeline Board</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('analytics')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeView === 'analytics'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>📈</span>
                  <span>Executive Analytics</span>
                </button>
              </div>

              {/* Quick Search & Status Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search address, parcel, city..."
                    className="w-56 pl-3 pr-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-ehsBlue"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {activeStatusFilter !== 'ALL' && (
                  <button
                    onClick={() => setActiveStatusFilter('ALL')}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Main View Area (Instant synchronous render, 0 loading delay) */}
            {activeView === 'table' && (
              <PropertyTable
                properties={filteredProperties}
                onSelectProperty={(property) => {
                  setSelectedProperty(property);
                  setIsEditorOpen(true);
                }}
                onUpdateProperty={handleUpdateProperty}
                onDeleteProperty={handleDeleteProperty}
                onViewOnMap={(property) => {
                  setSelectedProperty(property);
                  setActiveView('map');
                }}
              />
            )}

            {activeView === 'map' && (
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={(property) => {
                  setSelectedProperty(property);
                  setIsEditorOpen(true);
                }}
              />
            )}

            {activeView === 'kanban' && (
              <PropertyKanban
                properties={filteredProperties}
                onSelectProperty={(property) => {
                  setSelectedProperty(property);
                  setIsEditorOpen(true);
                }}
                onUpdateStatus={(id, status) =>
                  handleUpdateProperty(id, { status })
                }
              />
            )}

            {activeView === 'analytics' && stats && (
              <PropertyAnalyticsView stats={stats} />
            )}
          </>
        )}

        {/* Detailed 7-Tab Property Editor Drawer */}
        <PropertyEditor
          property={selectedProperty}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleUpdateProperty}
          onDelete={handleDeleteProperty}
        />

        {/* Fast Add Property Modal */}
        <AddPropertyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddProperty={handleAddProperty}
        />

        {/* Real Master Turnkey Quote Builder Modal */}
        <ManualQuoteBuilderModal
          isOpen={isQuoteBuilderOpen}
          onClose={() => {
            setIsQuoteBuilderOpen(false);
            setQuoteBuilderCustomer('');
          }}
          onSaveQuote={handleSaveNewQuote}
          initialCustomerName={quoteBuilderCustomer}
          availableProperties={properties.filter((p) => p.status === 'AVAILABLE')}
        />
      </div>
    </QuotePortalShell>
  );
}
