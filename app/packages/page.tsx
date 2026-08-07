import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Property Packages | Easy HomeSource Portal',
  description: 'Maintain land, completed homes, in-progress properties, pricing, and sales details from the authenticated quote portal.'
};

export default function PackagesPage() {
  return <PropertyPackageManager initialNav="property-packages" />;
}
