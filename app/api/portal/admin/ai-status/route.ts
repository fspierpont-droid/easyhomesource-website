import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';

export async function GET(request: Request) {
  const sessionCheck = await permanentApiRequest(request, '/api/auth/me');
  const user = await sessionCheck.json().catch(() => ({}));
  if (!sessionCheck.ok) {
    return NextResponse.json(
      { success: false, error: user.detail || 'Authentication required.' },
      { status: sessionCheck.status },
    );
  }

  const role = String(user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ success: false, error: 'Management access required.' }, { status: 403 });
  }

  const configured = Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() && process.env.CLOUDFLARE_AI_API_TOKEN?.trim(),
  );

  return NextResponse.json({
    success: true,
    provider: 'Cloudflare Workers AI',
    model: process.env.EHS_CHAT_MODEL?.trim() || '@cf/qwen/qwen3-30b-a3b-fp8',
    configured,
    paidFallbackEnabled: false,
  });
}
