'use client';

import React, { useState } from 'react';
import { PublicFloridaPropertyMap } from '@/components/PublicFloridaPropertyMap';
import { LandHomePackagesBrowser } from '@/components/LandHomePackagesBrowser';
import { LeadForm } from '@/components/LeadForm';
import { INITIAL_PROPERTIES } from '@/lib/db/propertyStore';

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'packages'>('map');
  const publicProperties = INITIAL_PROPERTIES.filter((p) => p.publicVisible);

  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Hero Section */}
        <section className="rounded-2xl bg-ehsSoftBlue p-5 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">
                Turnkey Package Solutions
              </p>
              <h1 className="mt-1.5 text-2xl sm:text-4xl font-black text-ehsBlack">
                Land &amp; Home Packages in Central Florida
              </h1>
              <p className="mt-2.5 max-w-4xl text-sm sm:text-base leading-relaxed text-ehsBlack/75">
                Bring the property, manufactured home, delivery, site prep, permitting, and utilities together into one stress-free turnkey package. Compare available homesites and move-in ready properties across Hernando, Citrus, and Pasco counties.
              </p>
            </div>

            {/* View Switcher Toggle (Map is now default!) */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-borderGray shadow-2xs shrink-0 self-start md:self-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-ehsDeepBlue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🗺️ Interactive Map
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('packages')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-ehsDeepBlue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Package Deals Grid
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-xs sm:text-sm font-bold text-ehsBlack sm:grid-cols-3">
            <div className="rounded-xl bg-white p-3.5 shadow-2xs">
              🏡 Move-in Ready Homes &amp; Packages
            </div>
            <div className="rounded-xl bg-white p-3.5 shadow-2xs">
              🚜 Land Prep, Well &amp; Septic Support
            </div>
            <div className="rounded-xl bg-white p-3.5 shadow-2xs">
              💳 Combined Land-Home Financing
            </div>
          </div>
        </section>

        {/* View 1: Moveable & Zoomable Interactive Map (Default View) */}
        {activeTab === 'map' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <PublicFloridaPropertyMap properties={publicProperties} />
          </div>
        )}

        {/* View 2: Package Deals Browser */}
        {activeTab === 'packages' && (
          <div className="animate-in fade-in duration-200">
            <LandHomePackagesBrowser initialProperties={publicProperties} />
          </div>
        )}

        {/* How Turnkey Packages Work */}
        <section className="rounded-2xl border border-borderGray bg-white p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-ehsBlue">
              Simple Turnkey Process
            </p>
            <h2 className="mt-1 text-2xl font-black text-ehsBlack">
              How our Florida Land &amp; Home Packages work
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-ehsSoftBlue/50 border border-ehsBlue/10 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-extrabold text-sm text-ehsNavy">Select Your Homesite</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose from our available properties or let us evaluate your privately owned land for zoning and access.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ehsSoftBlue/50 border border-ehsBlue/10 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-extrabold text-sm text-ehsNavy">Choose Your Home</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Match your property with models starting from $39,888 up to luxury 4 &amp; 5-bedroom double wides.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ehsSoftBlue/50 border border-ehsBlue/10 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-sm text-ehsNavy">Turnkey Setup &amp; Utilities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We handle freight, tie-downs, well &amp; septic hookups, A/C installation, and Hernando/Citrus county permits.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ehsSoftBlue/50 border border-ehsBlue/10 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="font-extrabold text-sm text-ehsNavy">Single Monthly Payment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Roll the land, home, delivery, and site work into one mortgage loan (FHA, VA, USDA, or Conventional).
              </p>
            </div>
          </div>
        </section>

        {/* Lead Quote Form */}
        <div className="mt-8">
          <LeadForm cta="Request Package Pricing" />
        </div>
      </div>
    </main>
  );
}
