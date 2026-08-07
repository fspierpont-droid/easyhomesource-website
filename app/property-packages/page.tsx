import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Property Package Manager | Easy HomeSource Quote Portal',
  description: 'Maintain land, completed homes, in-progress properties, pricing, and sales details from the authenticated quote portal.'
};

export default function PropertyPackagesPage() {
  return <PropertyPackageManager initialNav="property-packages" />;
}
