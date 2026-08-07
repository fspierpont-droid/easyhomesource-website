'use client';

import React, { useState, useRef } from 'react';
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);

  // Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Florida Bounding Box coordinates
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

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 3.2));
  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.35, 0.9);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCenterBrooksville = () => {
    setZoom(1.4);
    setPan({ x: 10, y: -20 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-hud-control') || (e.target as HTMLElement).closest('.property-pin')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const maxOffset = 200 * zoom;
    const newX = Math.max(-maxOffset, Math.min(maxOffset, e.clientX - dragStartRef.current.x));
    const newY = Math.max(-maxOffset, Math.min(maxOffset, e.clientY - dragStartRef.current.y));
    setPan({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.9), 3.2));
  };

  // Touch drag for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-[650px] relative">
      {/* Map Control Toolbar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            📍 Central Florida Map ({filteredProperties.length} Pins)
          </span>
          <span className="text-[11px] text-slate-400">
            Moveable &amp; Zoomable • Drag to Pan
          </span>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({properties.length})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            🟢 Available
          </button>
          <button
            onClick={() => setStatusFilter('COMING_SOON')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'COMING_SOON'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            🟡 Coming Soon
          </button>
          <button
            onClick={() => setStatusFilter('UNDER_CONTRACT')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'UNDER_CONTRACT'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            🟣 Under Contract
          </button>
        </div>
      </div>

      {/* Main Map Workspace (Split View on Desktop with Side Inspector so Map is Never Blocked) */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-slate-950">
        {/* Moveable & Zoomable Canvas */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 relative overflow-hidden select-none transition-cursor ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Zoom & Pan Transform Layer */}
          <div
            className="absolute inset-0 transition-transform duration-75 origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

            {/* Stylized SVG Florida Highway Network & Regional Boundaries */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
              viewBox="0 0 1000 650"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* US-19 Coastal Highway */}
              <path
                d="M 180 50 Q 220 280 260 600"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* I-75 Highway */}
              <path
                d="M 680 50 Q 620 300 590 600"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* SR-50 East-West Corridor */}
              <path
                d="M 100 340 L 900 350"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </svg>

            {/* Regional County Labels */}
            <div className="absolute top-8 left-10 text-slate-400/50 font-black text-xs sm:text-sm uppercase tracking-widest pointer-events-none">
              Citrus County (Homosassa / Crystal River)
            </div>
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-slate-400/50 font-black text-xs sm:text-sm uppercase tracking-widest pointer-events-none">
              Hernando County (Brooksville / Spring Hill)
            </div>
            <div className="absolute bottom-8 right-16 text-slate-400/50 font-black text-xs sm:text-sm uppercase tracking-widest pointer-events-none">
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
              <div className="w-5 h-5 rounded-full bg-ehsBlue border-2 border-white flex items-center justify-center text-[10px] shadow-xl animate-pulse">
                ⭐
              </div>
              <span className="mt-1 text-[9px] font-black text-ehsLightBlue bg-slate-900/90 px-2 py-0.5 rounded border border-ehsBlue/40 whitespace-nowrap shadow-md">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveProperty(p);
                    setIsPanelCollapsed(false);
                  }}
                  className="property-pin absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-125"
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
                        ? 'bg-white text-slate-900 border-white scale-105'
                        : 'bg-slate-900/90 text-white border-slate-700'
                    }`}
                  >
                    {p.price ? `$${Math.round(p.price / 1000)}k` : 'Lot'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map HUD Zoom & Navigation Controls */}
          <div className="map-hud-control absolute top-4 right-4 z-30 flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xs">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center transition-colors cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base flex items-center justify-center transition-colors cursor-pointer"
              title="Zoom Out"
            >
              −
            </button>
            <div className="h-px bg-slate-700 my-0.5" />
            <button
              type="button"
              onClick={handleResetView}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Florida View"
            >
              ⟲
            </button>
            <button
              type="button"
              onClick={handleCenterBrooksville}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Center Brooksville HQ"
            >
              📍
            </button>
          </div>

          {/* Move / Pan Guide Nudge */}
          <div className="absolute bottom-3 left-4 z-20 pointer-events-none bg-slate-900/80 text-slate-300 px-3 py-1 rounded-full text-[10px] font-semibold border border-slate-700/60 backdrop-blur-xs flex items-center gap-1.5">
            <span>✋ Click &amp; drag to move</span>
            <span className="text-slate-500">•</span>
            <span>🔍 Scroll to zoom ({Math.round(zoom * 100)}%)</span>
          </div>
        </div>

        {/* Smart Docked Property Inspector Panel (Does not cover the map!) */}
        {activeProperty && !isPanelCollapsed ? (
          <aside className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between p-4 sm:p-5 shadow-2xl z-30 animate-in fade-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-3.5">
              {/* Header with Close / Minimize */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ehsDeepBlue bg-ehsSoftBlue px-2 py-0.5 rounded">
                    {activeProperty.propertyType === 'HOME'
                      ? 'Finished Home'
                      : activeProperty.propertyType === 'LAND_HOME_PACKAGE'
                      ? 'Land & Home Package'
                      : 'Build-Ready Lot'}
                  </span>
                  <h4 className="font-black text-base text-slate-900 mt-1">
                    {activeProperty.address}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeProperty.city}, {activeProperty.county} County, {activeProperty.zip}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ring-1 ${
                      PROPERTY_STATUS_CONFIG[activeProperty.status].bg
                    } ${PROPERTY_STATUS_CONFIG[activeProperty.status].text} ${
                      PROPERTY_STATUS_CONFIG[activeProperty.status].border
                    }`}
                  >
                    {PROPERTY_STATUS_CONFIG[activeProperty.status].label}
                  </span>
                  <button
                    onClick={() => setIsPanelCollapsed(true)}
                    className="text-slate-400 hover:text-slate-700 p-1 font-bold text-xs"
                    title="Collapse Details Panel"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Price & Specs Box */}
              <div className="p-3 bg-ehsSoftBlue/50 border border-ehsBlue/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Turnkey Package
                  </span>
                  <span className="font-black text-lg sm:text-xl text-ehsNavy">
                    {activeProperty.price
                      ? `$${activeProperty.price.toLocaleString()}`
                      : 'Custom Package Pricing'}
                  </span>
                </div>
                <div className="text-right font-black text-xs text-slate-700">
                  {activeProperty.bedrooms
                    ? `${activeProperty.bedrooms} Bed • ${activeProperty.bathrooms} Bath`
                    : activeProperty.lotSize || 'Homesite'}
                </div>
              </div>

              {/* Verified Specs / Blueprint Badge (No generic fake house pictures) */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span>📐</span>
                  <span>{activeProperty.community || 'Central Florida Homesite'}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeProperty.notes || activeProperty.description}
                </p>
                {activeProperty.parcelNumber && (
                  <p className="text-[10px] font-mono text-slate-400 pt-1">
                    Parcel PIN: #{activeProperty.parcelNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectProperty(activeProperty)}
                className="w-full py-2.5 bg-ehsDeepBlue hover:bg-ehsNavy text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs cursor-pointer"
              >
                Open Editor
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${activeProperty.address}, ${activeProperty.city}, FL`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors"
              >
                Directions ↗
              </a>
            </div>
          </aside>
        ) : (
          /* Minimized Floating Re-Open Button */
          <button
            type="button"
            onClick={() => setIsPanelCollapsed(false)}
            className="absolute bottom-4 right-4 z-30 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-3.5 py-2 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <span>📍</span>
            <span>View {activeProperty ? activeProperty.address : 'Selected Property'}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
