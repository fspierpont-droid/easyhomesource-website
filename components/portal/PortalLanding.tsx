'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export function PortalLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const requestedView = searchParams.get('view');
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';
  const shouldOpenMasterDashboard = !requestedView && isManagement;

  useEffect(() => {
    if (!loading && user && shouldOpenMasterDashboard) {
      router.replace('/portal/management');
    }
  }, [loading, router, shouldOpenMasterDashboard, user]);

  if (!loading && user && shouldOpenMasterDashboard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
        Opening Master Dashboard...
      </div>
    );
  }

  return <PropertyPackageManager initialNav={requestedView || 'dashboard'} />;
}
