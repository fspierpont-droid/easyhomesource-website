import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendProperty, toBackendProperty } from '@/lib/properties/permanentProperty';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const backend = await permanentApiRequest(request, `/api/properties/${encodeURIComponent(params.id)}`);
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || `Property ${params.id} not found.` },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, property: fromBackendProperty(payload) });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    delete body._user;
    const backend = await permanentApiRequest(request, `/api/properties/${encodeURIComponent(params.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toBackendProperty(body)),
    });
    const payload = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      return NextResponse.json(
        { success: false, error: payload.detail || `Failed to update property ${params.id}.` },
        { status: backend.status },
      );
    }
    return NextResponse.json({ success: true, message: 'Property updated successfully.', property: fromBackendProperty(payload) });
  } catch (error) {
    console.error(`Failed to update property ${params.id}:`, error);
    return NextResponse.json({ success: false, error: 'Failed to update property.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const backend = await permanentApiRequest(request, `/api/properties/${encodeURIComponent(params.id)}`, { method: 'DELETE' });
  const payload = await backend.json().catch(() => ({}));
  if (!backend.ok) {
    return NextResponse.json(
      { success: false, error: payload.detail || `Failed to archive property ${params.id}.` },
      { status: backend.status },
    );
  }
  return NextResponse.json({ success: true, archived: Boolean(payload.archived), message: `Property ${params.id} archived.` });
}
