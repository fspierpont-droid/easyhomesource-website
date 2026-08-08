import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';
import { AuthGate } from '@/components/portal/AuthGate';

export const metadata: Metadata = {
  title: 'Easy HomeSource Quote Portal | Operational Hub',
  description: 'Production operational hub, quote dashboard, and single source of truth for Easy HomeSource manufactured homes, land packages, and inventory.'
};

export default function PortalPage() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Portal...</div>}>
        <PropertyPackageManager initialNav="dashboard" />
      </Suspense>
    </AuthGate>
  );
}
