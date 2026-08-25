import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } },
) {
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(params.id)}/documents/${encodeURIComponent(params.documentId)}/download`,
  );

  if (!backend.ok) {
    const payload = await backend.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to view inventory document.' },
      { status: backend.status },
    );
  }

  const body = await backend.arrayBuffer();
  const headers = new Headers();
  headers.set('Content-Type', backend.headers.get('content-type') || 'application/pdf');

  const backendDisposition = backend.headers.get('content-disposition') || 'attachment; filename="document.pdf"';
  headers.set('Content-Disposition', backendDisposition.replace(/^attachment/i, 'inline'));
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');

  const contentLength = backend.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);

  return new NextResponse(body, { status: 200, headers });
}
