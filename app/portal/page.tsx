'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type {
  Property,
  PropertyStats,
  PropertyStatus,
  PropertyType
} from '@/types/property';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PropertyStatsCards } from '@/components/portal/PropertyStatsCards';
import { PropertyTable } from '@/components/portal/PropertyTable';
import { PropertyMap } from '@/components/portal/PropertyMap';
import { PropertyKanban } from '@/components/portal/PropertyKanban';
import { PropertyEditor } from '@/components/portal/PropertyEditor';
import { AddPropertyModal } from '@/components/portal/AddPropertyModal';
import { PropertyAnalyticsView } from '@/components/portal/PropertyAnalyticsView';

type ViewMode = 'table' | 'map' | 'kanban' | 'analytics';

export default function PortalPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewMode>('table');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [countyFilter, setCountyFilter] = useState<string>('ALL');

  // Modal / Drawer state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch properties from live Single Source of Truth API
  const fetchProperties = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (typeFilter !== 'ALL') params.set('propertyType', typeFilter);
      if (countyFilter !== 'ALL') params.set('county', countyFilter);

      const res = await fetch(`/api/portal/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  }, [searchQuery, statusFilter, typeFilter, countyFilter]);

  // Fetch real-time statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/portal/properties/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProperties(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, [fetchProperties, fetchStats]);

  // Update a property directly
  const handleUpdateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const res = await fetch(`/api/portal/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, _user: 'Tinyuniverse (Admin)' })
      });
      const data = await res.json();
      if (data.success && data.property) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? data.property : p))
        );
        if (selectedProperty?.id === id) {
          setSelectedProperty(data.property);
        }
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to update property:', err);
      alert('Failed to update property.');
    }
  };

  // Add a new property
  const handleAddProperty = async (newPropData: Partial<Property>) => {
    try {
      const res = await fetch('/api/portal/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPropData, user: 'Tinyuniverse (Admin)' })
      });
      const data = await res.json();
      if (data.success && data.property) {
        setProperties((prev) => [data.property, ...prev]);
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to create property:', err);
    }
  };

  // Delete a property
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
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  // Export properties to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Address',
      'City',
      'County',
      'State',
      'ZIP',
      'Status',
      'Type',
      'Price',
      'Beds',
      'Baths',
      'SqFt',
      'ParcelNumber',
      'Builder',
      'PublicVisible',
      'UpdatedAt'
    ];

    const rows = properties.map((p) => [
      p.id,
      `"${p.address}"`,
      `"${p.city}"`,
      `"${p.county}"`,
      p.state,
      p.zip,
      p.status,
      p.propertyType,
      p.price || '',
      p.bedrooms || '',
      p.bathrooms || '',
      p.squareFeet || '',
      `"${p.parcelNumber || ''}"`,
      `"${p.builder || ''}"`,
      p.publicVisible,
      p.updatedAt
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `EHS_Property_Inventory_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* SaaS Sidebar Navigation */}
      <PortalSidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        totalPropertiesCount={stats?.totalProperties || properties.length}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/60">
        <PortalHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={properties.length}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Automated Statistics Cards */}
          {stats && (
            <PropertyStatsCards
              stats={stats}
              activeStatusFilter={statusFilter}
              onSelectStatusFilter={(status) => {
                setStatusFilter(status);
              }}
            />
          )}

          {/* Controls Bar & View Switcher */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            {/* View Switcher Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'map'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>🗺️</span>
                <span>Interactive Map</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>📋</span>
                <span>Kanban Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'analytics'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>📈</span>
                <span>Executive Stats</span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none hover:bg-slate-100"
              >
                <option value="ALL">All Property Types</option>
                <option value="HOME">Finished Homes</option>
                <option value="LAND">Vacant Land</option>
                <option value="LAND_HOME_PACKAGE">Land & Home Packages</option>
                <option value="SPEC_HOME">Spec Homes</option>
                <option value="MODEL">Display Models</option>
              </select>

              <select
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold outline-none hover:bg-slate-100"
              >
                <option value="ALL">All Counties</option>
                <option value="Hernando">Hernando County</option>
                <option value="Citrus">Citrus County</option>
                <option value="Pasco">Pasco County</option>
              </select>

              {(statusFilter !== 'ALL' || typeFilter !== 'ALL' || countyFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setTypeFilter('ALL');
                    setCountyFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs"
                >
                  Reset
                </button>
              )}

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1"
                title="Export current view to CSV"
              >
                <span>📥</span>
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Dynamic Main View */}
          {loading ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-ehsBlue border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs font-semibold">Loading Property Center single source data...</p>
            </div>
          ) : (
            <>
              {activeView === 'table' && (
                <PropertyTable
                  properties={properties}
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
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onSelectProperty={(property) => {
                    setSelectedProperty(property);
                    setIsEditorOpen(true);
                  }}
                />
              )}

              {activeView === 'kanban' && (
                <PropertyKanban
                  properties={properties}
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
        </main>

        {/* Detailed Property Editor Drawer */}
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
    </div>
  );
}
