'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/types/property';

interface LandHomePackagesBrowserProps {
  initialProperties: Property[];
}

type FilterCategory = 'ALL' | 'HOMES' | 'PACKAGES' | 'LOTS' | 'COMING_SOON';

export function LandHomePackagesBrowser({ initialProperties }: LandHomePackagesBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [selectedCounty, setSelectedCounty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDeals = useMemo(() => {
    let list = [...initialProperties];

    // Category filter
    if (activeCategory === 'HOMES') {
      list = list.filter((p) => p.propertyType === 'HOME');
    } else if (activeCategory === 'PACKAGES') {
      list = list.filter((p) => p.propertyType === 'LAND_HOME_PACKAGE');
    } else if (activeCategory === 'LOTS') {
      list = list.filter((p) => p.propertyType === 'LAND');
    } else if (activeCategory === 'COMING_SOON') {
      list = list.filter((p) => p.status === 'COMING_SOON' || p.propertyType === 'SPEC_HOME');
    }

    // County filter
    if (selectedCounty !== 'ALL') {
      list = list.filter((p) => (p.county || '').toLowerCase() === selectedCounty.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) =>
        [p.address, p.city, p.county, p.community, p.notes, p.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [initialProperties, activeCategory, selectedCounty, searchQuery]);

  const formatPrice = (price?: number | null) => {
    if (!price || price <= 0) return 'Custom Package Pricing';
    return `Starting at $${price.toLocaleString()}`;
  };

  const getPackageTypeLabel = (p: Property) => {
    if (p.propertyType === 'HOME') return 'Move-In Ready Home';
    if (p.propertyType === 'LAND_HOME_PACKAGE') return 'Land & Home Package';
    if (p.propertyType === 'SPEC_HOME') return 'Spec Home in Progress';
    if (p.lotSize && p.lotSize.includes('lots')) return 'Multi-Site Development Parcel';
    return 'Build-Ready Lot Package';
  };

  return (
    <section className="mt-8 space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-borderGray bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">
              Current Opportunities
            </p>
            <h2 className="mt-0.5 text-xl font-black text-ehsBlack">
              Filter Land & Home Package Deals
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-medium text-ehsBlack/65">
              Explore available completed homes, build-ready lots, and multi-site land opportunities across Central Florida.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, city, or community..."
              className="w-full rounded-xl border border-borderGray bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-ehsBlack outline-none focus:border-ehsBlue focus:ring-2 focus:ring-ehsLightBlue/50"
            />
          </div>
        </div>

        {/* Category Tabs & County Filter Pills */}
        <div className="mt-4 pt-4 border-t border-borderGray/60 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeCategory === 'ALL'
                  ? 'bg-ehsBlue text-white'
                  : 'bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/60'
              }`}
            >
              All Package Deals ({initialProperties.length})
            </button>
            <button
              onClick={() => setActiveCategory('HOMES')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeCategory === 'HOMES'
                  ? 'bg-ehsBlue text-white'
                  : 'bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/60'
              }`}
            >
              Move-In Ready Homes
            </button>
            <button
              onClick={() => setActiveCategory('PACKAGES')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeCategory === 'PACKAGES'
                  ? 'bg-ehsBlue text-white'
                  : 'bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/60'
              }`}
            >
              Land & Home Packages
            </button>
            <button
              onClick={() => setActiveCategory('LOTS')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeCategory === 'LOTS'
                  ? 'bg-ehsBlue text-white'
                  : 'bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/60'
              }`}
            >
              Build-Ready Lots
            </button>
            <button
              onClick={() => setActiveCategory('COMING_SOON')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                activeCategory === 'COMING_SOON'
                  ? 'bg-ehsBlue text-white'
                  : 'bg-ehsSoftBlue text-ehsBlack hover:bg-ehsLightBlue/60'
              }`}
            >
              Coming Soon
            </button>
          </div>

          {/* County Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500">County:</span>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="rounded-lg border border-borderGray bg-white px-2.5 py-1 text-xs font-bold text-ehsNavy outline-none focus:border-ehsBlue"
            >
              <option value="ALL">All Counties</option>
              <option value="Hernando">Hernando County</option>
              <option value="Citrus">Citrus County</option>
              <option value="Pasco">Pasco County</option>
            </select>
          </div>
        </div>

        {/* Counter */}
        <div className="mt-3 text-[11px] font-bold text-slate-400">
          Showing <span className="text-ehsBlue font-black">{filteredDeals.length}</span> active package deals
        </div>
      </div>

      {/* Package Deals Grid (Compact 3-4 column responsive cards) */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {filteredDeals.map((deal) => {
            const statusCfg =
              PROPERTY_STATUS_CONFIG[deal.status] || PROPERTY_STATUS_CONFIG.STATUS_TO_CONFIRM;
            const quoteHref = `/get-quote?property=${encodeURIComponent(deal.id)}&source=land-home-packages`;

            return (
              <article
                key={deal.id}
                className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ehsBlue/10 bg-white shadow-sm shadow-ehsNavy/5 transition duration-200 hover:-translate-y-0.5 hover:border-ehsBlue/30 hover:shadow-md"
              >
                <div>
                  {/* Photo / Visual Container */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-ehsSoftBlue">
                    {deal.photos && deal.photos[0] ? (
                      <img
                        src={deal.photos[0]}
                        alt={deal.address}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-ehsSoftBlue via-white to-ehsLightBlue/30 p-4 text-center">
                        <div>
                          <span className="text-2xl mb-1 block">
                            {deal.propertyType === 'LAND' ? '🌲' : '🏡'}
                          </span>
                          <p className="text-[10px] font-black uppercase tracking-wider text-ehsBlue">
                            Easy HomeSource
                          </p>
                          <p className="text-xs font-black text-ehsBlack">Package Opportunity</p>
                        </div>
                      </div>
                    )}
                    <span className="absolute right-3 top-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-black ring-1 shadow-sm ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-3 p-4 sm:p-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ehsDeepBlue bg-ehsSoftBlue px-2 py-0.5 rounded">
                        {getPackageTypeLabel(deal)}
                      </span>
                      <h3 className="mt-1.5 text-base sm:text-lg font-black leading-snug text-ehsNavy">
                        {deal.address}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {deal.city}, {deal.county} County, {deal.zip}
                      </p>
                    </div>

                    {/* Pricing Box */}
                    <div className="rounded-xl bg-gradient-to-br from-ehsSoftBlue to-white p-3 ring-1 ring-ehsBlue/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ehsNavy/60">
                        Package Price
                      </p>
                      <p className="mt-0.5 text-lg sm:text-xl font-black text-ehsNavy">
                        {formatPrice(deal.price)}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-ehsNavy/55">
                        {deal.propertyType === 'HOME'
                          ? 'Move-in ready turnkey price'
                          : 'Includes lot + turnkey setup guidance'}
                      </p>
                    </div>

                    {/* Specs / Inclusions */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="rounded-lg border border-ehsBlue/10 bg-white p-2 text-center">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">
                          Size / Plan
                        </span>
                        <span className="font-black text-slate-800 text-xs truncate block">
                          {deal.bedrooms
                            ? `${deal.bedrooms} Bed • ${deal.bathrooms} Bath`
                            : deal.lotSize || 'Custom Lot'}
                        </span>
                      </div>
                      <div className="rounded-lg border border-ehsBlue/10 bg-white p-2 text-center">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">
                          Community
                        </span>
                        <span className="font-black text-slate-800 text-xs truncate block">
                          {deal.community || 'Private Acreage'}
                        </span>
                      </div>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {deal.notes || deal.description}
                    </p>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <Link
                    href={quoteHref}
                    className="inline-flex w-full justify-center rounded-xl bg-ehsBlue hover:bg-ehsDeepBlue px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors text-center"
                  >
                    Request Package Details →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-borderGray bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-ehsBlack">No package deals match this filter.</h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Contact Easy HomeSource to discuss customized land-and-home combinations.
          </p>
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setSelectedCounty('ALL');
              setSearchQuery('');
            }}
            className="mt-4 rounded-full bg-ehsBlue px-5 py-2.5 text-xs font-black text-white hover:bg-ehsDeepBlue transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
