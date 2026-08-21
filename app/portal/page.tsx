import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';
import { AuthGate } from '@/components/portal/AuthGate';

export const metadata: Metadata = {
  title: 'Easy HomeSource Quote Portal | Operational Hub',
  description: 'Production operational hub, quote dashboard, and single source of truth for Easy HomeSource manufactured homes, land packages, inventory, and permitting.'
};

export default function PortalPage() {
  return (
    <AuthGate>
      <div className="ehs-portal-layer-root">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Portal...</div>}>
          <PropertyPackageManager initialNav="dashboard" />
        </Suspense>

        <Link
          href="/portal/amhi"
          className="fixed right-5 bottom-5 z-[460] inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#0B1E38] px-4 py-3 text-xs font-black shadow-xl border border-amber-300 transition-all active:scale-95"
          title="Advance Mobile Home Installation permitting workspace"
        >
          <span className="text-base">📋</span>
          <span>AMHI Permitting</span>
        </Link>

        {/*
          Leaflet and the Project Board intentionally use z-index values in the
          400-450 range for map controls and the docked inspector. Full-screen
          portal modals must sit above those map-specific layers.
        */}
        <style>{`
          .ehs-portal-layer-root .fixed.inset-0.z-50.overflow-hidden {
            z-index: 1000 !important;
          }
        `}</style>
      </div>
    </AuthGate>
  );
}
