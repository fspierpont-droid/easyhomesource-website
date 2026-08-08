import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Property Packages | Easy HomeSource Portal',
  description: 'Operations single source of truth for Central Florida land and manufactured home packages.'
};

export default function PropertyPackagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Operations...</div>}>
      <PropertyPackageManager initialNav="property-packages" />
    </Suspense>
  );
}
