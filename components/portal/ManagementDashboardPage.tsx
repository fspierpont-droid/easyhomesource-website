'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { QuotePortalShell } from '@/components/portal/QuotePortalShell';
import { ManagementDashboardView } from '@/components/portal/ManagementDashboardView';

export function ManagementDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  useEffect(() => {
    if (!loading && user && !isManagement) {
      router.replace('/portal?view=dashboard');
    }
  }, [isManagement, loading, router, user]);

  if (loading || !user || !isManagement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
        Loading authorized dashboard...
      </div>
    );
  }

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
