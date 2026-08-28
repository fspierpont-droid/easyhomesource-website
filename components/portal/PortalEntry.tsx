'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export function PortalEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const requestedView = searchParams.get('view');
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  useEffect(() => {
    if (loading || !user || requestedView || !isManagement) return;
    router.replace('/portal/management');
  }, [isManagement, loading, requestedView, router, user]);

  if (!requestedView && isManagement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
        Opening Master Dashboard...
      </div>
    );
  }

  return <PropertyPackageManager initialNav={requestedView || 'dashboard'} />;
}
