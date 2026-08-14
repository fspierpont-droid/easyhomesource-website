import { NextResponse } from 'next/server';
import { permanentPublicApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendProperty } from '@/lib/properties/permanentProperty';

export async function GET() {
  try {
    const backend = await permanentPublicApiRequest('/api/properties/public');
    const payload = await backend.json().catch(() => []);
    if (!backend.ok) {
      return NextResponse.json(
        { success: false, error: (payload as any)?.detail || 'Failed to fetch public property inventory' },
        { status: backend.status },
      );
    }
    if (!Array.isArray(payload)) {
      return NextResponse.json({ success: false, error: 'Permanent property API returned invalid data.' }, { status: 502 });
    }
    const properties = payload.map(fromBackendProperty);
    return NextResponse.json({ success: true, count: properties.length, properties });
  } catch (error) {
    console.error('Failed to fetch public property inventory:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch public property inventory' }, { status: 500 });
  }
}
