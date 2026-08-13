import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requirePortalAccess } from '@/lib/auth/portalSession';
import { DEPOSIT_STATUS_FIELD_ID, GHL_LOCATION_ID, PROJECT_PIPELINE_ID, ghlRequest, searchOpportunities } from '@/lib/ghl/client';
import type { GhlProject, ProjectStage } from '@/types/project';
import { hasValidCoordinates } from '@/lib/ghl/projectCoordinates';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GHL_STAGE_TO_PORTAL: Record<string, { stage: ProjectStage; label: string; progressPct: number }> = {
  '472ee180-a203-4c58-80fd-5a4c0e9db793': { stage: 'PERMITTING', label: 'Permitting & Engineering', progressPct: 20 },
  '04066448-fc52-4179-8461-a8a29119912a': { stage: 'SITE_PREP', label: 'Site Prep & Infrastructure', progressPct: 40 },
  'cf7f467f-dd5f-4d65-afea-bd32491d00e2': { stage: 'TRANSPORT_SET', label: 'Home Installation', progressPct: 65 },
  '4b7b4df4-5026-44e0-890a-1b475f21093b': { stage: 'FINAL_INSPECTION', label: 'Inspections', progressPct: 85 },
  '6b4b1901-fb78-48aa-a7ea-517bd7b87c81': { stage: 'COMPLETED', label: 'CO Issued / Handover', progressPct: 100 },
  'ebed22f5-8c69-4835-bb5e-e528ec2a4618': { stage: 'COMPLETED', label: 'Support Stage (Warranty)', progressPct: 100 },
  '3a7764dc-8da5-4f72-bad3-f082ead62bb8': { stage: 'COMPLETED', label: 'Support/Warranty Expired', progressPct: 100 }
};

export const PORTAL_STAGE_TO_GHL: Record<ProjectStage, string> = {
  LEAD_QUALIFIED: '472ee180-a203-4c58-80fd-5a4c0e9db793', PERMITTING: '472ee180-a203-4c58-80fd-5a4c0e9db793',
  SITE_PREP: '04066448-fc52-4179-8461-a8a29119912a', FACTORY_BUILD: '04066448-fc52-4179-8461-a8a29119912a',
  TRANSPORT_SET: 'cf7f467f-dd5f-4d65-afea-bd32491d00e2', UTILITIES_HOOKUP: 'cf7f467f-dd5f-4d65-afea-bd32491d00e2',
  FINAL_INSPECTION: '4b7b4df4-5026-44e0-890a-1b475f21093b', COMPLETED: '6b4b1901-fb78-48aa-a7ea-517bd7b87c81'
};

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : 'Not provided';
const number = (value: unknown) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
const customValue = (fields: any[], id: string) => {
  const field = fields.find((item) => item.id === id);
  return field?.fieldValueString ?? field?.fieldValueNumber ?? field?.field_value;
};
const depositStatus = (value: unknown): GhlProject['depositStatus'] => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['collected', 'paid'].includes(normalized)) return 'PAID';
  if (normalized === 'partial') return 'PARTIAL';
  if (normalized === 'pending') return 'PENDING';
  if (normalized === 'escrow') return 'ESCROW';
  return null;
};

async function handleFetchProjectPhaseOpps(request: NextRequest) {
  const access = requirePortalAccess(request);
  if (access.response) return access.response;
  try {
    const [rawOpps, usersData] = await Promise.all([
      searchOpportunities(PROJECT_PIPELINE_ID),
      ghlRequest<{ users?: any[] }>(`/users/?locationId=${GHL_LOCATION_ID}`).catch(() => ({ users: [] }))
    ]);
    const users = new Map((usersData.users || []).map((user) => [user.id, user]));
    // Only stages with an established production mapping qualify. An unknown
    // GHL stage must not be relabeled as a portal stage.
    const opportunities = (rawOpps as any[]).filter((opp) =>
      opp.id && opp.pipelineId === PROJECT_PIPELINE_ID && GHL_STAGE_TO_PORTAL[opp.pipelineStageId]
    );
    const syncedAt = new Date().toISOString();
    const projects: GhlProject[] = await Promise.all(opportunities.map(async (opp) => {
      const embeddedContact = opp.contact || {};
      const contactId = opp.contactId || embeddedContact.id || '';
      // Opportunity search can return a partial embedded contact. Hydrate only
      // partial records, and retain genuine embedded values if contact lookup
      // is unavailable.
      const embeddedCoordinates = { latitude: embeddedContact.latitude, longitude: embeddedContact.longitude };
      const needsHydration = contactId && (!embeddedContact.name || !embeddedContact.phone || !embeddedContact.email || !embeddedContact.address1 || !hasValidCoordinates(embeddedCoordinates));
      const hydrated = needsHydration
        ? await ghlRequest<{ contact?: Record<string, unknown> }>(`/contacts/${encodeURIComponent(contactId)}`).then((data) => data.contact || {}).catch(() => ({}))
        : {};
      const contact = { ...embeddedContact, ...hydrated };
      const fields = Array.isArray(opp.customFields) ? opp.customFields : [];
      const stage = GHL_STAGE_TO_PORTAL[opp.pipelineStageId];
      const rep = users.get(opp.assignedTo) as any;
      const address = customValue(fields, 'dHjTQIz3TiLyA1nTjBKY') ?? contact.address1;
      const coordinates = { latitude: contact.latitude, longitude: contact.longitude };
      const hasCoordinates = hasValidCoordinates(coordinates);
      const canonical = {
        contactId, opportunityId: opp.id, pipelineId: opp.pipelineId,
        pipelineStageId: opp.pipelineStageId || '', status: opp.status || '', monetaryValue: opp.monetaryValue ?? null,
        assignedTo: opp.assignedTo || '', contact, customFields: fields
      };
      return {
        id: `ghl-${opp.id}`, ghlOpportunityId: opp.id, ghlContactId: canonical.contactId,
        ghlPipelineId: opp.pipelineId, ghlPipelineStageId: canonical.pipelineStageId, opportunityStatus: text(opp.status),
        jobId: `GHL-${opp.id.slice(0, 7).toUpperCase()}`, customerName: text(contact.name || opp.name),
        customerPhone: text(contact.phone), customerEmail: text(contact.email), jobAddress: text(address),
        city: text(contact.city), county: text(customValue(fields, process.env.GHL_COUNTY_FIELD_ID || '')),
        state: text(contact.state), zip: text(contact.postalCode), latitude: hasCoordinates ? coordinates.latitude : null,
        longitude: hasCoordinates ? coordinates.longitude : null,
        stage: stage.stage, stageLabel: stage.label, progressPct: stage.progressPct, dealValue: number(opp.monetaryValue),
        depositAmount: number(customValue(fields, 'xuAyycLxj8YoaOAoFIoR')), depositStatus: depositStatus(customValue(fields, DEPOSIT_STATUS_FIELD_ID)),
        assignedRep: text(rep?.name), assignedRepEmail: text(rep?.email), homeModel: text(customValue(fields, 'u65XL9zAaZiOIqBqygov')),
        manufacturer: 'Not provided', bedrooms: null, bathrooms: null, squareFeet: null, dimensions: 'Not provided',
        zoning: text(customValue(fields, 'maaf51kmzQDMhONJqGfb')), milestones: [],
        ghlTags: Array.isArray(contact.tags) ? contact.tags : [], notes: '—',
        createdAt: opp.createdAt || syncedAt, updatedAt: opp.updatedAt || syncedAt, lastGhlSyncAt: syncedAt,
        lastGhlHash: createHash('sha256').update(JSON.stringify(canonical)).digest('hex'), lastSyncSource: 'ghl-fetch'
      };
    }));
    return NextResponse.json({ success: true, pipelineId: PROJECT_PIPELINE_ID, pipelineName: 'Project-Phase', count: projects.length, projects });
  } catch (error) {
    console.error('GHL Project-Phase sync error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load GHL data. Check the connection and try again.' }, { status: 503 });
  }
}
export async function GET(request: NextRequest) { return handleFetchProjectPhaseOpps(request); }
export async function POST(request: NextRequest) { return handleFetchProjectPhaseOpps(request); }
