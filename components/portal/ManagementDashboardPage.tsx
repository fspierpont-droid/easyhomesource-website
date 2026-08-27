'use client';

import { useRouter } from 'next/navigation';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';
import { ManagementDashboardView } from '@/components/portal/ManagementDashboardView';

export function ManagementDashboardPage() {
  const router = useRouter();

  return (
    <QuotePortalShell
      activeNav="management"
      onNavChange={(navId) => {
        if (navId === 'management') {
          router.push('/portal/management');
          return;
        }
        router.push(`/portal?view=${encodeURIComponent(navId)}`);
      }}
    >
      <main className="w-full p-4 sm:p-6 lg:p-8">
        <ManagementDashboardView />
      </main>
    </QuotePortalShell>
  );
}
