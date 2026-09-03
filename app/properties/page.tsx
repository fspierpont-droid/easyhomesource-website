'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PublicFloridaPropertyMap } from '@/components/PublicFloridaPropertyMap';
import { LandHomePackagesBrowser } from '@/components/LandHomePackagesBrowser';
import { LeadForm } from '@/components/LeadForm';
import type { Property } from '@/types/property';

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<'map' | 'packages'>('map');
  const [publicProperties, setPublicProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/portal/properties/public', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success || !Array.isArray(payload?.properties)) {
        throw new Error(payload?.error || 'Property inventory is temporarily unavailable.');
      }
      setPublicProperties(payload.properties);
    } catch (error) {
      setPublicProperties([]);
      setLoadError(error instanceof Error ? error.message : 'Property inventory is temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  return (
    <main className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
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
                Bring the property, manufactured home, delivery, site prep, permitting, and utilities together into one stress-free turnkey package. Explore verified available and coming-soon EHS homesites on the live map.
              </p>
            </div>

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

          {!isLoading && !loadError && (
            <div className="mt-4 text-xs font-bold text-ehsNavy/70">
              {publicProperties.length} verified EHS land/home opportunities currently published
            </div>
          )}
        </section>

        {isLoading ? (
          <section className="rounded-2xl border border-borderGray bg-white p-10 text-center text-sm font-semibold text-slate-500">
            Loading live EHS property inventory…
          </section>
        ) : loadError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <h2 className="text-base font-black text-rose-800">Property inventory temporarily unavailable</h2>
            <p className="mt-2 text-sm text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProperties()}
              className="mt-4 rounded-xl bg-ehsDeepBlue px-4 py-2 text-xs font-black text-white"
            >
              Retry live inventory
            </button>
          </section>
        ) : activeTab === 'map' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <PublicFloridaPropertyMap properties={publicProperties} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <LandHomePackagesBrowser initialProperties={publicProperties} />
          </div>
        )}

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
                Match the homesite with the manufactured-home model that best fits the property, household and budget.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ehsSoftBlue/50 border border-ehsBlue/10 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-sm text-ehsNavy">Turnkey Setup &amp; Utilities</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                EHS coordinates the home, delivery, site work and permitting scope while third-party and jurisdictional costs are verified before final pricing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-ehsSoftBlue/50 border border-ehsBlue/10 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-ehsDeepBlue text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="font-extrabold text-sm text-ehsNavy">Build the Financing Plan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore financing paths for the home and land package based on lender eligibility, property details and verified project costs.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <LeadForm cta="Request Package Pricing" />
        </div>
      </div>
    </main>
  );
}
