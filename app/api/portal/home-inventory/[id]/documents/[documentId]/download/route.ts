import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { id, documentId } = await params;
  const backend = await permanentApiRequest(
    request,
    `/api/home-inventory/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}/download`,
  );

  if (!backend.ok) {
    const payload = await backend.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, error: payload.detail || 'Unable to download inventory document.' },
      { status: backend.status },
    );
  }

  const body = await backend.arrayBuffer();
  const headers = new Headers();
  headers.set('Content-Type', backend.headers.get('content-type') || 'application/pdf');
  headers.set('Content-Disposition', backend.headers.get('content-disposition') || 'attachment; filename="document.pdf"');
  headers.set('Cache-Control', 'private, no-store');
  const contentLength = backend.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);

  return new NextResponse(body, { status: 200, headers });
}
