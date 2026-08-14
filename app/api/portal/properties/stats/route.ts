import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { calculatePropertyStatsFromList, fromBackendProperty } from '@/lib/properties/permanentProperty';

export async function GET(request: Request) {
  try {
    const backend = await permanentApiRequest(request, '/api/properties');
    const payload = await backend.json().catch(() => []);
    if (!backend.ok) {
      return NextResponse.json(
        { success: false, error: (payload as any)?.detail || 'Failed to compute statistics.' },
        { status: backend.status },
      );
    }
    if (!Array.isArray(payload)) {
      return NextResponse.json({ success: false, error: 'Permanent property API returned invalid data.' }, { status: 502 });
    }
    const properties = payload.map(fromBackendProperty);
    return NextResponse.json({ success: true, stats: calculatePropertyStatsFromList(properties) });
  } catch (error) {
    console.error('Failed to compute permanent property stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute statistics.' }, { status: 500 });
  }
}
