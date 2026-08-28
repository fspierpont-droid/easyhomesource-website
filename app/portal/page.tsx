import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PortalLanding } from '@/components/portal/PortalLanding';
import { AuthGate } from '@/components/portal/AuthGate';

export const metadata: Metadata = {
  title: 'Easy HomeSource Portal | Operational Hub',
  description: 'Production operational hub and single source of truth for Easy HomeSource sales, quotes, manufactured homes, land packages, inventory, projects, and permitting.'
};

export default function PortalPage() {
  return (
    <AuthGate>
      <div className="ehs-portal-layer-root">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Portal...</div>}>
          <PortalLanding />
        </Suspense>

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
