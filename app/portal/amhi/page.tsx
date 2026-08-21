import Link from 'next/link';
import type { Metadata } from 'next';
import { AuthGate } from '@/components/portal/AuthGate';
import { AmhiPermittingHub } from '@/components/portal/AmhiPermittingHub';

export const metadata: Metadata = {
  title: 'AMHI Permitting Hub | Easy HomeSource',
  description: 'Advance Mobile Home Installation permitting, county portals, inspections and permit documents.',
};

export default function AmhiPermittingPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/portal" className="text-xs font-black text-[#0B1E38]">← Back to EHS Portal</Link>
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6FA8]">AMHI Operations</div>
        </div>
        <AmhiPermittingHub />
      </div>
    </AuthGate>
  );
}
