'use client';

import React, { useState } from 'react';
import type { Property } from '@/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/types/property';

interface PropertyMapProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  selectedProperty?: Property | null;
}

export function PropertyMap({
  properties,
  onSelectProperty,
  selectedProperty: externalSelected
}: PropertyMapProps) {
  const [activeProperty, setActiveProperty] = useState<Property | null>(
    externalSelected || properties[0] || null
  );

  // Filter state inside map view
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Florida Bounding Box for Hernando/Citrus/Pasco coordinate projection
  // Lat: 28.1 to 29.0, Long: -82.8 to -82.0
  const MIN_LAT = 28.1;
  const MAX_LAT = 28.95;
  const MIN_LNG = -82.85;
  const MAX_LNG = -82.05;

  const projectToMap = (lat: number, lng: number) => {
    // Normalization into percentage (0-100%)
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    const y = 100 - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(8, Math.min(92, y))
    };
  };

  const filteredProperties = properties.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-[650px] relative">
      {/* Map Control Toolbar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            📍 Central Florida Map ({filteredProperties.length} Pins)
          </span>
          <span className="text-[11px] text-slate-400">
            Hernando • Citrus • Pasco • Sumter
          </span>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({properties.length})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            🟢 Available
          </button>
          <button
            onClick={() => setStatusFilter('COMING_SOON')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'COMING_SOON'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            🟡 Coming Soon
          </button>
          <button
            onClick={() => setStatusFilter('UNDER_CONTRACT')}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              statusFilter === 'UNDER_CONTRACT'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            🟣 Under Contract
          </button>
        </div>
      </div>

      {/* Map Interactive Canvas */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden select-none">
        {/* Subtle Satellite / Blueprint Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* Florida Regional Overlay Labels */}
        <div className="absolute top-6 left-8 text-slate-400/60 font-black text-sm uppercase tracking-widest pointer-events-none">
          Citrus County (Homosassa / Crystal River)
        </div>
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 text-slate-400/60 font-black text-sm uppercase tracking-widest pointer-events-none">
          Hernando County (Brooksville / Spring Hill)
        </div>
        <div className="absolute bottom-6 right-12 text-slate-400/60 font-black text-sm uppercase tracking-widest pointer-events-none">
          Pasco County (New Port Richey / Zephyrhills)
        </div>

        {/* Central Dealership Hub Marker (Brooksville) */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          style={{
            left: `${projectToMap(28.5553, -82.3879).x}%`,
            top: `${projectToMap(28.5553, -82.3879).y}%`
          }}
        >
          <div className="w-5 h-5 rounded-full bg-ehsBlue border-2 border-white flex items-center justify-center text-[10px] shadow-lg animate-pulse">
            ⭐
          </div>
          <span className="mt-1 text-[10px] font-black text-ehsLightBlue bg-slate-900/90 px-2 py-0.5 rounded border border-ehsBlue/40">
            EHS Dealership HQ
          </span>
        </div>

        {/* Property Pins */}
        {filteredProperties.map((p) => {
          const { x, y } = projectToMap(p.latitude, p.longitude);
          const isSelected = activeProperty?.id === p.id;
          const statusConfig =
            PROPERTY_STATUS_CONFIG[p.status] || PROPERTY_STATUS_CONFIG.STATUS_TO_CONFIRM;

          return (
            <div
              key={p.id}
              onClick={() => setActiveProperty(p)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-125"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Pin Bubble */}
              <div
                className={`relative flex items-center justify-center p-1 rounded-full shadow-lg transition-all ${
                  isSelected
                    ? 'ring-4 ring-white scale-125 z-30 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                style={{ backgroundColor: statusConfig.mapPinColor }}
              >
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-slate-900">
                  {p.propertyType === 'LAND' ? '🌲' : '🏡'}
                </div>
              </div>

              {/* Pin Price Label Tag */}
              <div
                className={`mt-1 -translate-x-1/4 px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight whitespace-nowrap shadow-md border ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white font-black'
                    : 'bg-slate-900/90 text-white border-slate-700'
                }`}
              >
                {p.price ? `$${Math.round(p.price / 1000)}k` : 'Lot'}
              </div>
            </div>
          );
        })}

        {/* Floating Property Card Popup */}
        {activeProperty && (
          <div className="absolute bottom-4 left-4 z-40 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="relative h-28 bg-slate-100 overflow-hidden">
              {activeProperty.photos?.[0] ? (
                <img
                  src={activeProperty.photos[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-xs">
                  🏡 Photos Coming Soon
                </div>
              )}
              <span
                className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                  PROPERTY_STATUS_CONFIG[activeProperty.status].bg
                } ${PROPERTY_STATUS_CONFIG[activeProperty.status].text} ${
                  PROPERTY_STATUS_CONFIG[activeProperty.status].border
                }`}
              >
                {PROPERTY_STATUS_CONFIG[activeProperty.status].label}
              </span>
            </div>

            <div className="p-3.5 space-y-2">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                  {activeProperty.address}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {activeProperty.city}, {activeProperty.county} County, {activeProperty.zip}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-base font-black text-slate-900">
                  {activeProperty.price
                    ? `$${activeProperty.price.toLocaleString()}`
                    : 'Price to Confirm'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {activeProperty.bedrooms
                    ? `${activeProperty.bedrooms}b / ${activeProperty.bathrooms}ba`
                    : activeProperty.lotSize || 'Vacant Land'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectProperty(activeProperty)}
                  className="w-full py-1.5 bg-ehsDeepBlue hover:bg-ehsNavy text-white rounded-xl text-xs font-bold text-center transition-colors"
                >
                  Open Editor
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${activeProperty.address}, ${activeProperty.city}, FL`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors"
                >
                  Directions ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
