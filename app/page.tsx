import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Easy HomeSource Portal | Property Center',
  description: 'Production operational hub, quote portal, and single source of truth for Easy HomeSource manufactured homes, land packages, and inventory.'
};

export default function HomePage() {
  return <PropertyPackageManager initialNav="property-packages" />;
}
