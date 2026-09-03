import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

type PermitJobRouteContext = { params: Promise<{ jobId: string }> };

async function respond(backend: Response) {
  const payload = await backend.json().catch(() => ({}));
  return NextResponse.json(payload, { status: backend.status });
}

export async function PATCH(request: Request, { params }: PermitJobRouteContext) {
  const { jobId } = await params;
  const payload = await request.json().catch(() => ({}));
  return respond(await permanentApiRequest(
    request,
    `/api/permitting/jobs/${encodeURIComponent(jobId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  ));
}

export async function DELETE(request: Request, { params }: PermitJobRouteContext) {
  const { jobId } = await params;
  return respond(await permanentApiRequest(
    request,
    `/api/permitting/jobs/${encodeURIComponent(jobId)}`,
    { method: 'DELETE' },
  ));
}
