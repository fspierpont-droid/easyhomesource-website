import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

type PermitEventsRouteContext = { params: Promise<{ jobId: string }> };

export async function GET(request: Request, { params }: PermitEventsRouteContext) {
  const { jobId } = await params;
  const backend = await permanentApiRequest(
    request,
    `/api/permitting/jobs/${encodeURIComponent(jobId)}/events`,
  );
  const payload = await backend.json().catch(() => ([]));
  return NextResponse.json(payload, { status: backend.status });
}
