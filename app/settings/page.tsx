import { Suspense } from 'react';
import { AdminSettingsPage } from '@/components/portal/AdminSettingsPage';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Loading settings…</div>}>
      <AdminSettingsPage />
    </Suspense>
  );
}
