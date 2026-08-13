import { NextResponse } from 'next/server';

/** @deprecated Portal CRM projections are fetched from /projects/ghl-sync. */
export async function GET() {
  return NextResponse.json({ success: false, error: 'Use the GHL-backed project sync endpoint.' }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ success: false, error: 'Unverified project ingestion is disabled. Configure the authenticated GHL webhook endpoint.' }, { status: 410 });
}
