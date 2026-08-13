import { NextResponse } from 'next/server';
import { PORTAL_STAGE_TO_GHL } from '@/app/api/portal/projects/ghl-sync/route';
import { ghlRequest } from '@/lib/ghl/client';
import type { ProjectStage } from '@/types/project';

export async function POST(request: Request) {
  try {
    const { ghlOpportunityId, newStage } = await request.json() as { ghlOpportunityId?: string; newStage?: ProjectStage };
    const ghlStageId = newStage ? PORTAL_STAGE_TO_GHL[newStage] : undefined;
    if (!ghlOpportunityId || !newStage || !ghlStageId) return NextResponse.json({ success: false, error: 'A valid GHL opportunity and stage are required.' }, { status: 400 });
    const response = await ghlRequest(`/opportunities/${encodeURIComponent(ghlOpportunityId)}`, { method: 'PUT', body: JSON.stringify({ pipelineStageId: ghlStageId }) });
    return NextResponse.json({ success: true, ghlOpportunityId, newStage, ghlStageId, response });
  } catch (error) {
    console.error('Failed to update stage in GHL:', error);
    return NextResponse.json({ success: false, error: 'GHL did not save the stage. The prior value was preserved; check the connection and retry.' }, { status: 502 });
  }
}
