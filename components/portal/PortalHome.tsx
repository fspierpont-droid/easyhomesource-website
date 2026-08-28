'use client';

import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ManagementDashboardPage } from '@/components/portal/ManagementDashboardPage';
import { PropertyPackageManager } from '@/components/portal/PropertyPackageManager';

export function PortalHome() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const requestedView = searchParams.get('view');
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
        Loading Easy HomeSource Portal...
      </div>
    );
  }

  // Bare /portal is the management command center for authorized leadership.
  // Explicit ?view= deep links always win so bookmarks and portal navigation remain stable.
  if (user && isManagement && !requestedView) {
    return <ManagementDashboardPage />;
  }

  return <PropertyPackageManager initialNav={requestedView || 'dashboard'} />;
}
