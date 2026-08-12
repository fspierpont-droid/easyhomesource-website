import { NextResponse } from 'next/server';
import { INITIAL_GHL_PROJECTS } from '@/data/projectStore';
import type { GhlProject } from '@/types/project';

let inMemoryProjects: GhlProject[] = [...INITIAL_GHL_PROJECTS];

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
  crystalriver: { lat: 28.9033, lng: -82.5926 },
  'crystal river': { lat: 28.9033, lng: -82.5926 }
};

export async function GET(request: Request) {
  try {
    const backendBase = (process.env.EHS_BACKEND_URL || 'https://ehs-api-staging.onrender.com').replace(/\/$/, '');
    
    // Try fetching from backend API if available
    try {
      const res = await fetch(`${backendBase}/api/projects`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 0 }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return NextResponse.json({
            success: true,
            count: data.length,
            projects: data,
            source: 'ghl-backend'
          });
        }
      }
    } catch {
      // fallback to inMemory
    }

    return NextResponse.json({
      success: true,
      count: inMemoryProjects.length,
      projects: inMemoryProjects,
      source: 'local-store'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const cityKey = (body.city || '').toLowerCase().trim();
    const defaultCoords = CITY_COORDINATES[cityKey] || {
      lat: 28.5553 + (Math.random() - 0.5) * 0.3,
      lng: -82.3879 + (Math.random() - 0.5) * 0.3
    };

    // GHL Webhook opportunity ingestion
    const newProject: GhlProject = {
      id: body.id || `proj-${Date.now()}`,
      ghlOpportunityId: body.ghlOpportunityId || body.opportunity_id || body.id || `ghl-opp-${Date.now()}`,
      jobId: body.jobId || `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerName: body.customerName || body.contact_name || body.name || 'New Customer',
      customerPhone: body.customerPhone || body.phone || '352-555-0100',
      customerEmail: body.customerEmail || body.email || 'customer@example.com',
      jobAddress: body.jobAddress || body.address || 'Central Florida Site',
      city: body.city || 'Brooksville',
      county: body.county || 'Hernando',
      state: body.state || 'FL',
      zip: body.zip || '34601',
      latitude: Number(body.latitude) || defaultCoords.lat,
      longitude: Number(body.longitude) || defaultCoords.lng,
      stage: body.stage || 'LEAD_QUALIFIED',
      stageLabel: body.stageLabel || 'Lead Qualified',
      progressPct: Number(body.progressPct) || 15,
      dealValue: Number(body.dealValue) || Number(body.monetaryValue) || 185000,
      depositAmount: Number(body.depositAmount) || 2500,
      depositStatus: body.depositStatus || 'PAID',
      assignedRep: body.assignedRep || 'Scott Pierpont',
      assignedRepEmail: body.assignedRepEmail || 'scott@easyhomesource.com',
      lender: body.lender || '21st Mortgage',
      loanStatus: body.loanStatus || 'APPROVED',
      homeModel: body.homeModel || 'Move on Up (3b/2ba)',
      manufacturer: body.manufacturer || 'Clayton Addison',
      series: body.series || 'Tempo Series',
      bedrooms: Number(body.bedrooms) || 3,
      bathrooms: Number(body.bathrooms) || 2,
      squareFeet: Number(body.squareFeet) || 1080,
      dimensions: body.dimensions || "18' x 60'",
      parcelNumber: body.parcelNumber || 'Verified PIN',
      lotSize: body.lotSize || '0.50 acres',
      zoning: body.zoning || 'Residential',
      powerProvider: body.powerProvider || 'Withlacoochee River Electric',
      waterType: body.waterType || 'WELL',
      sewerType: body.sewerType || 'SEPTIC',
      quoteId: body.quoteId,
      quoteNumber: body.quoteNumber,
      milestones: Array.isArray(body.milestones) && body.milestones.length > 0 ? body.milestones : [
        { name: 'GHL Opportunity Ingested', targetDate: new Date().toISOString().slice(0, 10), completedDate: new Date().toISOString().slice(0, 10), status: 'COMPLETED' },
        { name: 'Site Evaluation & Permitting', targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), status: 'IN_PROGRESS' },
        { name: 'Dirt Pad & Foundation', targetDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10), status: 'PENDING' },
        { name: 'Factory Delivery & Set', targetDate: new Date(Date.now() + 35 * 86400000).toISOString().slice(0, 10), status: 'PENDING' }
      ],
      ghlTags: Array.isArray(body.ghlTags) ? body.ghlTags : ['GHL Ingested', 'Project Pipeline'],
      notes: body.notes || 'Ingested from GoHighLevel project pipeline webhook.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryProjects = [newProject, ...inMemoryProjects];

    return NextResponse.json({
      success: true,
      project: newProject,
      message: 'Project created from GHL opportunity successfully.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to ingest GHL project' },
      { status: 500 }
    );
  }
}
