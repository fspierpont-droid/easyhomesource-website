import { NextResponse } from 'next/server';
import type { GhlProject, ProjectStage } from '@/types/project';

<<<<<<< HEAD
=======
export const dynamic = 'force-dynamic';
export const revalidate = 0;

>>>>>>> 159852c (Filter Project Board strictly to GHL Project-Phase pipeline and enable automatic live sync on load)
const GHL_API_TOKEN = process.env.GHL_API_KEY || 'pit-3339427e-f798-4d08-9ecb-bb5f852747dd';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'flt9sQU68wrpAtvEMEQZ';
const PROJECT_PIPELINE_ID = 'W8RI4f1c9G72Fzn1LVlS'; // GoHighLevel "Project-Phase" Pipeline

// Stage ID Mapping between GHL and Portal
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
  LEAD_QUALIFIED: '472ee180-a203-4c58-80fd-5a4c0e9db793',
  PERMITTING: '472ee180-a203-4c58-80fd-5a4c0e9db793',
  SITE_PREP: '04066448-fc52-4179-8461-a8a29119912a',
  FACTORY_BUILD: '04066448-fc52-4179-8461-a8a29119912a',
  TRANSPORT_SET: 'cf7f467f-dd5f-4d65-afea-bd32491d00e2',
  UTILITIES_HOOKUP: 'cf7f467f-dd5f-4d65-afea-bd32491d00e2',
  FINAL_INSPECTION: '4b7b4df4-5026-44e0-890a-1b475f21093b',
  COMPLETED: '6b4b1901-fb78-48aa-a7ea-517bd7b87c81'
};

const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '11123 snow lark ave': { lat: 28.6189, lng: -82.4921 }, // Brooksville
  '4128 feldspar ln': { lat: 28.4612, lng: -82.5304 }, // Spring Hill
  '6645 w erlen ln': { lat: 28.7885, lng: -82.5932 }, // Homosassa
  '9248 denmarsh dr': { lat: 28.5381, lng: -82.3614 }, // Brooksville
  '7112 fitzpatrick ave': { lat: 28.5123, lng: -82.4102 }, // Brooksville
  '26314 glenwood dr': { lat: 28.2336, lng: -82.1812 }, // Zephyrhills
  '14108 us hwy 301': { lat: 28.3647, lng: -82.1959 }, // Dade City
  '8312 e gospel island rd': { lat: 28.8472, lng: -82.3129 }, // Inverness
  '4220 cr 476': { lat: 28.6653, lng: -82.1126 } // Bushnell
};

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  homosassa: { lat: 28.7885, lng: -82.5932 },
  brooksville: { lat: 28.5553, lng: -82.3879 },
  'spring hill': { lat: 28.4764, lng: -82.6067 },
  zephyrhills: { lat: 28.2336, lng: -82.1812 },
  'dade city': { lat: 28.3647, lng: -82.1959 },
  inverness: { lat: 28.8472, lng: -82.3129 },
  bushnell: { lat: 28.6653, lng: -82.1126 },
  leesburg: { lat: 28.8108, lng: -81.8779 },
  ocala: { lat: 29.1872, lng: -82.1401 },
  tampa: { lat: 27.9506, lng: -82.4572 }
};

export async function GET() {
  return handleFetchProjectPhaseOpps();
}

export async function POST() {
  return handleFetchProjectPhaseOpps();
}

async function handleFetchProjectPhaseOpps() {
  try {
    const headers = {
      Authorization: `Bearer ${GHL_API_TOKEN}`,
      Version: '2021-07-28',
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0'
    };

    // 1. Fetch opportunities strictly from Project-Phase pipeline
    const url = `https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION_ID}&pipeline_id=${PROJECT_PIPELINE_ID}&limit=100`;
    const usersUrl = `https://services.leadconnectorhq.com/users/?locationId=${GHL_LOCATION_ID}`;

    const [oppsRes, usersRes] = await Promise.all([
      fetch(url, { headers, cache: 'no-store' }),
      fetch(usersUrl, { headers, cache: 'no-store' })
    ]);

    if (!oppsRes.ok) {
      const err = await oppsRes.text();
      throw new Error(`Failed to fetch GHL Project-Phase opportunities: ${err}`);
    }

    const oppsData = await oppsRes.json();
    const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

    // Build user map
    const userMap: Record<string, { name: string; email: string }> = {};
    if (Array.isArray(usersData?.users)) {
      for (const u of usersData.users) {
        userMap[u.id] = { name: u.name || 'Scott Pierpont', email: u.email || 'scott@easyhomesource.com' };
      }
    }

<<<<<<< HEAD
    const opportunities: any[] = oppsData.opportunities || [];
=======
    // Strict filter: only items belonging to the Project-Phase pipeline ID
    const rawOpps: any[] = oppsData.opportunities || [];
    const opportunities = rawOpps.filter((opp) => opp.pipelineId === PROJECT_PIPELINE_ID);
>>>>>>> 159852c (Filter Project Board strictly to GHL Project-Phase pipeline and enable automatic live sync on load)

    // Transform strictly to GhlProject models
    const projects: GhlProject[] = opportunities.map((opp, idx) => {
      const contact = opp.contact || {};
      const customFields: any[] = opp.customFields || [];

      // Extract custom field values
      const getFieldStr = (id: string, defVal = '') => {
        const f = customFields.find((cf) => cf.id === id);
        return f?.fieldValueString || f?.field_value || defVal;
      };
      const getFieldNum = (id: string, defVal = 0) => {
        const f = customFields.find((cf) => cf.id === id);
        return Number(f?.fieldValueNumber ?? f?.field_value ?? defVal) || defVal;
      };

      const siteAddressRaw = getFieldStr('dHjTQIz3TiLyA1nTjBKY') || contact.address1 || 'Central Florida Homesite';
      const floorPlanName = getFieldStr('u65XL9zAaZiOIqBqygov') || 'Satisfaction';
      const financeAmount = getFieldNum('1SifLGK97kceKz4AgIVA') || Number(opp.monetaryValue) || 185000;
      const downPayment = getFieldNum('xuAyycLxj8YoaOAoFIoR') || Math.round(financeAmount * 0.05);
      const landStatus = getFieldStr('BiSItm1i8p4MrsCbySc6') || 'Owned';
      const depositStatusStr = getFieldStr('hXYhZkFA1uizZeag77zR') || 'Collected';
      const zoning = getFieldStr('maaf51kmzQDMhONJqGfb') || 'Residential';

      // Geocode Address
      const addrLower = siteAddressRaw.toLowerCase();
      let coords = { lat: 28.5553, lng: -82.3879 };

      for (const [knownAddr, c] of Object.entries(KNOWN_COORDINATES)) {
        if (addrLower.includes(knownAddr)) {
          coords = c;
          break;
        }
      }

      if (coords.lat === 28.5553 && coords.lng === -82.3879) {
        for (const [city, c] of Object.entries(CITY_COORDINATES)) {
          if (addrLower.includes(city) || (contact.city && contact.city.toLowerCase().includes(city))) {
            const jitterLat = ((((idx * 13) % 20) - 10) / 450);
            const jitterLng = ((((idx * 17) % 20) - 10) / 450);
            coords = { lat: c.lat + jitterLat, lng: c.lng + jitterLng };
            break;
          }
        }
      }

      const stageMapping = GHL_STAGE_TO_PORTAL[opp.pipelineStageId] || {
        stage: 'PERMITTING',
        label: 'Permitting & Engineering',
        progressPct: 20
      };

      const assignedRep = userMap[opp.assignedTo]?.name || 'Scott Pierpont';
      const assignedRepEmail = userMap[opp.assignedTo]?.email || 'scott@easyhomesource.com';

      return {
        id: `ghl-${opp.id}`,
        ghlOpportunityId: opp.id,
        jobId: `GHL-${opp.id.slice(0, 7).toUpperCase()}`,
        customerName: contact.name || opp.name || 'Valued Customer',
        customerPhone: contact.phone || '352-558-8888',
        customerEmail: contact.email || 'customer@easyhomesource.com',
        jobAddress: siteAddressRaw,
        city: contact.city || (siteAddressRaw.includes('Spring Hill') ? 'Spring Hill' : 'Brooksville'),
        county: siteAddressRaw.includes('Citrus') ? 'Citrus' : (siteAddressRaw.includes('Pasco') ? 'Pasco' : 'Hernando'),
        state: 'FL',
        zip: contact.postalCode || '34601',
        latitude: coords.lat,
        longitude: coords.lng,
        stage: stageMapping.stage,
        stageLabel: stageMapping.label,
        progressPct: stageMapping.progressPct,
        dealValue: financeAmount,
        depositAmount: downPayment,
        depositStatus: depositStatusStr.toLowerCase().includes('collect') ? 'PAID' : 'PENDING',
        assignedRep,
        assignedRepEmail,
        lender: '21st Mortgage',
        loanStatus: 'APPROVED',
        homeModel: floorPlanName,
        manufacturer: 'Clayton Addison',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1200,
        dimensions: "28' x 52'",
        parcelNumber: `PIN-${opp.id.slice(0, 6).toUpperCase()}`,
        lotSize: '0.50 acres',
        zoning,
        powerProvider: 'Withlacoochee River Electric',
        waterType: 'WELL',
        sewerType: 'SEPTIC',
        milestones: [
          {
            name: 'Project Opportunity Created',
            targetDate: (opp.createdAt || new Date().toISOString()).slice(0, 10),
            completedDate: (opp.createdAt || new Date().toISOString()).slice(0, 10),
            status: 'COMPLETED'
          },
          {
            name: `Active Stage: ${stageMapping.label}`,
            targetDate: (opp.lastStageChangeAt || new Date().toISOString()).slice(0, 10),
            status: 'IN_PROGRESS',
            notes: `Pipeline: Project-Phase • Status: ${opp.status}`
          }
        ],
        ghlTags: Array.isArray(contact.tags) ? contact.tags : ['Project-Phase', 'GHL Opportunity'],
        notes: `GoHighLevel Project-Phase Opportunity. Home: ${floorPlanName}. Land Status: ${landStatus}.`,
        createdAt: opp.createdAt || new Date().toISOString(),
        updatedAt: opp.updatedAt || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      pipelineId: PROJECT_PIPELINE_ID,
      pipelineName: 'Project-Phase',
      count: projects.length,
      projects
    });
  } catch (err: any) {
    console.error('GHL Project-Phase sync error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to sync Project-Phase opportunities' },
      { status: 500 }
    );
  }
}
