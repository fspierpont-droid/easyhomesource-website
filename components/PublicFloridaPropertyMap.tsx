'use client';

import React, { useState, useRef } from 'react';
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

  // Pan & Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

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
    const maxOffset = 180 * zoom;
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
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[650px] relative">
      {/* Top Header & Filter Ribbon */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">
            Interactive Florida Map
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs font-bold text-[#0B1E38]">
            Moveable &amp; Zoomable ({filteredProperties.length} Properties in Citrus, Hernando, Pasco, Sumter)
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

      {/* Main Map Workspace (Split View on Desktop: High-Contrast White Map Canvas with Right Side Inspector) */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-[#FAFCFF]">
        {/* Moveable & Zoomable White Canvas */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 relative overflow-hidden select-none transition-cursor bg-[#F4F8FC] ${
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
            {/* Clean Light Subtle Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

            {/* Stylized Clean SVG Florida Geographic Contours & Highways */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 650"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Gulf of Mexico Coastline Shading */}
              <path
                d="M 0 0 L 140 0 Q 180 260 210 650 L 0 650 Z"
                fill="#E0F2FE"
                opacity="0.85"
              />
              <path
                d="M 140 0 Q 180 260 210 650"
                stroke="#38BDF8"
                strokeWidth="2.5"
              />

              {/* County Boundaries */}
              <line x1="140" y1="210" x2="850" y2="210" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
              <line x1="180" y1="430" x2="900" y2="430" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
              <line x1="580" y1="0" x2="580" y2="650" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

              {/* US-19 Highway Corridor */}
              <path
                d="M 210 50 Q 240 280 280 600"
                stroke="#0284C7"
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />

              {/* I-75 Highway Corridor */}
              <path
                d="M 720 50 Q 660 300 630 600"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />

              {/* SR-50 East-West Corridor */}
              <path
                d="M 150 340 L 920 350"
                stroke="#64748B"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Gulf of Mexico Label */}
            <div className="absolute top-12 left-6 text-[#0369A1]/60 font-black text-xs uppercase tracking-widest pointer-events-none">
              🌊 Gulf of Mexico
            </div>

            {/* Regional County Labels in Crisp Bold High-Contrast Text */}
            <div className="absolute top-8 left-48 text-slate-700 font-extrabold text-xs uppercase tracking-wider pointer-events-none bg-white/90 px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
              Citrus County (Homosassa / Crystal River)
            </div>
            <div className="absolute top-[48%] left-32 text-slate-800 font-extrabold text-xs uppercase tracking-wider pointer-events-none bg-white/90 px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
              Hernando County (Brooksville / Spring Hill)
            </div>
            <div className="absolute bottom-8 left-48 text-slate-700 font-extrabold text-xs uppercase tracking-wider pointer-events-none bg-white/90 px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
              Pasco County (New Port Richey / Zephyrhills)
            </div>
            <div className="absolute top-[40%] right-16 text-slate-600 font-extrabold text-[11px] uppercase tracking-wider pointer-events-none bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
              Sumter County (Bushnell)
            </div>

            {/* Central Dealership Marker (Brooksville Dealership HQ) */}
            <div
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
              style={{
                left: `${projectToMap(28.5553, -82.3879).x}%`,
                top: `${projectToMap(28.5553, -82.3879).y}%`
              }}
            >
              <div className="w-6 h-6 rounded-full bg-[#0F2A47] text-white border-2 border-amber-400 flex items-center justify-center text-xs shadow-lg ring-4 ring-[#0F2A47]/10 animate-bounce">
                ⭐
              </div>
              <span className="mt-1 text-[10px] font-black text-[#0B1E38] bg-white px-2.5 py-0.5 rounded-full border border-slate-300 whitespace-nowrap shadow-md">
                EHS Dealership HQ (Brooksville)
              </span>
            </div>

            {/* Interactive Property Pins in High-Contrast White Cards */}
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
                  <div className="relative group flex flex-col items-center">
                    {/* Pin Marker */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg transition-all border-2 ${
                        isSelected
                          ? 'bg-[#0F2A47] border-white ring-4 ring-[#1E6FA8]/40 scale-125 shadow-xl'
                          : p.status === 'AVAILABLE'
                          ? 'bg-emerald-600 border-white hover:bg-emerald-700'
                          : p.status === 'COMING_SOON'
                          ? 'bg-amber-500 border-white hover:bg-amber-600'
                          : 'bg-indigo-600 border-white'
                      }`}
                    >
                      <span>{p.propertyType === 'HOME' ? '🏠' : '📍'}</span>
                    </div>

                    {/* High-Contrast White Price Badge on the Pin */}
                    <div
                      className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight border shadow-sm whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 group-hover:scale-105'
                      }`}
                    >
                      ${(p.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Map HUD Controls (Zoom In, Zoom Out, Reset, Center Brooksville) */}
          <div className="map-hud-control absolute top-4 left-4 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200 shadow-md">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              −
            </button>
            <div className="h-px bg-slate-200 my-0.5" />
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              ⟲
            </button>
            <button
              type="button"
              onClick={handleCenterBrooksville}
              title="Center Brooksville Dealership"
              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1E6FA8] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              ⭐
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-30 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-2xl border border-slate-200 text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-3">
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
              <span>Dealership</span>
            </div>
          </div>
        </div>

        {/* Right Docked Property Inspector Panel (Always clear and visible, never obstructing pins) */}
        <div
          className={`bg-white border-t md:border-t-0 md:border-l border-slate-200 transition-all duration-200 z-30 flex flex-col shrink-0 ${
            isPanelCollapsed ? 'w-full md:w-12 h-12 md:h-full' : 'w-full md:w-96 h-auto md:h-full'
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
            <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
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
