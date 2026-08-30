'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export function PortalAuthBoundary({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;
    const query = searchParams.toString();
    const returnTo = `${pathname}${query ? `?${query}` : ''}`;
    router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
  }, [loading, pathname, router, searchParams, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 text-center text-xs font-bold text-slate-400">
        {loading ? 'Checking dealership authentication…' : 'Your session has expired. Returning to sign in…'}
      </div>
    );
  }

  return <>{children}</>;
}
