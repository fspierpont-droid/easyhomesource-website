import type { Property, PropertyAuditLog, PropertyStats } from '@/types/property';

/**
 * Compatibility-only browser/server fallback.
 *
 * Runtime property authority is now the permanent Mongo-backed EHS API. We
 * intentionally start this compatibility store empty so unverified prototype
 * parcels can never appear as operational inventory when the API is empty or
 * temporarily unavailable.
 */
export const INITIAL_PROPERTIES: Property[] = [];
let propertyStore: Property[] = [];

export function getAllProperties(): Property[] {
  return [...propertyStore];
}

export function getPublicProperties(): Property[] {
  return propertyStore.filter((property) => property.publicVisible);
}

export function getPropertyById(id: string): Property | undefined {
  return propertyStore.find((property) => property.id === id);
}

export function formatPropertyAddress(property?: Property | null): string {
  if (!property) return 'Unspecified Address';
  return [property.address, property.city, property.state, property.zip]
    .filter(Boolean)
    .join(', ');
}

export function createProperty(
  data: Partial<Property>,
  user = 'Portal Admin',
): Property {
  const now = new Date().toISOString();
  const property: Property = {
    id: data.id || `local-${Date.now()}`,
    address: data.address || '',
    city: data.city || '',
    county: data.county || '',
    state: data.state || 'FL',
    zip: data.zip || '',
    latitude: Number(data.latitude) || 0,
    longitude: Number(data.longitude) || 0,
    status: data.status || 'STATUS_TO_CONFIRM',
    propertyType: data.propertyType || 'LAND',
    builder: data.builder ?? null,
    community: data.community ?? null,
    price: data.price ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    squareFeet: data.squareFeet ?? null,
    lotSize: data.lotSize ?? null,
    parcelNumber: data.parcelNumber ?? null,
    photos: Array.isArray(data.photos) ? data.photos : [],
    description: data.description || '',
    salesperson: data.salesperson || 'Unassigned',
    publicVisible: data.publicVisible ?? false,
    featured: data.featured ?? false,
    notes: data.notes || '',
    internalNotes: data.internalNotes || '',
    zoning: data.zoning ?? null,
    floodZone: data.floodZone ?? null,
    utilities: data.utilities || { water: 'UNKNOWN', sewer: 'UNKNOWN', electric: 'UNKNOWN' },
    history: [{ id: `log-${Date.now()}`, timestamp: now, user, action: 'Local compatibility record created' }],
    createdAt: now,
    updatedAt: now,
  };
  propertyStore = [property, ...propertyStore];
  return property;
}

export function updateProperty(
  id: string,
  updates: Partial<Property>,
  user = 'Portal Admin',
): Property | null {
  const index = propertyStore.findIndex((property) => property.id === id);
  if (index < 0) return null;
  const current = propertyStore[index];
  const now = new Date().toISOString();
  const history: PropertyAuditLog[] = [
    { id: `log-${Date.now()}`, timestamp: now, user, action: 'Local compatibility record updated' },
    ...(current.history || []),
  ];
  const updated = { ...current, ...updates, id: current.id, history, updatedAt: now };
  propertyStore[index] = updated;
  return updated;
}

export function deleteProperty(id: string): boolean {
  const before = propertyStore.length;
  propertyStore = propertyStore.filter((property) => property.id !== id);
  return propertyStore.length !== before;
}

export function calculatePropertyStats(properties: Property[] = propertyStore): PropertyStats {
  const stats: PropertyStats = {
    totalProperties: properties.length,
    available: 0,
    comingSoon: 0,
    underContract: 0,
    sold: 0,
    statusToConfirm: 0,
    availableHomes: 0,
    availableLots: 0,
    totalActiveValue: 0,
    totalPipelineValue: 0,
    averagePrice: 0,
    byCounty: {},
    byBuilder: {},
    byType: {},
    updatedAt: new Date().toISOString(),
  };

  let totalPrice = 0;
  let pricedCount = 0;
  for (const property of properties) {
    if (property.status === 'AVAILABLE') stats.available += 1;
    else if (property.status === 'COMING_SOON') stats.comingSoon += 1;
    else if (property.status === 'UNDER_CONTRACT') stats.underContract += 1;
    else if (property.status === 'SOLD') stats.sold += 1;
    else stats.statusToConfirm += 1;

    if (property.status === 'AVAILABLE') {
      if (['HOME', 'SPEC_HOME', 'MODEL'].includes(property.propertyType)) stats.availableHomes += 1;
      if (['LAND', 'LAND_HOME_PACKAGE'].includes(property.propertyType)) stats.availableLots += 1;
    }

    if (property.price != null && Number.isFinite(property.price) && property.price > 0) {
      totalPrice += property.price;
      pricedCount += 1;
      if (property.status === 'AVAILABLE') stats.totalActiveValue += property.price;
      if (['AVAILABLE', 'COMING_SOON', 'UNDER_CONTRACT'].includes(property.status)) stats.totalPipelineValue += property.price;
    }

    const county = property.county ? `${property.county} County` : 'Unassigned';
    stats.byCounty[county] = (stats.byCounty[county] || 0) + 1;
    const builder = property.builder || 'Unassigned / Land';
    stats.byBuilder[builder] = (stats.byBuilder[builder] || 0) + 1;
    stats.byType[property.propertyType] = (stats.byType[property.propertyType] || 0) + 1;
  }

  stats.averagePrice = pricedCount ? Math.round(totalPrice / pricedCount) : 0;
  return stats;
}
