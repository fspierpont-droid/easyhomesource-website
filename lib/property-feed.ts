import {
  properties as fallbackProperties,
  type PropertyRecord,
  type PropertyStatus,
  type PropertyType
} from "@/data/properties";

const PROPERTY_STATUSES = new Set<PropertyStatus>([
  "Available Now",
  "Coming Soon / In Progress",
  "Under Contract / Sold",
  "Status to Confirm"
]);

const PROPERTY_TYPES = new Set<PropertyType>([
  "Finished Home",
  "Home in Progress",
  "Vacant Lot / Land",
  "Unknown"
]);

type PublicPropertyApiRecord = {
  id?: unknown;
  street?: unknown;
  city?: unknown;
  state?: unknown;
  zip?: unknown;
  status?: unknown;
  property_type?: unknown;
  units?: unknown;
  package_price?: unknown;
  notes_public?: unknown;
  display_order?: unknown;
  updated_at?: unknown;
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function mapPublicProperty(record: PublicPropertyApiRecord, index: number): PropertyRecord | null {
  const id = text(record.id).trim();
  const street = text(record.street).trim();
  if (!id || !street) return null;

  const rawStatus = text(record.status);
  const rawType = text(record.property_type);
  const status: PropertyStatus = PROPERTY_STATUSES.has(rawStatus as PropertyStatus)
    ? (rawStatus as PropertyStatus)
    : "Status to Confirm";
  const propertyType: PropertyType = PROPERTY_TYPES.has(rawType as PropertyType)
    ? (rawType as PropertyType)
    : "Unknown";
  const parsedUnits = Number.parseInt(String(record.units ?? 1), 10);
  const parsedOrder = Number.parseInt(String(record.display_order ?? index + 1), 10);

  return {
    id,
    street,
    city: text(record.city).trim(),
    state: text(record.state, "FL").trim() || "FL",
    zip: text(record.zip).trim(),
    status,
    propertyType,
    units: Number.isFinite(parsedUnits) && parsedUnits > 0 ? parsedUnits : 1,
    price: numberOrNull(record.package_price),
    salesRep: "Easy HomeSource",
    notes: text(record.notes_public).trim(),
    source: "EHS Property Package Manager",
    updatedAt: text(record.updated_at, new Date(0).toISOString()),
    displayOrder: Number.isFinite(parsedOrder) && parsedOrder >= 0 ? parsedOrder : index + 1,
    publicVisible: true
  };
}

export async function getPublicPropertyFeed(): Promise<PropertyRecord[]> {
  const fallback = fallbackProperties.filter((property) => property.publicVisible);
  const backendUrl = (
    process.env.EHS_BACKEND_URL ||
    process.env.NEXT_PUBLIC_EHS_BACKEND_URL ||
    "https://ehs-api-staging.onrender.com"
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(`${backendUrl}/api/properties/public`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Property feed returned ${response.status}`);

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Property feed was not an array");

    const mapped = payload
      .map((record, index) => mapPublicProperty(record as PublicPropertyApiRecord, index))
      .filter((property): property is PropertyRecord => Boolean(property));

    if (payload.length > 0 && mapped.length === 0) {
      throw new Error("Property feed contained no valid records");
    }

    return mapped;
  } catch {
    return fallback;
  }
}
