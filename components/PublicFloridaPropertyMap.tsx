'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/types/property';

interface PublicFloridaPropertyMapProps {
  properties: Property[];
}

export function PublicFloridaPropertyMap({ properties }: PublicFloridaPropertyMapProps) {
  const [activeProperty, setActiveProperty] = useState<Property | null>(
    properties[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Florida Bounding Box for Hernando/Citrus/Pasco coordinate projection
  const MIN_LAT = 28.1;
  const MAX_LAT = 28.95;
  const MIN_LNG = -82.85;
  const MAX_LNG = -82.05;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    const y = 100 - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  const filteredProperties = properties.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="bg-white border border-borderGray rounded-3xl shadow-sm overflow-hidden flex flex-col h-[620px] relative">
      {/* Map Header Toolbar */}
      <div className="p-4 border-b border-borderGray bg-ehsSoftBlue/40 flex flex-wrap items-center justify-between gap-3 z-10">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
            Interactive Florida Map
          </span>
          <h3 className="font-extrabold text-sm sm:text-base text-ehsNavy">
            Explore Available Homesites &amp; Packages ({filteredProperties.length} Locations)
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-ehsDeepBlue text-white border-ehsDeepBlue'
                : 'bg-white text-slate-700 border-borderGray hover:bg-slate-50'
            }`}
          >
            All Locations
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            🟢 Available Now
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('COMING_SOON')}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === 'COMING_SOON'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            🟡 Coming Soon
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden select-none">
        {/* Subtle Map Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-45" />

        {/* Regional Water & County Landmarks */}
        <div className="absolute top-6 left-8 text-slate-400/50 font-black text-xs sm:text-sm uppercase tracking-widest pointer-events-none">
          Citrus County (Homosassa / Crystal River)
        </div>
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 text-slate-400/50 font-black text-xs sm:text-sm uppercase tracking-widest pointer-events-none">
          Hernando County (Brooksville / Spring Hill)
        </div>
        <div className="absolute bottom-6 right-8 text-slate-400/50 font-black text-xs sm:text-sm uppercase tracking-widest pointer-events-none">
          Pasco County (New Port Richey / Zephyrhills)
        </div>

        {/* Central Dealership Marker */}
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
            Easy HomeSource HQ (9011 McIntyre Rd)
          </span>
        </div>

        {/* Interactive Property Pins */}
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

              {/* Pin Price Tag */}
              <div
                className={`mt-1 -translate-x-1/4 px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight whitespace-nowrap shadow-md border ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white'
                    : 'bg-slate-900/90 text-white border-slate-700'
                }`}
              >
                {p.price ? `$${Math.round(p.price / 1000)}k` : 'Lot'}
              </div>
            </div>
          );
        })}

        {/* Floating Property Card on Map */}
        {activeProperty && (
          <div className="absolute bottom-4 left-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-borderGray overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ehsDeepBlue bg-ehsSoftBlue px-2 py-0.5 rounded">
                    {activeProperty.propertyType === 'HOME'
                      ? 'Finished Home'
                      : activeProperty.propertyType === 'LAND_HOME_PACKAGE'
                      ? 'Land & Home Package'
                      : 'Build-Ready Lot'}
                  </span>
                  <h4 className="font-extrabold text-sm text-ehsNavy mt-1">
                    {activeProperty.address}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeProperty.city}, {activeProperty.county} County, {activeProperty.zip}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${
                    PROPERTY_STATUS_CONFIG[activeProperty.status].bg
                  } ${PROPERTY_STATUS_CONFIG[activeProperty.status].text} ${
                    PROPERTY_STATUS_CONFIG[activeProperty.status].border
                  }`}
                >
                  {PROPERTY_STATUS_CONFIG[activeProperty.status].label}
                </span>
              </div>

              <div className="p-2.5 bg-ehsSoftBlue/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Starting Package
                  </span>
                  <span className="font-black text-base text-ehsNavy">
                    {activeProperty.price
                      ? `Starting at $${activeProperty.price.toLocaleString()}`
                      : 'Custom Package Pricing'}
                  </span>
                </div>
                <div className="text-right font-bold text-slate-600">
                  {activeProperty.bedrooms
                    ? `${activeProperty.bedrooms}b / ${activeProperty.bathrooms}ba`
                    : activeProperty.lotSize || 'Homesite'}
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {activeProperty.notes || activeProperty.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={`/get-quote?property=${encodeURIComponent(activeProperty.id)}&source=map`}
                  className="w-full py-2 bg-ehsBlue hover:bg-ehsDeepBlue text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs"
                >
                  Request Quote
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${activeProperty.address}, ${activeProperty.city}, FL`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 border border-borderGray hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors"
                >
                  Get Directions ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
