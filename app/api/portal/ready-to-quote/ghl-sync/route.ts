import { NextResponse } from 'next/server';
import { READY_FOR_QUOTE_FIELD_ID, searchOpportunities } from '@/lib/ghl/client';
import type { ReadyBuyer } from '@/components/portal/ReadyToQuoteView';

const provided = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : 'Not provided';
const customValue = (fields: any[], id: string) => {
  const field = fields.find((item) => item.id === id);
  return field?.fieldValueString ?? field?.fieldValueNumber ?? field?.field_value;
};

async function handleFetchReadyLeads() {
  try {
    const opportunities = await searchOpportunities() as any[];
    const readyOpps = opportunities.filter((opp) => {
      const fields = Array.isArray(opp.customFields) ? opp.customFields : [];
      const checkbox = fields.find((field: any) => field.id === READY_FOR_QUOTE_FIELD_ID);
      const checked = checkbox?.fieldValueBoolean === true || checkbox?.field_value === true || checkbox?.fieldValueString === 'true' || checkbox?.fieldValueArray?.length > 0;
      const tags = (opp.contact?.tags || []).map((tag: string) => tag.toLowerCase());
      const contactId = opp.contactId || opp.contact?.id;
      return opp.id && contactId && (checked || ['quote_ready', 'send_to_quote_system', 'ready_to_quote'].some((tag) => tags.includes(tag)));
    });
    const readyBuyers: ReadyBuyer[] = readyOpps.map((opp) => {
      const contact = opp.contact || {};
      const fields = Array.isArray(opp.customFields) ? opp.customFields : [];
      const monetaryValue = typeof opp.monetaryValue === 'number' && Number.isFinite(opp.monetaryValue)
        ? opp.monetaryValue
        : null;
      return {
        id: `ghl-ready-${opp.id}`, ghlContactId: opp.contactId || contact.id || '', ghlOpportunityId: opp.id,
        ghlPipelineId: opp.pipelineId || '', ghlPipelineStageId: opp.pipelineStageId || '',
        name: provided(contact.name || opp.name), phone: provided(contact.phone), email: provided(contact.email),
        landStatus: provided(customValue(fields, 'BiSItm1i8p4MrsCbySc6')), interestedModel: provided(customValue(fields, 'u65XL9zAaZiOIqBqygov')),
        budget: monetaryValue === null ? '—' : `$${monetaryValue.toLocaleString()}`, urgency: 'MEDIUM',
        source: provided(opp.source), createdAt: opp.createdAt ? String(opp.createdAt).slice(0, 16).replace('T', ' ') : '—'
      };
    });
    return NextResponse.json({ success: true, count: readyBuyers.length, readyBuyers });
  } catch (error) {
    console.error('Ready to Quote GHL sync error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load GHL data. Check the connection and try again.' }, { status: 503 });
  }
}
export async function GET() { return handleFetchReadyLeads(); }
export async function POST() { return handleFetchReadyLeads(); }
