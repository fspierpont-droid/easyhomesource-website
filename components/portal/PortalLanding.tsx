'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';
import { useAuth } from '@/lib/auth/AuthContext';

export function PortalLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const hasExplicitView = searchParams.has('view');
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';
  const shouldRedirectToManagement = !loading && !!user && isManagement && !hasExplicitView;

  useEffect(() => {
    if (shouldRedirectToManagement) {
      router.replace('/portal/management');
    }
  }, [router, shouldRedirectToManagement]);

  if (loading || shouldRedirectToManagement) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Portal...</div>;
  }

  return <PropertyPackageManager initialNav="dashboard" />;
}
