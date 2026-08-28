'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';
import { useAuth } from '@/lib/auth/AuthContext';

export function PortalLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const requestedView = searchParams.get('view');
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  useEffect(() => {
    if (!loading && user && isManagement && !requestedView) {
      router.replace('/portal/management');
    }
  }, [isManagement, loading, requestedView, router, user]);

  if (loading || (user && isManagement && !requestedView)) {
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400">
        Loading Easy HomeSource dashboard...
      </div>
    );
  }

  return <PropertyPackageManager initialNav={requestedView || 'dashboard'} />;
}
