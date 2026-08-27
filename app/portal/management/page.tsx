import type { Metadata } from 'next';
import { AuthGate } from '@/components/portal/AuthGate';
import { ManagementDashboardPage } from '@/components/portal/ManagementDashboardPage';

export const metadata: Metadata = {
  title: 'Management Command Center | Easy HomeSource',
  description: 'Management-only visual command center for Easy HomeSource sales, projects, inventory, property packages and permitting.',
};

export default function ManagementPage() {
  return (
    <AuthGate>
      <ManagementDashboardPage />
    </AuthGate>
  );
}
