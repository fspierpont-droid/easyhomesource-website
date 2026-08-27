import { NextRequest, NextResponse } from 'next/server';
import { requirePortalAccess } from '@/lib/auth/portalSession';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { READY_FOR_QUOTE_FIELD_ID, searchOpportunities } from '@/lib/ghl/client';
import { FULL_MASTER_CATALOG_HOMES, type MasterCatalogHome } from '@/data/fullMasterCatalog.generated';
import {
  SERVICE_CATALOG,
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
  calculateTrimOut,
} from '@/data/pricingSpreadsheet';
import { fromBackendQuote } from '@/lib/quotes/permanentQuote';

const LAND_STATUS_FIELD_ID = 'BiSItm1i8p4MrsCbySc6';
const INTERESTED_MODEL_FIELD_ID = 'u65XL9zAaZiOIqBqygov';

function text(value: unknown) {
  const cleaned = String(value ?? '').trim();
  return cleaned && cleaned.toLowerCase() !== 'not provided' ? cleaned : '';
}

function customValue(fields: any[], id: string) {
  const field = fields.find((item) => item?.id === id);
  return field?.fieldValueString ?? field?.fieldValueNumber ?? field?.field_value ?? '';
}

function isReadyOpportunity(opp: any) {
  const fields = Array.isArray(opp?.customFields) ? opp.customFields : [];
  const checkbox = fields.find((field: any) => field?.id === READY_FOR_QUOTE_FIELD_ID);
  const checked = checkbox?.fieldValueBoolean === true
    || checkbox?.field_value === true
    || checkbox?.fieldValueString === 'true'
    || (Array.isArray(checkbox?.fieldValueArray) && checkbox.fieldValueArray.length > 0);
  const tags = (opp?.contact?.tags || []).map((tag: string) => String(tag).toLowerCase());
  return checked || ['quote_ready', 'send_to_quote_system', 'ready_to_quote'].some((tag) => tags.includes(tag));
}

function normalizeModel(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function resolveInterestedHome(rawInterest: string): MasterCatalogHome | null {
  const interest = normalizeModel(rawInterest);
  if (!interest) return null;

  const exact = FULL_MASTER_CATALOG_HOMES.filter((home) => {
    const names = [home.name, home.slug, `${home.series} ${home.name}`].map(normalizeModel).filter(Boolean);
    return names.includes(interest);
  });
  if (exact.length === 1) return exact[0];

  const contained = FULL_MASTER_CATALOG_HOMES.filter((home) => {
    const name = normalizeModel(home.name);
    return name.length >= 5 && (interest.includes(name) || name.includes(interest));
  });
  return contained.length === 1 ? contained[0] : null;
}

function sections(home: MasterCatalogHome) {
  const width = Number(home.width) || 14;
  if (width <= 18) return 1;
  if (width <= 36) return 2;
  return 3;
}

function line(
  id: string,
  sku: string,
  name: string,
  description: string,
  category: string,
  cost: number,
  price: number,
  qty = 1,
) {
  return {
    id,
    portal_id: id,
    sku,
    service_id: sku,
    name,
    portal_name: name,
    portal_category: category,
    description,
    portal_description: description,
    qty,
    unit_price: price,
    cost,
    included_in_financing: true,
  };
}

function catalogLine(sku: string, id: string) {
  const item = SERVICE_CATALOG.find((candidate) => candidate.sku === sku);
  if (!item) return null;
  return line(
    id,
    item.sku,
    item.name,
    item.description,
    item.category,
    Number(item.defaultCost) || 0,
    Number(item.defaultPrice) || 0,
  );
}

function requiredSetup(home: MasterCatalogHome) {
  const sectionCount = sections(home);
  const sectionClass = sectionCount === 1 ? 'single' : sectionCount === 2 ? 'double' : 'triple';
  const block = calculateBlockTieDown(Number(home.length) || 60, sectionClass);
  const trim = calculateTrimOut(sectionCount);
  const skirting = calculateSkirtingByDimensions(Number(home.width) || 14, Number(home.length) || 60);

  return [
    line(
      'setup-block',
      'SITE-BLOCK-TIEDOWN',
      'Block & Tie-Down & Vapor Barrier',
      `Calculated from the ${block.matchedLength}-ft ${sectionClass}-section Master Quote 5 table.`,
      'mandatory_services',
      block.cost,
      block.price,
    ),
    line(
      'setup-trim',
      'SITE-TRIMOUT',
      `Trim Out - ${trim.label}`,
      'Calculated from the selected home section count.',
      'mandatory_services',
      trim.cost,
      trim.price,
    ),
    catalogLine('SITE-PERIMETER-STABILIZATION', 'setup-stabilization'),
    catalogLine('SITE-STEPS-2SET', 'setup-steps'),
    line(
      'setup-skirting',
      'SITE-SKIRTING-VALOR',
      'Basic Valor Skirting',
      `${skirting.linearFeet} actual perimeter linear feet at the Master Quote 5 $8 cost / $10 customer rate.`,
      'mandatory_services',
      8,
      10,
      skirting.linearFeet,
    ),
    catalogLine('SITE-PERMIT-PLAN', 'setup-permits'),
  ].filter(Boolean);
}

function contactAddress(contact: any) {
  return [
    text(contact?.address1 || contact?.address),
    text(contact?.city),
    text(contact?.state),
    text(contact?.postalCode || contact?.postal_code),
  ].filter(Boolean).join(', ');
}

export async function POST(request: NextRequest) {
  const access = await requirePortalAccess(request);
  if (access.response) return access.response;

  try {
    const body = await request.json().catch(() => ({}));
    const opportunityId = text(body?.ghlOpportunityId);
    if (!opportunityId) {
      return NextResponse.json({ success: false, error: 'GHL opportunity ID is required.' }, { status: 400 });
    }

    const draftId = `quote-ghl-${opportunityId}`;
    const existing = await permanentApiRequest(request, `/api/quotes/${encodeURIComponent(draftId)}`);
    if (existing.ok) {
      const existingPayload = await existing.json();
      return NextResponse.json({ success: true, created: false, quote: fromBackendQuote(existingPayload) });
    }
    if (existing.status !== 404) {
      const payload = await existing.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: payload.detail || 'Unable to check for an existing GHL quote draft.' },
        { status: existing.status },
      );
    }

    const opportunities = await searchOpportunities() as any[];
    const opportunity = opportunities.find((item) => item?.id === opportunityId);
    if (!opportunity) {
      return NextResponse.json({ success: false, error: 'The selected GHL opportunity was not found.' }, { status: 404 });
    }
    if (!isReadyOpportunity(opportunity)) {
      return NextResponse.json({ success: false, error: 'This GHL opportunity is no longer marked Ready to Quote.' }, { status: 409 });
    }

    const contact = opportunity.contact || {};
    const fields = Array.isArray(opportunity.customFields) ? opportunity.customFields : [];
    const name = text(contact.name || opportunity.name);
    const phone = text(contact.phone);
    const email = text(contact.email);
    const landStatus = text(customValue(fields, LAND_STATUS_FIELD_ID));
    const interestedModel = text(customValue(fields, INTERESTED_MODEL_FIELD_ID));
    const matchedHome = resolveInterestedHome(interestedModel);
    const targetBudget = typeof opportunity.monetaryValue === 'number' && Number.isFinite(opportunity.monetaryValue)
      ? opportunity.monetaryValue
      : 0;
    const address = contactAddress(contact);

    if (!name) {
      return NextResponse.json({ success: false, error: 'The GHL lead does not have a customer name.' }, { status: 400 });
    }

    const home = matchedHome
      ? {
          model_name: matchedHome.name,
          manufacturer: matchedHome.manufacturer,
          series: matchedHome.series,
          beds: matchedHome.bedrooms,
          baths: matchedHome.bathrooms,
          sqft: matchedHome.squareFeet,
          width: matchedHome.width,
          length: matchedHome.length,
          dimensions: matchedHome.dimensions,
        }
      : {
          model_name: interestedModel || 'Home TBD',
          manufacturer: '',
          series: '',
          beds: 0,
          baths: 0,
          sqft: 0,
          width: 14,
          length: 60,
          dimensions: '',
        };

    const source = text(opportunity.source);
    const notes = [
      `GHL opportunity: ${opportunityId}`,
      text(opportunity.contactId || contact.id) ? `GHL contact: ${text(opportunity.contactId || contact.id)}` : '',
      source ? `Lead source: ${source}` : '',
      landStatus ? `Land status from GHL: ${landStatus}` : '',
      interestedModel ? `Model interest from GHL: ${interestedModel}` : '',
      interestedModel && !matchedHome ? 'Model was not auto-selected because the GHL value was missing, ambiguous, or did not uniquely match the Master Quote 5 catalog.' : '',
    ].filter(Boolean).join('\n');

    const backendPayload = {
      id: draftId,
      pricing_mode: 'portal_v05',
      status: 'draft',
      customer_snapshot: {
        name,
        phone,
        email,
        address,
        ghl_contact_id: text(opportunity.contactId || contact.id),
        ghl_opportunity_id: opportunityId,
      },
      home,
      site: {
        owns_land: landStatus ? /own|yes|have land|property/i.test(landStatus) : undefined,
        delivery_address: '',
        property_address: '',
        land_price: 0,
        ghl_land_status: landStatus,
      },
      base_price: matchedHome ? Number(matchedHome.ehsPrice) || 0 : 0,
      factory_cost: matchedHome ? Number(matchedHome.estFactoryCost) || 0 : 0,
      land_price: 0,
      delivery_price: 0,
      delivery_cost: 0,
      mandatory_services: matchedHome ? requiredSetup(matchedHome) : [],
      site_work: [],
      addons: [],
      options: [],
      discounts: [],
      deposits: [],
      sales_tax_rate: 0.03,
      ehs_loan_used: false,
      financing: {
        purchase_type: 'financing',
        financing_status: 'pending',
        pre_approval_amount: 0,
        target_budget: targetBudget,
        ehs_loan_used: false,
      },
      notes_internal: notes,
      notes_customer: '',
      source_system: 'ghl_ready_to_quote',
      source_record_id: opportunityId,
    };

    const created = await permanentApiRequest(request, '/api/quotes', {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    });
    const payload = await created.json().catch(() => ({}));
    if (!created.ok) {
      return NextResponse.json(
        { success: false, error: payload.detail || 'Permanent quote draft creation failed.' },
        { status: created.status },
      );
    }

    return NextResponse.json({ success: true, created: true, quote: fromBackendQuote(payload) }, { status: 201 });
  } catch (error) {
    console.error('GHL quote draft creation failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to create the quote from GHL.' },
      { status: 500 },
    );
  }
}
