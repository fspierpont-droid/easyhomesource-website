import { NextResponse } from 'next/server';
import { PORTAL_STAGE_TO_GHL } from '@/app/api/portal/projects/ghl-sync/route';
import type { ProjectStage } from '@/types/project';

const GHL_API_TOKEN = process.env.GHL_API_KEY || 'pit-3339427e-f798-4d08-9ecb-bb5f852747dd';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ghlOpportunityId, newStage } = body as {
      ghlOpportunityId: string;
      newStage: ProjectStage;
    };

    if (!ghlOpportunityId || !newStage) {
      return NextResponse.json({ success: false, error: 'Missing ghlOpportunityId or newStage' }, { status: 400 });
    }

    const ghlStageId = PORTAL_STAGE_TO_GHL[newStage];
    if (!ghlStageId) {
      return NextResponse.json({ success: false, error: `Invalid stage: ${newStage}` }, { status: 400 });
    }

    // Call GoHighLevel API to update stage
    const ghlRes = await fetch(`https://services.leadconnectorhq.com/opportunities/${ghlOpportunityId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GHL_API_TOKEN}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        pipelineStageId: ghlStageId
      })
    });

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      throw new Error(`GHL stage update failed (${ghlRes.status}): ${errText}`);
    }

    const resData = await ghlRes.json();

    return NextResponse.json({
      success: true,
      ghlOpportunityId,
      newStage,
      ghlStageId,
      response: resData,
      message: `Successfully updated opportunity stage in GoHighLevel to ${newStage}`
    });
  } catch (err: any) {
    console.error('Failed to update stage in GHL:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Stage update failed in GHL' },
      { status: 500 }
    );
  }
}
