import type { Metadata } from 'next';
import { WebsiteSeoPage } from '@/components/portal/WebsiteSeoPage';
import { getSeoOperationsStatus } from '@/lib/seo/seoOperations';

export const metadata: Metadata = {
  title: 'Website & SEO | EHS Portal',
  description: 'Easy HomeSource website and search-engine operations dashboard.',
};

export const dynamic = 'force-dynamic';

export default async function WebsiteSeoRoute() {
  const status = await getSeoOperationsStatus();
  return <WebsiteSeoPage initialStatus={status} />;
}
