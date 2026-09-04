import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}/documents`,
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to retrieve inventory documents.' },
      { status: backend.status },
    );
  }
  if (!Array.isArray(payload)) {
    return NextResponse.json(
      { success: false, error: 'Permanent inventory document API returned invalid data.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ success: true, documents: payload });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const filename = request.headers.get('x-filename');
  if (!category || !filename) {
    return NextResponse.json(
      { success: false, error: 'Document category and filename are required.' },
      { status: 400 },
    );
  }

  const body = await request.arrayBuffer();
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}/documents?category=${encodeURIComponent(category)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf',
        'X-Filename': decodeURIComponent(filename),
      },
      body,
    },
  );
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to upload inventory document.' },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, document: payload }, { status: 201 });
}
