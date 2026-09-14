import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

type ShareRouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  { params }: ShareRouteContext,
) {
  const { id } = await params;
  const quoteId = String(id || '').trim();

  if (!quoteId || quoteId.startsWith('legacy:')) {
    return NextResponse.json(
      { success: false, error: 'Historical quotes cannot be shared from the current quote system.' },
      { status: 400 },
    );
  }

  const backend = await permanentApiRequest(
    request,
    `/api/quotes/${encodeURIComponent(quoteId)}/share`,
    { method: 'POST' },
  );
  const payload = await backend.json().catch(() => ({}));

  if (!backend.ok) {
    return NextResponse.json(
      {
        success: false,
        error: payload.detail || 'Failed to create customer share link.',
      },
      { status: backend.status },
    );
  }

  return NextResponse.json({
    success: true,
    shareToken: payload.share_token,
    shareEnabled: Boolean(payload.share_enabled),
  });
}

export async function DELETE(
  request: Request,
  { params }: ShareRouteContext,
) {
  const { id } = await params;
  const quoteId = String(id || '').trim();

  if (!quoteId || quoteId.startsWith('legacy:')) {
    return NextResponse.json(
      { success: false, error: 'Historical quotes do not have current share links.' },
      { status: 400 },
    );
  }

  const backend = await permanentApiRequest(
    request,
    `/api/quotes/${encodeURIComponent(quoteId)}/share`,
    { method: 'DELETE' },
  );
  const payload = await backend.json().catch(() => ({}));

  if (!backend.ok) {
    return NextResponse.json(
      {
        success: false,
        error: payload.detail || 'Failed to disable customer share link.',
      },
      { status: backend.status },
    );
  }

  return NextResponse.json({
    success: true,
    shareEnabled: Boolean(payload.share_enabled),
  });
}
