import type { Metadata } from 'next';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export const metadata: Metadata = {
  title: 'Easy HomeSource Quote Portal | Operational Hub',
  description: 'Production operational hub, quote dashboard, and single source of truth for Easy HomeSource manufactured homes, land packages, and inventory.'
};

export default function HomePage() {
  return <PropertyPackageManager initialNav="dashboard" />;
}
