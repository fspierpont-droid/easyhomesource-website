'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthGate } from '@/components/portal/AuthGate';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import type { SeoOperationsStatus } from '@/lib/seo/seoOperations';

export function WebsiteSeoPage({ initialStatus }: { initialStatus: SeoOperationsStatus }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isManagement = user?.role === 'Admin' || user?.role === 'Manager';

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">Checking website access…</div>;
  }

  const modeLabel = initialStatus.mode === 'live'
    ? 'Live & Indexable'
    : initialStatus.mode === 'protected'
      ? 'Pre-Cutover Protected'
      : 'Indexing Warning';

  const checklist = [
    {
      label: 'Canonical production domain is easyhomesource.com',
      done: initialStatus.canonicalDomainReady,
      note: initialStatus.canonicalDomainReady ? 'Production domain is configured.' : `Current SEO identity: ${initialStatus.publicSiteUrl}`,
    },
    {
      label: 'Public indexing is enabled',
      done: initialStatus.indexingEnabled,
      note: initialStatus.indexingEnabled ? 'Search engines are allowed to index the site.' : 'Correct while the new site is still pre-cutover. Enable only during the controlled domain launch.',
    },
    {
      label: 'Google ownership verification is configured',
      done: initialStatus.googleVerificationConfigured,
      note: initialStatus.googleVerificationConfigured ? 'Verification metadata is configured.' : 'Google verification value still needs to be added during search-engine activation.',
    },
    {
      label: 'Bing ownership verification is configured',
      done: initialStatus.bingVerificationConfigured,
      note: initialStatus.bingVerificationConfigured ? 'Verification metadata is configured.' : 'Bing verification value still needs to be added during search-engine activation.',
    },
    {
      label: 'Google Search Console performance data is connected',
      done: initialStatus.searchConsolePerformanceConnected,
      note: 'Not marked complete until the portal can actually read Google performance data.',
    },
    {
      label: 'Bing Webmaster performance data is connected',
      done: initialStatus.bingPerformanceConnected,
      note: 'Not marked complete until the portal can actually read Bing performance data.',
    },
  ];

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
        <PortalSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100" aria-label="Open navigation">☰</button>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6FA8]">Growth Operations</div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1E38]">Website & SEO</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Live technical readiness. Search performance appears only after real Google/Bing connections exist.</p>
              </div>
            </div>
            <button type="button" onClick={() => router.refresh()} className="px-3.5 py-2 rounded-xl bg-[#0B1E38] text-white text-xs font-bold">Refresh</button>
          </header>

          {!isManagement ? (
            <main className="p-6 sm:p-10 max-w-2xl w-full mx-auto">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-xl font-black text-[#0B1E38]">Management Access Required</h2>
                <p className="mt-2 text-sm text-slate-600">Website and SEO operations are restricted to Managers and Admins.</p>
              </div>
            </main>
          ) : (
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
              <section className={`rounded-3xl p-6 sm:p-8 border ${initialStatus.mode === 'warning' ? 'bg-amber-50 border-amber-200' : initialStatus.mode === 'live' ? 'bg-emerald-50 border-emerald-200' : 'bg-[#0B1E38] border-[#0B1E38] text-white'}`}>
                <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${initialStatus.mode === 'protected' ? 'text-sky-300' : 'text-slate-500'}`}>Current Search Mode</div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black">{modeLabel}</h2>
                <p className={`mt-3 text-sm leading-6 max-w-3xl ${initialStatus.mode === 'protected' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {initialStatus.mode === 'protected'
                    ? 'The new EHS website is intentionally protected from indexing until the final domain cutover. The SEO foundation can be tested without competing with the current public site.'
                    : initialStatus.mode === 'live'
                      ? 'The production domain and indexing switch are aligned for public search visibility.'
                      : 'Indexing is enabled while the configured SEO identity is not the final Easy HomeSource domain. Correct this before search-engine submission.'}
                </p>
              </section>

              <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <MetricCard label="Sitemap URLs" value={initialStatus.sitemapUrls.toLocaleString()} detail={`${initialStatus.staticSitemapPages} core + ${initialStatus.activeHomePages} home pages`} />
                <MetricCard label="Active Home Pages" value={initialStatus.activeHomePages.toLocaleString()} detail="Effective public catalog" />
                <MetricCard label="Catalog Authority" value={initialStatus.catalogAuthorityOnline ? 'Online' : 'Fallback'} detail={initialStatus.catalogAuthorityOnline ? `${initialStatus.catalogOverrideCount ?? 0} saved override${initialStatus.catalogOverrideCount === 1 ? '' : 's'}` : 'Verified static catalog still serves'} />
                <MetricCard label="Indexing" value={initialStatus.indexingEnabled ? 'Enabled' : 'Protected'} detail={initialStatus.indexingEnabled ? 'Crawlers allowed' : 'Noindex pre-cutover'} />
              </section>

              <section className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Technical Foundation</div>
                  <h2 className="mt-1 text-xl font-black text-[#0B1E38]">Search-engine readiness</h2>
                  <div className="mt-5 divide-y divide-slate-100">
                    <StatusRow label="SEO identity" value={initialStatus.publicSiteUrl} status={initialStatus.canonicalDomainReady ? 'good' : 'pending'} />
                    <StatusRow label="Dynamic sitemap" value={`${initialStatus.sitemapUrls} URLs`} status="good" />
                    <StatusRow label="Product structured data" value="Home detail pages" status={initialStatus.productSchemaEnabled ? 'good' : 'pending'} />
                    <StatusRow label="Breadcrumb structured data" value="Home detail pages" status={initialStatus.breadcrumbSchemaEnabled ? 'good' : 'pending'} />
                    <StatusRow label="LocalBusiness structured data" value="Site-wide business identity" status={initialStatus.localBusinessSchemaEnabled ? 'good' : 'pending'} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={initialStatus.sitemapUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50">Open Sitemap</a>
                    <a href={initialStatus.robotsUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50">Open Robots</a>
                    <a href={initialStatus.publicSiteUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50">Open Website</a>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Search Connections</div>
                  <h2 className="mt-1 text-xl font-black text-[#0B1E38]">Google & Bing</h2>
                  <p className="mt-2 text-xs leading-5 text-slate-500">A connection is shown as complete only when the EHS portal can use the underlying data. Verification metadata alone is not treated as performance reporting.</p>
                  <div className="mt-5 divide-y divide-slate-100">
                    <StatusRow label="Google verification" value={initialStatus.googleVerificationConfigured ? 'Configured' : 'Not configured'} status={initialStatus.googleVerificationConfigured ? 'good' : 'pending'} />
                    <StatusRow label="Google Search Console data" value="Not connected yet" status="pending" />
                    <StatusRow label="Bing verification" value={initialStatus.bingVerificationConfigured ? 'Configured' : 'Not configured'} status={initialStatus.bingVerificationConfigured ? 'good' : 'pending'} />
                    <StatusRow label="Bing Webmaster data" value="Not connected yet" status="pending" />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#1E6FA8]">Controlled Launch</div>
                  <h2 className="mt-1 text-xl font-black text-[#0B1E38]">SEO activation checklist</h2>
                  <p className="mt-1 text-xs text-slate-500">These are deployment gates, not a generic SEO score.</p>
                </div>
                <div className="p-4 sm:p-5 space-y-2">
                  {checklist.map((item, index) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
                      <div className={`mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.done ? '✓' : index + 1}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-[#0B1E38]">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{item.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
                <div className="text-[10px] font-black uppercase tracking-wider text-sky-700">Catalog + SEO</div>
                <h2 className="mt-1 text-lg font-black text-[#0B1E38]">The home catalog is already part of the search architecture.</h2>
                <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-600">Approved catalog changes flow into the effective public catalog, sitemap and home detail pages. Public naming, media and URL identity remain protected from accidental pricing edits.</p>
                {user?.role === 'Admin' && <Link href="/settings/catalog" className="inline-flex mt-4 px-4 py-2 rounded-xl bg-[#0B1E38] text-white text-xs font-bold">Manage Catalog</Link>}
              </section>
            </main>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-w-0">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-xl sm:text-2xl font-black text-[#0B1E38] break-words">{value}</div>
      <div className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</div>
    </div>
  );
}

function StatusRow({ label, value, status }: { label: string; value: string; status: 'good' | 'pending' }) {
  return (
    <div className="py-3 flex items-start justify-between gap-4">
      <div className="text-xs font-bold text-slate-700">{label}</div>
      <div className="flex items-center gap-2 min-w-0 text-right">
        <span className={`w-2 h-2 rounded-full shrink-0 ${status === 'good' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        <span className="text-xs text-slate-500 break-all">{value}</span>
      </div>
    </div>
  );
}
