'use client';

import { useRouter } from 'next/navigation';
import { AmhiPermittingHub } from '@/components/portal/AmhiPermittingHub';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';

export function AmhiPermittingPageClient() {
  const router = useRouter();

  return (
    <QuotePortalShell
      activeNav="amhi"
      onNavChange={(navId) => {
        if (navId === 'management') {
          router.push('/portal/management');
          return;
        }
        if (navId === 'amhi') {
          router.push('/portal/amhi');
          return;
        }
        router.push(`/portal?view=${encodeURIComponent(navId)}`);
      }}
    >
      <main className="w-full p-4 sm:p-6 lg:p-8">
        <AmhiPermittingHub />
      </main>
    </QuotePortalShell>
  );
}
