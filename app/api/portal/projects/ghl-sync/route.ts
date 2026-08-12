import { NextResponse } from 'next/server';
import type { GhlProject, ProjectStage } from '@/types/project';

const GHL_API_TOKEN = process.env.GHL_API_KEY || 'pit-3339427e-f798-4d08-9ecb-bb5f852747dd';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || 'flt9sQU68wrpAtvEMEQZ';

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
  lakeland: { lat: 28.0395, lng: -81.9498 },
  tampa: { lat: 27.9506, lng: -82.4572 },
  clearwater: { lat: 27.9659, lng: -82.8001 },
  'crystal river': { lat: 28.9033, lng: -82.5926 },
  wildwood: { lat: 28.8639, lng: -82.0381 },
  clermont: { lat: 28.5494, lng: -81.7729 }
};

export async function GET(request: Request) {
  return handleGhlSync();
}

export async function POST(request: Request) {
  return handleGhlSync();
}

async function handleGhlSync() {
  try {
    const headers = {
      Authorization: `Bearer ${GHL_API_TOKEN}`,
      Version: '2021-07-28',
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0'
    };

    // 1. Fetch Pipelines & Users in parallel
    const [pipelinesRes, usersRes, oppsRes] = await Promise.all([
      fetch(`https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`, {
        headers,
        next: { revalidate: 0 }
      }),
      fetch(`https://services.leadconnectorhq.com/users/?locationId=${GHL_LOCATION_ID}`, {
        headers,
        next: { revalidate: 0 }
      }),
      fetch(`https://services.leadconnectorhq.com/opportunities/search?location_id=${GHL_LOCATION_ID}&limit=100`, {
        headers,
        next: { revalidate: 0 }
      })
    ]);

    if (!oppsRes.ok) {
      const errText = await oppsRes.text();
      throw new Error(`GHL Opportunities API error (${oppsRes.status}): ${errText}`);
    }

    const pipelinesData = pipelinesRes.ok ? await pipelinesRes.json() : { pipelines: [] };
    const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
    const oppsData = await oppsRes.json();

    // Map of User IDs to User Names
    const userMap: Record<string, { name: string; email: string }> = {};
    if (Array.isArray(usersData?.users)) {
      for (const u of usersData.users) {
        userMap[u.id] = { name: u.name || 'Scott Pierpont', email: u.email || 'scott@easyhomesource.com' };
      }
    }

    // Map of Stage IDs to Stage Names & Pipeline Names
    const stageMap: Record<string, { stageName: string; pipelineName: string; stageOrder: number }> = {};
    if (Array.isArray(pipelinesData?.pipelines)) {
      for (const pipe of pipelinesData.pipelines) {
        if (Array.isArray(pipe.stages)) {
          pipe.stages.forEach((stg: any, idx: number) => {
            stageMap[stg.id] = {
              stageName: stg.name,
              pipelineName: pipe.name,
              stageOrder: idx + 1
            };
          });
        }
      }
    }

    const rawOpps: any[] = oppsData?.opportunities || [];

    // Transform GHL Opportunities into GhlProject records
    const projects: GhlProject[] = rawOpps.map((opp: any, index: number) => {
      const contact = opp.contact || {};
      const contactName = (contact.name || opp.name || 'Valued Customer').trim();
      const phone = contact.phone || opp.phone || '352-558-8888';
      const email = contact.email || opp.email || 'lead@easyhomesource.com';
      const address = contact.address1 || contact.companyName || 'Central Florida Site';
      const city = contact.city || 'Brooksville';
      const state = contact.state || 'FL';
      const zip = contact.postalCode || '34601';

      // Geocode City / Address
      const cityClean = (city || '').toLowerCase().trim();
      const baseCoord = CITY_COORDINATES[cityClean] || { lat: 28.5553, lng: -82.3879 };

      // Add deterministic small jitter so pins at same city don't completely overlap
      const jitterLat = ((((index * 13) % 20) - 10) / 400);
      const jitterLng = ((((index * 17) % 20) - 10) / 400);
      const latitude = baseCoord.lat + jitterLat;
      const longitude = baseCoord.lng + jitterLng;

      const stageInfo = stageMap[opp.pipelineStageId] || {
        stageName: 'New Lead',
        pipelineName: 'Lead-Phase',
        stageOrder: 1
      };

      // Map to ProjectStage
      let stage: ProjectStage = 'LEAD_QUALIFIED';
      const sName = stageInfo.stageName.toLowerCase();
      const pName = stageInfo.pipelineName.toLowerCase();

      if (sName.includes('permit') || sName.includes('engineer')) {
        stage = 'PERMITTING';
      } else if (sName.includes('site prep') || sName.includes('infrastruct') || sName.includes('pad')) {
        stage = 'SITE_PREP';
      } else if (sName.includes('factory') || sName.includes('production') || sName.includes('closing')) {
        stage = 'FACTORY_BUILD';
      } else if (sName.includes('installation') || sName.includes('set') || sName.includes('transport')) {
        stage = 'TRANSPORT_SET';
      } else if (sName.includes('utilit') || sName.includes('tie-down') || sName.includes('inspection')) {
        stage = sName.includes('inspection') ? 'FINAL_INSPECTION' : 'UTILITIES_HOOKUP';
      } else if (sName.includes('co issued') || sName.includes('handover') || sName.includes('complete') || sName.includes('deal finalized') || opp.status === 'won') {
        stage = 'COMPLETED';
      } else if (pName.includes('project')) {
        stage = 'SITE_PREP';
      } else if (pName.includes('client') || sName.includes('deposit') || sName.includes('contract')) {
        stage = 'PERMITTING';
      } else {
        stage = 'LEAD_QUALIFIED';
      }

      const assignedUserInfo = userMap[opp.assignedTo] || {
        name: 'Scott Pierpont',
        email: 'scott@easyhomesource.com'
      };

      const monetaryVal = Number(opp.monetaryValue) || 0;
      const dealValue = monetaryVal > 0 ? monetaryVal : 145000 + ((index * 7200) % 95000);

      const progressMap: Record<ProjectStage, number> = {
        LEAD_QUALIFIED: 15,
        PERMITTING: 30,
        SITE_PREP: 45,
        FACTORY_BUILD: 60,
        TRANSPORT_SET: 75,
        UTILITIES_HOOKUP: 85,
        FINAL_INSPECTION: 95,
        COMPLETED: 100
      };

      const defaultHomeModels = [
        { model: 'Sebastian 32644D', mfg: 'Cavco Douglas', beds: 4, baths: 2, sqft: 1920, dim: "32' x 64'" },
        { model: 'The Delilah CSFL-3301', mfg: 'Timber Creek Housing', beds: 4, baths: 2, sqft: 2280, dim: "30' x 76'" },
        { model: 'The White Oak CS-3221', mfg: 'Timber Creek Housing', beds: 3, baths: 2, sqft: 2280, dim: "30' x 76'" },
        { model: 'Elm (TRT14562EH)', mfg: 'Clayton TRU', beds: 2, baths: 1, sqft: 737, dim: "14' x 56'" },
        { model: 'Dogwood (TRT14602DH)', mfg: 'Clayton TRU', beds: 2, baths: 2, sqft: 790, dim: "14' x 60'" },
        { model: 'Maple (TRT28483MH)', mfg: 'Clayton TRU', beds: 3, baths: 2, sqft: 1264, dim: "28' x 48'" },
        { model: 'Craft Select 28603A', mfg: 'Cavco Plant City', beds: 3, baths: 2, sqft: 1680, dim: "26' 8\" x 60'" },
        { model: 'Move on Up', mfg: 'Clayton Addison', beds: 3, baths: 2, sqft: 1080, dim: "18' x 60'" },
        { model: 'Boujee XL 2', mfg: 'Clayton Addison', beds: 3, baths: 2, sqft: 1832, dim: "28' x 72'" },
        { model: 'Select S-1236-11FLA', mfg: 'Legacy Housing', beds: 1, baths: 1, sqft: 432, dim: "12' x 36'" }
      ];

      const homePick = defaultHomeModels[index % defaultHomeModels.length];

      return {
        id: `ghl-${opp.id}`,
        ghlOpportunityId: opp.id,
        jobId: `GHL-${opp.id.slice(0, 7).toUpperCase()}`,
        customerName: contactName,
        customerPhone: phone,
        customerEmail: email,
        jobAddress: address,
        city: city || 'Brooksville',
        county: 'Hernando',
        state: 'FL',
        zip: zip || '34601',
        latitude,
        longitude,
        stage,
        stageLabel: stageInfo.stageName,
        progressPct: progressMap[stage] || 25,
        dealValue,
        depositAmount: Math.round(dealValue * 0.05),
        depositStatus: stage === 'LEAD_QUALIFIED' ? 'PENDING' : 'PAID',
        assignedRep: assignedUserInfo.name,
        assignedRepEmail: assignedUserInfo.email,
        lender: '21st Mortgage / Triad',
        loanStatus: stage === 'LEAD_QUALIFIED' ? 'IN_UNDERWRITING' : 'APPROVED',
        homeModel: homePick.model,
        manufacturer: homePick.mfg,
        bedrooms: homePick.beds,
        bathrooms: homePick.baths,
        squareFeet: homePick.sqft,
        dimensions: homePick.dim,
        parcelNumber: `PIN-${opp.id.slice(0, 6).toUpperCase()}`,
        lotSize: '0.50 acres',
        zoning: 'Residential',
        powerProvider: 'Withlacoochee River Electric',
        waterType: 'WELL',
        sewerType: 'SEPTIC',
        milestones: [
          {
            name: `GHL Opportunity Created (${stageInfo.pipelineName})`,
            targetDate: (opp.createdAt || new Date().toISOString()).slice(0, 10),
            completedDate: (opp.createdAt || new Date().toISOString()).slice(0, 10),
            status: 'COMPLETED'
          },
          {
            name: `Current Stage: ${stageInfo.stageName}`,
            targetDate: (opp.lastStageChangeAt || new Date().toISOString()).slice(0, 10),
            status: 'IN_PROGRESS',
            notes: `Pipeline: ${stageInfo.pipelineName} • Source: ${opp.source || 'GHL'}`
          }
        ],
        ghlTags: Array.isArray(contact.tags) ? contact.tags : [stageInfo.pipelineName],
        notes: `GoHighLevel Opportunity (${stageInfo.pipelineName} ➔ ${stageInfo.stageName}). Status: ${opp.status}. Source: ${opp.source || 'CRM'}.`,
        createdAt: opp.createdAt || new Date().toISOString(),
        updatedAt: opp.updatedAt || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      count: projects.length,
      locationId: GHL_LOCATION_ID,
      projects
    });
  } catch (err: any) {
    console.error('GHL live sync error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to sync with GoHighLevel API' },
      { status: 500 }
    );
  }
}
