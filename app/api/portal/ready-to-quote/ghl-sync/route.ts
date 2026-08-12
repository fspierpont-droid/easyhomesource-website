import { NextResponse } from 'next/server';
import type { ReadyBuyer } from '@/components/portal/ReadyToQuoteView';

const GHL_API_TOKEN = process.env.GHL_API_KEY || 'pit-3339427e-f798-4d08-9ecb-bb5f852747dd';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'flt9sQU68wrpAtvEMEQZ';
const READY_FOR_QUOTE_FIELD_ID = 'gHIjeANqYjpMcAKF6eIB'; // "Lead ready for quote? / Send Lead To Quote System"

export async function GET() {
  return handleFetchReadyLeads();
}

export async function POST() {
  return handleFetchReadyLeads();
}

async function handleFetchReadyLeads() {
  try {
    const headers = {
      Authorization: `Bearer ${GHL_API_TOKEN}`,
      Version: '2021-07-28',
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0'
    };

    const url = `https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION_ID}&limit=100`;
    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch GHL leads: ${err}`);
    }

    const data = await res.json();
    const opportunities: any[] = data.opportunities || [];

    // Filter strictly for leads where "Lead ready for quote?" checkbox is checked OR tag contains quote_ready
    const readyOpps = opportunities.filter((opp) => {
      const customFields: any[] = opp.customFields || [];
      const checkboxField = customFields.find((f) => f.id === READY_FOR_QUOTE_FIELD_ID);
      const isChecked = checkboxField?.fieldValueBoolean === true || checkboxField?.field_value === true || checkboxField?.fieldValueString === 'true' || (Array.isArray(checkboxField?.fieldValueArray) && checkboxField?.fieldValueArray.length > 0);
      
      const tags: string[] = (opp.contact?.tags || []).map((t: string) => t.toLowerCase());
      const hasQuoteTag = tags.includes('quote_ready') || tags.includes('send_to_quote_system') || tags.includes('ready_to_quote');

      return isChecked || hasQuoteTag;
    });

    const readyBuyers: ReadyBuyer[] = readyOpps.map((opp) => {
      const contact = opp.contact || {};
      const customFields: any[] = opp.customFields || [];

      const getFieldStr = (id: string, defVal = '') => {
        const f = customFields.find((cf) => cf.id === id);
        return f?.fieldValueString || f?.field_value || defVal;
      };

      const landStatus = getFieldStr('BiSItm1i8p4MrsCbySc6') || 'Owns homesite in Central Florida';
      const floorPlan = getFieldStr('u65XL9zAaZiOIqBqygov') || 'Move on Up (3b/2ba)';
      const budgetNum = Number(opp.monetaryValue) || 180000;

      return {
        id: `ghl-ready-${opp.id}`,
        name: contact.name || opp.name || 'Qualified Lead',
        phone: contact.phone || '352-558-8888',
        email: contact.email || 'lead@easyhomesource.com',
        landStatus,
        interestedModel: floorPlan,
        budget: `$${budgetNum.toLocaleString()} turnkey`,
        urgency: 'HIGH',
        source: opp.source || 'GoHighLevel Pipeline (Send Lead To Quote System checked)',
        createdAt: (opp.createdAt || new Date().toISOString()).slice(0, 16).replace('T', ' ')
      };
    });

    return NextResponse.json({
      success: true,
      count: readyBuyers.length,
      readyBuyers
    });
  } catch (err: any) {
    console.error('Ready to Quote GHL sync error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to sync Ready to Quote leads' },
      { status: 500 }
    );
  }
}
