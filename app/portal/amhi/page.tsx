import type { Metadata } from 'next';
import { AuthGate } from '@/components/portal/AuthGate';
import { AmhiPermittingPageClient } from '@/components/portal/AmhiPermittingPageClient';

export const metadata: Metadata = {
  title: 'AMHI Permitting Hub | Easy HomeSource',
  description: 'Advance Mobile Home Installation permitting, county portals, inspections and permit documents.',
};

export default function AmhiPermittingPage() {
  return (
    <AuthGate>
      <AmhiPermittingPageClient />
    </AuthGate>
  );
}
