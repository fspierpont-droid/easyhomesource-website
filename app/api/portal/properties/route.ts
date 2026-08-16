import { NextResponse } from 'next/server';
import { permanentApiRequest } from '@/lib/auth/permanentApi';
import { fromBackendProperty, toBackendProperty } from '@/lib/properties/permanentProperty';
import type { PropertyStatus, PropertyType } from '@/types/property';

export async function GET(request: Request) {
  try {
    const backend = await permanentApiRequest(request, '/api/properties');
    if (!backend.ok) {
      const error = await backend.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: error.detail || 'Failed to retrieve properties' },
        { status: backend.status },
      );
    }

    const documents = await backend.json();
    if (!Array.isArray(documents)) {
      return NextResponse.json({ success: false, error: 'Permanent property API returned invalid data.' }, { status: 502 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const status = searchParams.get('status') as PropertyStatus | null;
    const propertyType = searchParams.get('propertyType') as PropertyType | null;
    const county = searchParams.get('county');
    const builder = searchParams.get('builder');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let list = documents.map(fromBackendProperty);

    if (search) {
      list = list.filter((property) => [
        property.address,
        property.city,
        property.county,
        property.zip,
        property.parcelNumber,
        property.builder,
        property.community,
        property.notes,
        property.internalNotes,
        property.salesperson,
      ].filter(Boolean).join(' ').toLowerCase().includes(search));
    }
    if (status && status !== ('ALL' as PropertyStatus)) list = list.filter((property) => property.status === status);
    if (propertyType && propertyType !== ('ALL' as PropertyType)) list = list.filter((property) => property.propertyType === propertyType);
    if (county && county !== 'ALL') list = list.filter((property) => property.county.toLowerCase() === county.toLowerCase());
    if (builder && builder !== 'ALL') list = list.filter((property) => (property.builder || '').toLowerCase().includes(builder.toLowerCase()));

    list.sort((left, right) => {
      const a = sortBy === 'price' ? left.price ?? -1 : (left as any)[sortBy];
      const b = sortBy === 'price' ? right.price ?? -1 : (right as any)[sortBy];
      if (a === b) return 0;
      if (a == null) return 1;
      if (b == null) return -1;
      const result = a > b ? 1 : -1;
      return sortOrder === 'asc' ? result : -result;
    });

    return NextResponse.json({ success: true, count: list.length, properties: list });
  } catch (error) {
    console.error('Failed to fetch permanent properties:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve properties' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.address || !body.city) {
      return NextResponse.json({ success: false, error: 'Address and City are required fields.' }, { status: 400 });
    }

    const backend = await permanentApiRequest(request, '/api/properties', {
      method: 'POST',
      body: JSON.stringify(toBackendProperty(body)),
    });
    const payload = await backend.json().catch(() => ({}));
    if (!backend.ok) {
      return NextResponse.json(
        { success: false, error: payload.detail || 'Failed to create property' },
        { status: backend.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property created successfully in Property Center.',
      property: fromBackendProperty(payload),
    });
  } catch (error) {
    console.error('Failed to create permanent property:', error);
    return NextResponse.json({ success: false, error: 'Failed to create property' }, { status: 500 });
  }
}
