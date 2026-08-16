import type { Property, PropertyStats, PropertyUtilityInfo } from '@/types/property';

type BackendProperty = Record<string, any>;

const asNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const asNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeUtilities = (value: unknown): PropertyUtilityInfo => {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    water: (typeof input.water === 'string' ? input.water : 'UNKNOWN') as PropertyUtilityInfo['water'],
    sewer: (typeof input.sewer === 'string' ? input.sewer : 'UNKNOWN') as PropertyUtilityInfo['sewer'],
    electric: (typeof input.electric === 'string' ? input.electric : 'UNKNOWN') as PropertyUtilityInfo['electric'],
  };
};

export function fromBackendProperty(document: BackendProperty): Property {
  return {
    id: String(document.id || ''),
    address: String(document.street || document.address || ''),
    city: String(document.city || ''),
    county: String(document.county || ''),
    state: String(document.state || 'FL'),
    zip: String(document.zip || ''),
    latitude: asNumber(document.latitude),
    longitude: asNumber(document.longitude),
    status: (document.status || 'STATUS_TO_CONFIRM') as Property['status'],
    propertyType: (document.property_type || document.propertyType || 'LAND') as Property['propertyType'],
    builder: document.builder ?? null,
    community: document.community ?? null,
    price: asNullableNumber(document.price ?? document.package_price ?? document.land_price),
    bedrooms: asNullableNumber(document.bedrooms),
    bathrooms: asNullableNumber(document.bathrooms),
    squareFeet: asNullableNumber(document.square_feet ?? document.squareFeet),
    lotSize: document.lot_size ?? document.lotSize ?? null,
    parcelNumber: document.parcel_number ?? document.parcelNumber ?? null,
    photos: Array.isArray(document.photos) ? document.photos.filter((item: unknown) => typeof item === 'string') : [],
    description: String(document.description || ''),
    salesperson: String(document.sales_rep || document.salesperson || 'Unassigned'),
    publicVisible: Boolean(document.public_visible ?? document.publicVisible),
    featured: Boolean(document.featured),
    notes: String(document.notes_public ?? document.notes ?? ''),
    internalNotes: String(document.notes_internal ?? document.internalNotes ?? ''),
    zoning: document.zoning ?? null,
    floodZone: document.flood_zone ?? document.floodZone ?? null,
    utilities: normalizeUtilities(document.utilities),
    history: Array.isArray(document.history) ? document.history : [],
    createdAt: String(document.created_at || document.createdAt || ''),
    updatedAt: String(document.updated_at || document.updatedAt || ''),
  };
}

export function toBackendProperty(property: Partial<Property>) {
  const payload: Record<string, unknown> = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) payload[key] = value;
  };

  assign('street', property.address);
  assign('city', property.city);
  assign('county', property.county);
  assign('state', property.state);
  assign('zip', property.zip);
  assign('latitude', property.latitude);
  assign('longitude', property.longitude);
  assign('status', property.status);
  assign('property_type', property.propertyType);
  assign('builder', property.builder);
  assign('community', property.community);
  assign('price', property.price);
  assign('bedrooms', property.bedrooms);
  assign('bathrooms', property.bathrooms);
  assign('square_feet', property.squareFeet);
  assign('lot_size', property.lotSize);
  assign('parcel_number', property.parcelNumber);
  assign('photos', property.photos);
  assign('description', property.description);
  assign('sales_rep', property.salesperson);
  assign('public_visible', property.publicVisible);
  assign('featured', property.featured);
  assign('notes_public', property.notes);
  assign('notes_internal', property.internalNotes);
  assign('zoning', property.zoning);
  assign('flood_zone', property.floodZone);
  assign('utilities', property.utilities);

  return payload;
}

export function calculatePropertyStatsFromList(properties: Property[]): PropertyStats {
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

  let pricedCount = 0;
  let priceSum = 0;
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
      pricedCount += 1;
      priceSum += property.price;
      if (property.status === 'AVAILABLE') stats.totalActiveValue += property.price;
      if (['AVAILABLE', 'COMING_SOON', 'UNDER_CONTRACT'].includes(property.status)) stats.totalPipelineValue += property.price;
    }

    const county = property.county ? `${property.county} County` : 'Unassigned';
    stats.byCounty[county] = (stats.byCounty[county] || 0) + 1;
    const builder = property.builder || 'Unassigned / Land';
    stats.byBuilder[builder] = (stats.byBuilder[builder] || 0) + 1;
    stats.byType[property.propertyType] = (stats.byType[property.propertyType] || 0) + 1;
  }

  stats.averagePrice = pricedCount ? Math.round(priceSum / pricedCount) : 0;
  return stats;
}
