const DEFAULT_PRECUTOVER_SITE_URL = 'https://easyhomesource-website.vercel.app';

function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return DEFAULT_PRECUTOVER_SITE_URL;
  return trimmed.replace(/\/+$/, '');
}

export const publicSiteUrl = normalizeSiteUrl(process.env.EHS_PUBLIC_SITE_URL);

export const isPublicSiteIndexable =
  process.env.EHS_SITE_INDEXABLE?.trim().toLowerCase() === 'true';

export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const bingSiteVerification =
  process.env.BING_SITE_VERIFICATION?.trim() || undefined;
