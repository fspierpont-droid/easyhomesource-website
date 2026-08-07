import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Easy HomeSource Portal | Property Center',
  description: 'Production operational hub and single source of truth for Easy HomeSource manufactured homes, lots, packages, and inventory.'
};

export default function PortalPage() {
  return (
    <QuotePortalShell activeNav="property-packages">
      <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Loading Quote Portal...</div>}>
        <PropertyPackageManager />
      </Suspense>
    </QuotePortalShell>
  );
}
