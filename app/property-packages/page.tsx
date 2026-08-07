import type { Metadata } from 'next';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Property Package Manager | Easy HomeSource Quote Portal',
  description: 'Maintain land, completed homes, in-progress properties, pricing, and sales details from the authenticated quote portal.'
};

export default function PropertyPackagesPage() {
  return (
    <QuotePortalShell activeNav="property-packages">
      <PropertyPackageManager />
    </QuotePortalShell>
  );
}
