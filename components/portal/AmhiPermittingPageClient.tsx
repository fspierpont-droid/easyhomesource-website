'use client';

import { useRouter } from 'next/navigation';
import { AmhiPermittingHub } from '@/components/portal/AmhiPermittingHub';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';
import { canAccessAmhi } from '@/data/teamMembers';
import { useAuth } from '@/lib/auth/AuthContext';

export function AmhiPermittingPageClient() {
  const router = useRouter();
  const { user } = useAuth();
  const allowed = canAccessAmhi(user);

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
        {allowed ? (
          <AmhiPermittingHub />
        ) : (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Restricted Workspace</div>
            <h1 className="mt-2 text-2xl font-black text-[#0B1E38]">AMHI Permitting Access Required</h1>
            <p className="mt-3 text-sm text-slate-600">This permitting workspace is restricted to authorized AMHI operators.</p>
          </div>
        )}
      </main>
    </QuotePortalShell>
  );
}
