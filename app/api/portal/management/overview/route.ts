import { NextResponse } from 'next/server';
import { requirePortalAccess } from '@/lib/auth/portalSession';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendQuote } from '@/lib/quotes/permanentQuote';
import { fromBackendProperty } from '@/lib/properties/permanentProperty';
import {
  PROJECT_PIPELINE_ID,
  READY_FOR_QUOTE_FIELD_ID,
  searchOpportunities,
} from '@/lib/ghl/client';
import type { SavedQuote } from '@/data/quotesStore';
import type {
  DashboardAlert,
  DashboardRepPerformance,
  DashboardStageValue,
  DashboardTrendPoint,
  ManagementOverview,
} from '@/types/management';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PROJECT_STAGES: Record<string, { key: string; label: string; progressPct: number }> = {
  '472ee180-a203-4c58-80fd-5a4c0e9db793': { key: 'PERMITTING', label: 'Permitting', progressPct: 20 },
  '04066448-fc52-4179-8461-a8a29119912a': { key: 'SITE_PREP', label: 'Site Prep', progressPct: 40 },
  'cf7f467f-dd5f-4d65-afea-bd32491d00e2': { key: 'TRANSPORT_SET', label: 'Installation', progressPct: 65 },
  '4b7b4df4-5026-44e0-890a-1b475f21093b': { key: 'FINAL_INSPECTION', label: 'Inspections', progressPct: 85 },
  '6b4b1901-fb78-48aa-a7ea-517bd7b87c81': { key: 'COMPLETED', label: 'CO / Handover', progressPct: 100 },
  'ebed22f5-8c69-4835-bb5e-e528ec2a4618': { key: 'COMPLETED', label: 'Warranty', progressPct: 100 },
  '3a7764dc-8da5-4f72-bad3-f082ead62bb8': { key: 'COMPLETED', label: 'Warranty Expired', progressPct: 100 },
};

const QUOTE_STAGE_ORDER: Array<{ key: SavedQuote['status']; label: string }> = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SENT_TO_BUYER', label: 'Sent' },
  { key: 'LENDER_REVIEW', label: 'Lender Review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'IN_CONTRACT', label: 'In Contract' },
];

const ACTIVE_QUOTE_STATUSES = new Set<SavedQuote['status']>([
  'DRAFT',
  'SENT_TO_BUYER',
  'LENDER_REVIEW',
  'APPROVED',
]);

function numeric(value: unknown) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

function timestamp(value: unknown) {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function daysSince(value: unknown, now = Date.now()) {
  const parsed = timestamp(value);
  if (parsed === null) return null;
  return Math.max(0, Math.floor((now - parsed) / 86_400_000));
}

function customFields(opportunity: any) {
  return Array.isArray(opportunity?.customFields) ? opportunity.customFields : [];
}

function isReadyOpportunity(opportunity: any) {
  const field = customFields(opportunity).find((item: any) => item?.id === READY_FOR_QUOTE_FIELD_ID);
  const checked = field?.fieldValueBoolean === true
    || field?.field_value === true
    || field?.fieldValueString === 'true'
    || (Array.isArray(field?.fieldValueArray) && field.fieldValueArray.length > 0);
  const tags = (opportunity?.contact?.tags || []).map((tag: unknown) => String(tag).toLowerCase());
  return checked || ['quote_ready', 'send_to_quote_system', 'ready_to_quote'].some((tag) => tags.includes(tag));
}

async function permanentArray(request: Request, path: string) {
  const response = await permanentApiRequest(request, path);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(`Permanent API unavailable for ${path}`);
  }
  return payload;
}

function stageCounts(values: string[], preferredOrder: string[] = []): DashboardStageValue[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = value || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const ordered = [
    ...preferredOrder.filter((value) => counts.has(value)),
    ...Array.from(counts.keys()).filter((value) => !preferredOrder.includes(value)).sort(),
  ];
  return ordered.map((key) => ({ key, label: key, count: counts.get(key) || 0 }));
}

function quoteTrend(quotes: SavedQuote[], now = new Date()): DashboardTrendPoint[] {
  const buckets: DashboardTrendPoint[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    buckets.push({
      key,
      label: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      count: 0,
      value: 0,
    });
  }
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const quote of quotes) {
    const raw = quote.createdAt || quote.quoteDate || quote.updatedAt;
    const parsed = timestamp(raw);
    if (parsed === null) continue;
    const date = new Date(parsed);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.count += 1;
    bucket.value += numeric(quote.totalTurnkeyPrice || quote.estimatedTotal);
  }
  return buckets;
}

function repPerformance(quotes: SavedQuote[]): DashboardRepPerformance[] {
  const reps = new Map<string, DashboardRepPerformance>();
  for (const quote of quotes) {
    const name = String(quote.salesperson || 'Unassigned').trim() || 'Unassigned';
    const current = reps.get(name) || {
      name,
      quoteCount: 0,
      quoteValue: 0,
      contractCount: 0,
      contractValue: 0,
    };
    const value = numeric(quote.totalTurnkeyPrice || quote.estimatedTotal);
    current.quoteCount += 1;
    current.quoteValue += value;
    if (quote.status === 'IN_CONTRACT') {
      current.contractCount += 1;
      current.contractValue += value;
    }
    reps.set(name, current);
  }
  return Array.from(reps.values())
    .sort((left, right) => right.contractValue - left.contractValue || right.quoteValue - left.quoteValue)
    .slice(0, 8);
}

export async function GET(request: Request) {
  const access = await requirePortalAccess(request);
  if (access.response) return access.response;
  if (!access.user || !['Admin', 'Manager'].includes(access.user.role)) {
    return NextResponse.json({ success: false, error: 'Management access required.' }, { status: 403 });
  }

  const [quotesResult, inventoryResult, propertiesResult, permittingResult, ghlResult] = await Promise.allSettled([
    permanentArray(request, '/api/quotes'),
    permanentArray(request, '/api/home-inventory?include_archived=false'),
    permanentArray(request, '/api/properties'),
    permanentArray(request, '/api/permitting/jobs'),
    searchOpportunities(),
  ]);

  const sources: ManagementOverview['sources'] = {
    quotes: quotesResult.status === 'fulfilled' ? 'ok' : 'error',
    inventory: inventoryResult.status === 'fulfilled' ? 'ok' : 'error',
    properties: propertiesResult.status === 'fulfilled' ? 'ok' : 'error',
    permitting: permittingResult.status === 'fulfilled' ? 'ok' : 'error',
    ghlReady: ghlResult.status === 'fulfilled' ? 'ok' : 'error',
    ghlProjects: ghlResult.status === 'fulfilled' ? 'ok' : 'error',
  };

  const quotes = quotesResult.status === 'fulfilled'
    ? quotesResult.value.map(fromBackendQuote).filter((quote) => !quote.legacyReadOnly)
    : [];
  const activeQuotes = quotes.filter((quote) => ACTIVE_QUOTE_STATUSES.has(quote.status));
  const contractQuotes = quotes.filter((quote) => quote.status === 'IN_CONTRACT');
  const marginHealthQuotes = quotes.filter((quote) => typeof quote.financialTotals?.target_met === 'boolean');
  const marginHealthy = marginHealthQuotes.filter((quote) => quote.financialTotals?.target_met).length;

  const opportunities = ghlResult.status === 'fulfilled' ? ghlResult.value as any[] : [];
  const readyOpportunities = opportunities.filter(isReadyOpportunity);
  const rawProjects = opportunities.filter((opportunity) => opportunity?.pipelineId === PROJECT_PIPELINE_ID);
  const mappedProjects = rawProjects.filter((opportunity) => PROJECT_STAGES[opportunity?.pipelineStageId]);
  const unmappedProjects = rawProjects.length - mappedProjects.length;
  const activeProjects = mappedProjects.filter((opportunity) => PROJECT_STAGES[opportunity.pipelineStageId].progressPct < 100);
  const completedProjects = mappedProjects.length - activeProjects.length;

  const projectStageMap = new Map<string, DashboardStageValue>();
  for (const opportunity of mappedProjects) {
    const stage = PROJECT_STAGES[opportunity.pipelineStageId];
    const existing = projectStageMap.get(stage.key) || {
      key: stage.key,
      label: stage.label,
      count: 0,
      value: 0,
      progressPct: stage.progressPct,
    };
    existing.count += 1;
    existing.value = numeric(existing.value) + numeric(opportunity.monetaryValue);
    projectStageMap.set(stage.key, existing);
  }
  const projectStages = Array.from(projectStageMap.values()).sort(
    (left, right) => numeric(left.progressPct) - numeric(right.progressPct),
  );

  const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : [];
  const inventoryStatuses = stageCounts(
    inventory.map((item: any) => String(item.status || 'STATUS_TO_CONFIRM')),
    ['ON_LOT', 'ORDERED', 'IN_TRANSIT', 'SETUP_IN_PROGRESS', 'SOLD_AWAITING_DELIVERY', 'OFF_LOT', 'STATUS_TO_CONFIRM'],
  ).map((stage) => ({ ...stage, label: stage.label.replaceAll('_', ' ') }));
  const inventoryRetail = inventory.reduce((sum: number, item: any) => sum + numeric(item.ehs_retail_price), 0);
  const inventoryInvoice = inventory.reduce((sum: number, item: any) => sum + numeric(
    item.final_invoice_total ?? item.invoice_without_freight ?? item.factory_invoice_cost,
  ), 0);
  const inventoryFloorplan = inventory.reduce((sum: number, item: any) => sum + numeric(item.floorplan_financing_balance), 0);
  const inventoryNeedsConfirmation = inventory.filter((item: any) => item.status === 'STATUS_TO_CONFIRM').length;

  const properties = propertiesResult.status === 'fulfilled'
    ? propertiesResult.value.map(fromBackendProperty)
    : [];
  const propertyStatuses = stageCounts(properties.map((item: any) => String(item.status || 'UNKNOWN')))
    .map((stage) => ({ ...stage, label: stage.label.replaceAll('_', ' ') }));
  const availableProperties = properties.filter((item: any) => item.status === 'AVAILABLE');
  const publicProperties = properties.filter((item: any) => item.publicVisible);
  const propertiesNeedingConfirmation = properties.filter((item: any) => item.status === 'STATUS_TO_CONFIRM');

  const permits = permittingResult.status === 'fulfilled' ? permittingResult.value : [];
  const finalPermitStatuses = new Set(['Final / CO']);
  const activePermits = permits.filter((job: any) => !finalPermitStatuses.has(job.status));
  const stalePermits = activePermits.filter((job: any) => {
    const age = daysSince(job.updated_at || job.created_at);
    return age !== null && age >= 14;
  });
  const permitAges = activePermits
    .map((job: any) => daysSince(job.created_at))
    .filter((value): value is number => value !== null);
  const permitStatuses = stageCounts(
    permits.map((job: any) => String(job.status || 'Research')),
    ['Research', 'Intake', 'Ready to Submit', 'Submitted', 'Corrections', 'Approved', 'Inspections', 'Final / CO', 'On Hold'],
  );

  const quoteStages: DashboardStageValue[] = QUOTE_STAGE_ORDER.map(({ key, label }) => {
    const stageQuotes = quotes.filter((quote) => quote.status === key);
    return {
      key,
      label,
      count: stageQuotes.length,
      value: stageQuotes.reduce((sum, quote) => sum + numeric(quote.totalTurnkeyPrice || quote.estimatedTotal), 0),
    };
  });

  const alerts: DashboardAlert[] = [];
  if (ghlResult.status === 'fulfilled' && readyOpportunities.length > 0) {
    alerts.push({ id: 'ready', severity: readyOpportunities.length >= 5 ? 'warning' : 'info', label: 'Ready to Quote', value: readyOpportunities.length, destination: '/portal?view=ready' });
  }
  const belowTarget = marginHealthQuotes.length - marginHealthy;
  if (belowTarget > 0) {
    alerts.push({ id: 'margin', severity: 'warning', label: 'Quotes below take-home target', value: belowTarget, destination: '/portal?view=library' });
  }
  if (stalePermits.length > 0) {
    alerts.push({ id: 'permits', severity: stalePermits.length >= 3 ? 'critical' : 'warning', label: 'Permits with no update in 14+ days', value: stalePermits.length, destination: '/portal/amhi' });
  }
  if (inventoryNeedsConfirmation > 0) {
    alerts.push({ id: 'inventory', severity: 'warning', label: 'Inventory records needing confirmation', value: inventoryNeedsConfirmation, destination: '/portal?view=inventory' });
  }
  if (propertiesNeedingConfirmation.length > 0) {
    alerts.push({ id: 'properties', severity: 'warning', label: 'Property records needing confirmation', value: propertiesNeedingConfirmation.length, destination: '/portal?view=property-packages' });
  }
  if (ghlResult.status === 'fulfilled' && unmappedProjects > 0) {
    alerts.push({ id: 'project-stage', severity: 'warning', label: 'GHL projects in unmapped stages', value: unmappedProjects, destination: '/portal?view=projects' });
  }

  const overview: ManagementOverview = {
    generatedAt: new Date().toISOString(),
    sources,
    sales: {
      readyToQuote: ghlResult.status === 'fulfilled' ? readyOpportunities.length : null,
      activeQuoteCount: quotesResult.status === 'fulfilled' ? activeQuotes.length : null,
      activeQuoteValue: quotesResult.status === 'fulfilled'
        ? activeQuotes.reduce((sum, quote) => sum + numeric(quote.totalTurnkeyPrice || quote.estimatedTotal), 0)
        : null,
      inContractCount: quotesResult.status === 'fulfilled' ? contractQuotes.length : null,
      inContractValue: quotesResult.status === 'fulfilled'
        ? contractQuotes.reduce((sum, quote) => sum + numeric(quote.totalTurnkeyPrice || quote.estimatedTotal), 0)
        : null,
      avgActiveQuote: quotesResult.status === 'fulfilled' && activeQuotes.length > 0
        ? activeQuotes.reduce((sum, quote) => sum + numeric(quote.totalTurnkeyPrice || quote.estimatedTotal), 0) / activeQuotes.length
        : null,
      marginHealthPct: quotesResult.status === 'fulfilled' && marginHealthQuotes.length > 0
        ? Math.round((marginHealthy / marginHealthQuotes.length) * 100)
        : null,
      marginHealthSample: marginHealthQuotes.length,
      stages: quoteStages,
      trend: quotesResult.status === 'fulfilled' ? quoteTrend(quotes) : [],
      reps: quotesResult.status === 'fulfilled' ? repPerformance(quotes) : [],
    },
    projects: {
      total: ghlResult.status === 'fulfilled' ? mappedProjects.length : null,
      active: ghlResult.status === 'fulfilled' ? activeProjects.length : null,
      completed: ghlResult.status === 'fulfilled' ? completedProjects : null,
      dealValue: ghlResult.status === 'fulfilled'
        ? mappedProjects.reduce((sum, opportunity) => sum + numeric(opportunity.monetaryValue), 0)
        : null,
      averageProgressPct: ghlResult.status === 'fulfilled' && activeProjects.length > 0
        ? Math.round(activeProjects.reduce((sum, opportunity) => sum + PROJECT_STAGES[opportunity.pipelineStageId].progressPct, 0) / activeProjects.length)
        : null,
      unmappedStageCount: ghlResult.status === 'fulfilled' ? unmappedProjects : null,
      stages: projectStages,
    },
    inventory: {
      count: inventoryResult.status === 'fulfilled' ? inventory.length : null,
      retailValue: inventoryResult.status === 'fulfilled' ? inventoryRetail : null,
      invoiceValue: inventoryResult.status === 'fulfilled' ? inventoryInvoice : null,
      floorplanBalance: inventoryResult.status === 'fulfilled' ? inventoryFloorplan : null,
      statusToConfirm: inventoryResult.status === 'fulfilled' ? inventoryNeedsConfirmation : null,
      statuses: inventoryResult.status === 'fulfilled' ? inventoryStatuses : [],
    },
    properties: {
      count: propertiesResult.status === 'fulfilled' ? properties.length : null,
      available: propertiesResult.status === 'fulfilled' ? availableProperties.length : null,
      publiclyVisible: propertiesResult.status === 'fulfilled' ? publicProperties.length : null,
      needsConfirmation: propertiesResult.status === 'fulfilled' ? propertiesNeedingConfirmation.length : null,
      availableValue: propertiesResult.status === 'fulfilled'
        ? availableProperties.reduce((sum: number, item: any) => sum + numeric(item.price), 0)
        : null,
      statuses: propertiesResult.status === 'fulfilled' ? propertyStatuses : [],
    },
    permitting: {
      total: permittingResult.status === 'fulfilled' ? permits.length : null,
      active: permittingResult.status === 'fulfilled' ? activePermits.length : null,
      stale14Days: permittingResult.status === 'fulfilled' ? stalePermits.length : null,
      oldestActiveDays: permittingResult.status === 'fulfilled' && permitAges.length > 0 ? Math.max(...permitAges) : null,
      statuses: permittingResult.status === 'fulfilled' ? permitStatuses : [],
    },
    alerts,
  };

  return NextResponse.json(
    { success: true, overview },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
