'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/types/property';

interface PublicFloridaPropertyMapProps {
  properties: Property[];
}

export function PublicFloridaPropertyMap({ properties }: PublicFloridaPropertyMapProps) {
  const [activeProperty, setActiveProperty] = useState<Property | null>(properties[0] || null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapElementRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const filteredProperties = properties.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  // Initialize Real Leaflet Map with CartoDB Positron / Clean White Tiles
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapElementRef.current || leafletMapRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        if (!isMounted || !mapElementRef.current) return;

        // Create Leaflet Map instance
        const map = L.map(mapElementRef.current, {
          center: [28.5553, -82.42], // Central Florida / Brooksville
          zoom: 10,
          minZoom: 8,
          maxZoom: 17,
          zoomControl: false,
          scrollWheelZoom: true
        });

        // Crisp, high-contrast, modern clean white real-estate tiles (CartoDB Voyager / Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        // Group layer for markers
        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = { L, map, markersGroup };
        leafletMapRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.warn('Leaflet map initialization:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Markers on Filter or Property Change
  useEffect(() => {
    if (!markersLayerRef.current || !leafletMapRef.current) return;
    const { L, map, markersGroup } = markersLayerRef.current;

    markersGroup.clearLayers();

    // 1. Add Brooksville Dealership HQ Star Pin
    const hqIcon = L.divIcon({
      className: 'ehs-hq-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: #0F2A47; color: white; border: 2px solid #F59E0B; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 12px rgba(15,42,71,0.35);">
            ⭐
          </div>
          <div style="margin-top: 4px; background: white; color: #0F2A47; font-weight: 900; font-size: 10px; padding: 2px 8px; border-radius: 9999px; border: 1px solid #CBD5E1; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            EHS Dealership HQ
          </div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    const hqMarker = L.marker([28.5553, -82.3879], { icon: hqIcon }).addTo(markersGroup);
    hqMarker.bindPopup(`
      <div style="padding: 10px; font-family: inherit; font-size: 11px;">
        <strong style="color: #0F2A47; font-size: 12px; display: block;">Easy HomeSource Dealership</strong>
        <span style="color: #64748B;">9011 McIntyre Rd, Brooksville, FL 34601</span><br>
        <span style="color: #059669; font-weight: bold;">Display lot open Mon - Sat (352) 558-8888</span>
      </div>
    `);

    // 2. Add Property Pins
    filteredProperties.forEach((p) => {
      const isSelected = activeProperty?.id === p.id;
      const bg = p.status === 'AVAILABLE' ? '#059669' : p.status === 'COMING_SOON' ? '#D97706' : '#4F46E5';
      const border = isSelected ? '#0F2A47' : '#FFFFFF';
      const scale = isSelected ? 'scale(1.2)' : 'scale(1)';

      const pinIcon = L.divIcon({
        className: `ehs-property-pin-${p.id}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%) ${scale}; transition: transform 0.15s ease; cursor: pointer;">
            <div style="background: ${bg}; color: white; border: 2px solid ${border}; border-radius: 9999px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
              ${p.propertyType === 'HOME' ? '🏠' : '📍'}
            </div>
            <div style="margin-top: 3px; background: white; color: #0F2A47; font-weight: 900; font-size: 10px; padding: 2px 7px; border-radius: 9999px; border: 1.5px solid ${isSelected ? '#0F2A47' : '#CBD5E1'}; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.12);">
              $${(p.price || 0).toLocaleString()}
            </div>
          </div>
        `,
        iconSize: [26, 38],
        iconAnchor: [13, 38]
      });

      const marker = L.marker([p.latitude || 28.5553, p.longitude || -82.3879], { icon: pinIcon }).addTo(markersGroup);

      marker.on('click', () => {
        setActiveProperty(p);
        setIsPanelCollapsed(false);
      });
    });
  }, [filteredProperties, activeProperty]);

  // Controls
  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([28.5553, -82.42], 10);
    }
  };

  const handleCenterBrooksville = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([28.5553, -82.3879], 12);
    }
  };

  return (
    <div className="relative isolate bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[650px] w-full">
      {/* Top Header & Filter Ribbon */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
            Interactive Florida Map
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs font-bold text-[#0B1E38]">
            Real GIS Map ({filteredProperties.length} Properties in Citrus, Hernando, Pasco, Sumter)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All ({properties.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            🟢 Available
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('COMING_SOON')}
            className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'COMING_SOON'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            🟡 Coming Soon
          </button>
        </div>
      </div>

      {/* Main Map Workspace (Real Leaflet Map Tiles with Right Docked Side Inspector) */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-[#FAFCFF] min-h-0">
        {/* Real Leaflet Map Container */}
        <div className="flex-1 relative overflow-hidden h-full">
          <div ref={mapElementRef} className="w-full h-full" />

          {/* Floating Map HUD Controls (Zoom In, Zoom Out, Reset, Center Brooksville) */}
          <div className="map-hud-control absolute top-4 left-4 z-[400] flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200 shadow-md">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              −
            </button>
            <div className="h-px bg-slate-200 my-0.5" />
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              ⟲
            </button>
            <button
              type="button"
              onClick={handleCenterBrooksville}
              title="Center Brooksville Dealership"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1E6FA8] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              ⭐
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Coming Soon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F2A47]" />
              <span>Brooksville HQ</span>
            </div>
          </div>
        </div>

        {/* Right Docked Property Inspector Panel (Always docked strictly inside the map container) */}
        <div
          className={`bg-white border-t md:border-t-0 md:border-l border-slate-200 transition-all duration-200 z-[450] flex flex-col shrink-0 h-full ${
            isPanelCollapsed ? 'w-full md:w-12' : 'w-full md:w-80 lg:w-96'
          }`}
        >
          {isPanelCollapsed ? (
            <button
              type="button"
              onClick={() => setIsPanelCollapsed(false)}
              className="w-full h-full p-3 flex md:flex-col items-center justify-center gap-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 cursor-pointer font-bold text-xs"
            >
              <span>◀</span>
              <span className="hidden md:inline vertical-lr text-[11px]">Inspect Property</span>
            </button>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 max-h-[570px]">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#1E6FA8]">
                    {activeProperty?.id || 'PROPERTY'}
                  </span>
                  <h3 className="text-base font-black text-[#0B1E38] leading-tight mt-0.5">
                    {activeProperty?.address || 'Select a property pin'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeProperty?.city}, FL {activeProperty?.zip} • {activeProperty?.county} County
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(true)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer"
                  title="Collapse Inspector"
                >
                  ✕
                </button>
              </div>

              {activeProperty ? (
                <div className="space-y-4 text-xs">
                  {/* Price Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Land / Package Price</span>
                      <span className="text-2xl font-black text-[#0F2A47]">
                        ${(activeProperty.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`font-black px-2.5 py-1 rounded-full text-[10px] border ${
                        activeProperty.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {activeProperty.status}
                    </span>
                  </div>

                  {/* Parcel Specs */}
                  <div className="grid grid-cols-2 gap-2.5 text-[11.5px]">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Parcel Number</span>
                      <span className="font-bold text-slate-800 truncate block">{activeProperty.parcelNumber || 'Verified'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Acreage / Lot</span>
                      <span className="font-bold text-slate-800 truncate block">{activeProperty.lotSize || '0.50 Acres'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Zoning Code</span>
                      <span className="font-bold text-slate-800 truncate block">{activeProperty.zoning || 'MDR / Residential'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Allowed Width</span>
                      <span className="font-bold text-slate-800 truncate block">{activeProperty.allowedWidth || 'Single / Double Wide'}</span>
                    </div>
                  </div>

                  {/* Property Notes */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed text-[11px]">
                    <span className="font-bold text-slate-800 block mb-0.5">Site Details:</span>
                    {activeProperty.notes || 'High and dry homesite in Central Florida ready for manufactured home placement, well, and septic hookup.'}
                  </div>

                  {/* CTA Actions */}
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href={`/get-quote?property=${encodeURIComponent(activeProperty.address)}`}
                      className="w-full bg-[#0F2A47] hover:bg-[#0B1E38] text-white font-black py-2.5 rounded-xl text-center shadow-xs transition-all cursor-pointer"
                    >
                      Get Turnkey Quote for this Site →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  Click any pin on the map to inspect parcel details.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
