import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Easy HomeSource Portal | Property Center',
  description: 'Production operational hub and single source of truth for Easy HomeSource manufactured homes, lots, packages, and inventory.'
};

export default function PortalPage() {
  return <PropertyPackageManager initialNav="property-packages" />;
}
