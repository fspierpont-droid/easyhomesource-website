'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Property, PropertyStats } from '@/types/property';
import { PropertyTable } from '@/components/portal/PropertyTable';
import { PropertyMap } from '@/components/portal/PropertyMap';
import { PropertyKanban } from '@/components/portal/PropertyKanban';
import { PropertyEditor } from '@/components/portal/PropertyEditor';
import { AddPropertyModal } from '@/components/portal/AddPropertyModal';
import { PropertyAnalyticsView } from '@/components/portal/PropertyAnalyticsView';

export function PropertyPackageManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'table' | 'map' | 'kanban' | 'analytics'>('table');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');

  // Drawer / Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch properties from live Single Source API
  const loadData = useCallback(async () => {
    try {
      const [propsRes, statsRes] = await Promise.all([
        fetch('/api/portal/properties'),
        fetch('/api/portal/properties/stats')
      ]);

      const propsData = await propsRes.json();
      const statsData = await statsRes.json();

      if (propsData.success) {
        setProperties(propsData.properties);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load Property Center records:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    try {
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

  // Metrics from actual data
  const totalCount = properties.length;
  const availableNowCount = properties.filter((p) => p.status === 'AVAILABLE').length;
  const availableHomesSitesCount = properties.filter(
    (p) => p.status === 'AVAILABLE' && (p.propertyType === 'HOME' || p.propertyType === 'LAND' || p.propertyType === 'LAND_HOME_PACKAGE')
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
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs text-xs transition-colors disabled:opacity-50"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1E38] hover:bg-[#081628] text-white font-bold rounded-xl shadow-xs text-xs transition-all active:scale-95"
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
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
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-ehsBlue border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading Property Center verified inventory...</p>
        </div>
      ) : (
        <>
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
    </div>
  );
}
