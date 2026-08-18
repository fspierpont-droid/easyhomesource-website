import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const backend = await permanentApiRequest(request, '/api/legacy-quotes');
  const payload = await backend.json().catch(() => ({}));

  if (!backend.ok) {
    return NextResponse.json(
      {
        success: false,
        backendStatus: backend.status,
        error: payload.detail || payload.error || 'Legacy quote archive request failed.',
      },
      { status: backend.status },
    );
  }

  const sync = payload?.sync && typeof payload.sync === 'object' ? payload.sync : {};
  const quotes = Array.isArray(payload?.quotes) ? payload.quotes : [];

  return NextResponse.json({
    success: true,
    sourceDatabase: sync.source_database ?? null,
    sourceCount: sync.source_count ?? null,
    syncedCount: sync.synced_count ?? null,
    skippedCount: sync.skipped_count ?? null,
    archiveCount: sync.archive_count ?? quotes.length,
    returnedQuoteCount: quotes.length,
    syncOk: sync.ok ?? null,
    syncError: sync.error ?? null,
    syncedAt: sync.synced_at ?? null,
  });
}
