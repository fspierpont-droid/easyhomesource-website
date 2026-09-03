import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

async function respond(backend: Response) {
  const payload = await backend.json().catch(() => ({}));
  return NextResponse.json(payload, { status: backend.status });
}

export async function GET(request: Request) {
  return respond(await permanentApiRequest(request, '/api/permitting/jobs'));
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return respond(await permanentApiRequest(request, '/api/permitting/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}
