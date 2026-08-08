import type {
  Property,
  PropertyStatus,
  PropertyType,
  PropertyStats,
  PropertyAuditLog
} from "@/types/property";

// Single Source of Truth Seed Properties for Easy Home Source
// Note: Photos are only attached when 100% verified to be the exact real house/parcel.
export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "EHS-001",
    address: "6645 W Erlen Ln",
    city: "Homosassa",
    county: "Citrus",
    state: "FL",
    zip: "34446",
    latitude: 28.7885,
    longitude: -82.5932,
    status: "AVAILABLE",
    propertyType: "HOME",
    builder: "Cavco Plant City",
    community: "Erlen Groves",
    price: 189900,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1140,
    lotSize: "0.46 acres",
    parcelNumber: "18E-19S-24-0010-0040",
    photos: [],
    description: "Move-in ready finished manufactured home on private homesite in Homosassa. Turnkey package with well, septic, and A/C installed.",
    salesperson: "Scott Pierpont",
    publicVisible: true,
    featured: true,
    notes: "Finished home, ready on market. Keys in lockbox at Brooksville office.",
    internalNotes: "Zoning is R-1M Citrus County. Certificate of Occupancy approved July 2026.",
    zoning: "R-1M Residential",
    floodZone: "Zone X (Minimal Risk)",
    utilities: { water: "WELL", sewer: "SEPTIC", electric: "WITHLACOOCHEE" },
    history: [
      {
        id: "log-1",
        timestamp: "2026-08-01T14:30:00Z",
        user: "System Admin",
        action: "Property Created",
        newValue: "Initial setup from operational inventory"
      }
    ],
    createdAt: "2026-08-01T14:30:00Z",
    updatedAt: "2026-08-07T03:15:00Z"
  },
  {
    id: "EHS-002",
    address: "3219 Welsh St",
    city: "Spring Hill",
    county: "Hernando",
    state: "FL",
    zip: "34606",
    latitude: 28.4828,
    longitude: -82.6073,
    status: "AVAILABLE",
    propertyType: "HOME",
    builder: "Clayton TRU",
    community: "Spring Hill Pines",
    price: 174900,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 900,
    lotSize: "0.33 acres",
    parcelNumber: "R32-323-17-5110-0680-0190",
    photos: [],
    description: "Charming 2-bed, 2-bath turnkey home in desirable Spring Hill location. Split floor plan with open kitchen.",
    salesperson: "Alex Vorasane",
    publicVisible: true,
    featured: true,
    notes: "Finished home, ready for immediate occupancy.",
    internalNotes: "Hernando County impact fees paid in full. Power connected via Withlacoochee River Electric.",
    zoning: "R-1C Mobile Permitted",
    floodZone: "Zone X",
    utilities: { water: "MUNICIPAL", sewer: "MUNICIPAL", electric: "WITHLACOOCHEE" },
    history: [
      {
        id: "log-2",
        timestamp: "2026-08-02T10:15:00Z",
        user: "System Admin",
        action: "Property Created"
      }
    ],
    createdAt: "2026-08-02T10:15:00Z",
    updatedAt: "2026-08-07T03:00:00Z"
  },
  {
    id: "EHS-003",
    address: "18810 St Paul Dr",
    city: "Spring Hill",
    county: "Hernando",
    state: "FL",
    zip: "34610",
    latitude: 28.4215,
    longitude: -82.5298,
    status: "AVAILABLE",
    propertyType: "HOME",
    builder: "Legacy Housing",
    community: "St. Paul Acreage",
    price: 199900,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1068,
    lotSize: "0.50 acres",
    parcelNumber: "R18-223-18-0000-0140-0010",
    photos: [],
    description: "Spacious 3-bed home on high-and-dry half-acre lot near Pasco/Hernando county line.",
    salesperson: "CJ Cornett",
    publicVisible: true,
    featured: false,
    notes: "Finished home, active for showings.",
    internalNotes: "Well pump tested at 25 GPM. New septic drain field inspected.",
    zoning: "AG / Rural Residential",
    floodZone: "Zone X",
    utilities: { water: "WELL", sewer: "SEPTIC", electric: "DUKE" },
    history: [
      {
        id: "log-3",
        timestamp: "2026-08-02T11:00:00Z",
        user: "System Admin",
        action: "Property Created"
      }
    ],
    createdAt: "2026-08-02T11:00:00Z",
    updatedAt: "2026-08-07T02:45:00Z"
  },
  {
    id: "EHS-004",
    address: "7112 Fitzpatrick Ave",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34613",
    latitude: 28.5553,
    longitude: -82.4921,
    status: "AVAILABLE",
    propertyType: "LAND",
    builder: null,
    community: "Fitzpatrick Oaks",
    price: 49900,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.48 acres",
    parcelNumber: "R04-222-19-1940-0000-0180",
    photos: [],
    description: "Build-ready vacant lot zoned for manufactured homes. Flat topography with mature oak perimeter.",
    salesperson: "Scott Pierpont",
    publicVisible: true,
    featured: false,
    notes: "Vacant lot ready for custom home order and installation.",
    internalNotes: "Boundary survey completed. Setback requirements: 25ft front, 10ft side.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "NEEDS_WELL", sewer: "NEEDS_SEPTIC", electric: "AT_ROAD" },
    history: [
      {
        id: "log-4",
        timestamp: "2026-08-03T09:00:00Z",
        user: "System Admin",
        action: "Property Created"
      }
    ],
    createdAt: "2026-08-03T09:00:00Z",
    updatedAt: "2026-08-06T18:00:00Z"
  },
  {
    id: "EHS-005",
    address: "9248 Denmarsh Dr",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34613",
    latitude: 28.5612,
    longitude: -82.5104,
    status: "AVAILABLE",
    propertyType: "LAND",
    builder: null,
    community: "Denmarsh Woods",
    price: 47500,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.52 acres",
    parcelNumber: "R05-222-19-1940-0020-0040",
    photos: [],
    description: "Vacant half-acre lot ready for home setup. Paired with adjacent 9254 Denmarsh for multi-unit potential.",
    salesperson: "CJ Cornett",
    publicVisible: true,
    featured: false,
    notes: "Vacant lot",
    internalNotes: "Can be sold separately or bundled as a dual-lot builder package.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "NEEDS_WELL", sewer: "NEEDS_SEPTIC", electric: "AT_ROAD" },
    history: [],
    createdAt: "2026-08-03T09:30:00Z",
    updatedAt: "2026-08-06T18:00:00Z"
  },
  {
    id: "EHS-006",
    address: "9254 Denmarsh Dr",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34613",
    latitude: 28.5616,
    longitude: -82.5098,
    status: "AVAILABLE",
    propertyType: "LAND",
    builder: null,
    community: "Denmarsh Woods",
    price: 47500,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.52 acres",
    parcelNumber: "R05-222-19-1940-0020-0050",
    photos: [],
    description: "Adjacent vacant lot in Denmarsh Woods. Cleared front pad with easy driveway access.",
    salesperson: "CJ Cornett",
    publicVisible: true,
    featured: false,
    notes: "Vacant lot",
    internalNotes: "Owner open to land-and-home financing packages.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "NEEDS_WELL", sewer: "NEEDS_SEPTIC", electric: "AT_ROAD" },
    history: [],
    createdAt: "2026-08-03T09:35:00Z",
    updatedAt: "2026-08-06T18:00:00Z"
  },
  {
    id: "EHS-007",
    address: "9868 Lake Dr",
    city: "Spring Hill",
    county: "Hernando",
    state: "FL",
    zip: "34613",
    latitude: 28.5201,
    longitude: -82.5442,
    status: "AVAILABLE",
    propertyType: "LAND",
    builder: null,
    community: "Lake Shore Estates",
    price: 54900,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.60 acres",
    parcelNumber: "R07-223-18-3520-0010-0110",
    photos: [],
    description: "Scenic 0.60-acre parcel on quiet paved street. Suitable for double-wide or modular home.",
    salesperson: "Alex Vorasane",
    publicVisible: true,
    featured: false,
    notes: "Vacant lot",
    internalNotes: "Soil boring test completed: clean sand foundation conditions.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "NEEDS_WELL", sewer: "NEEDS_SEPTIC", electric: "CONNECTED" },
    history: [],
    createdAt: "2026-08-03T10:00:00Z",
    updatedAt: "2026-08-06T18:00:00Z"
  },
  {
    id: "EHS-008",
    address: "9862 Lake Dr",
    city: "Spring Hill",
    county: "Hernando",
    state: "FL",
    zip: "34446",
    latitude: 28.5195,
    longitude: -82.5446,
    status: "AVAILABLE",
    propertyType: "LAND",
    builder: null,
    community: "Lake Shore Estates",
    price: 54900,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.58 acres",
    parcelNumber: "R07-223-18-3520-0010-0120",
    photos: [],
    description: "Prime vacant lot in Lake Shore area. Electric at street.",
    salesperson: "Alex Vorasane",
    publicVisible: true,
    featured: false,
    notes: "Vacant lot",
    internalNotes: "Cleared center building pad.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "NEEDS_WELL", sewer: "NEEDS_SEPTIC", electric: "AT_ROAD" },
    history: [],
    createdAt: "2026-08-03T10:05:00Z",
    updatedAt: "2026-08-06T18:00:00Z"
  },
  {
    id: "EHS-009",
    address: "5043 Southtowne Loop",
    city: "New Port Richey",
    county: "Pasco",
    state: "FL",
    zip: "34652",
    latitude: 28.2439,
    longitude: -82.7193,
    status: "AVAILABLE",
    propertyType: "LAND_HOME_PACKAGE",
    builder: "Palm Harbor",
    community: "Southtowne Multi-Site",
    price: 685000,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "15 lots on-stilts",
    parcelNumber: "PAS-33-26-16-0040-0010-0150",
    photos: [],
    description: "Institutional developer package: 15 on-stilts coastal home lots in New Port Richey. Ideal for builder staging.",
    salesperson: "Scott Pierpont",
    publicVisible: true,
    featured: true,
    notes: "15 on-stilts vacant lots with bulk utility development approval.",
    internalNotes: "Coastal foundation engineered drawings completed. Pasco County site plan active.",
    zoning: "MF-1 Coastal Stilt Permitted",
    floodZone: "Zone AE (Engineered Stilt Foundation)",
    utilities: { water: "MUNICIPAL", sewer: "MUNICIPAL", electric: "DUKE" },
    history: [],
    createdAt: "2026-08-03T14:00:00Z",
    updatedAt: "2026-08-07T01:00:00Z"
  },
  {
    id: "EHS-010",
    address: "1295 S Rock Crusher Rd",
    city: "Homosassa",
    county: "Citrus",
    state: "FL",
    zip: "34448",
    latitude: 28.8462,
    longitude: -82.5276,
    status: "AVAILABLE",
    propertyType: "LAND_HOME_PACKAGE",
    builder: "Cavco / Timber Creek",
    community: "Rock Crusher Subdivision",
    price: 1150000,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "23 lots / 0.5-acre sites",
    parcelNumber: "19E-18S-12-0000-0010",
    photos: [],
    description: "Major 23-lot subdivision project in Citrus County. Engineered for turnkey land-and-home customer builds.",
    salesperson: "Scott Pierpont",
    publicVisible: true,
    featured: true,
    notes: "23 vacant lots; approximately half-acre home sites with master stormwater management.",
    internalNotes: "Preliminary plat approved. Sizing quotes requested from Timber Creek and Cavco.",
    zoning: "PDR Master Planned",
    floodZone: "Zone X",
    utilities: { water: "MUNICIPAL", sewer: "NEEDS_SEPTIC", electric: "WITHLACOOCHEE" },
    history: [],
    createdAt: "2026-08-03T15:00:00Z",
    updatedAt: "2026-08-07T01:15:00Z"
  },
  {
    id: "EHS-011",
    address: "26007 Shangri Dr",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34601",
    latitude: 28.5281,
    longitude: -82.3842,
    status: "COMING_SOON",
    propertyType: "SPEC_HOME",
    builder: "Clayton Addison",
    community: "Shangri-La Estates",
    price: 214900,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1394,
    lotSize: "0.75 acres",
    parcelNumber: "R11-222-19-0000-0320-0010",
    photos: [],
    description: "New 3-bed craftsman spec home currently in setup stage. Expected move-in readiness within 60 days.",
    salesperson: "CJ Cornett",
    publicVisible: true,
    featured: true,
    notes: "Home in progress; expected to be ready in a few months.",
    internalNotes: "Concrete piers set. Tie-down inspection scheduled for next Tuesday.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "WELL", sewer: "SEPTIC", electric: "WITHLACOOCHEE" },
    history: [
      {
        id: "log-11",
        timestamp: "2026-08-04T08:00:00Z",
        user: "Field Ops",
        action: "Status set to COMING_SOON"
      }
    ],
    createdAt: "2026-08-04T08:00:00Z",
    updatedAt: "2026-08-07T02:00:00Z"
  },
  {
    id: "EHS-012",
    address: "26314 Glenwood Dr",
    city: "Zephyrhills",
    county: "Pasco",
    state: "FL",
    zip: "33544",
    latitude: 28.2384,
    longitude: -82.1794,
    status: "COMING_SOON",
    propertyType: "SPEC_HOME",
    builder: "Timber Creek",
    community: "Glenwood Country",
    price: 198500,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1264,
    lotSize: "0.50 acres",
    parcelNumber: "PAS-14-26-21-0020-0000-0440",
    photos: [],
    description: "Fully renovated and modern spec home in Zephyrhills with new deck, skirting, and modern roof.",
    salesperson: "Alex Vorasane",
    publicVisible: true,
    featured: false,
    notes: "Flip/stick home; finish trades active on drywall and vinyl plank flooring.",
    internalNotes: "Interior paint 80% complete. Appliances arriving next week.",
    zoning: "R-1MH",
    floodZone: "Zone X",
    utilities: { water: "MUNICIPAL", sewer: "SEPTIC", electric: "DUKE" },
    history: [],
    createdAt: "2026-08-04T08:30:00Z",
    updatedAt: "2026-08-06T16:00:00Z"
  },
  {
    id: "EHS-013",
    address: "18034 Ferry Ave",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34604",
    latitude: 28.4715,
    longitude: -82.4411,
    status: "UNDER_CONTRACT",
    propertyType: "SPEC_HOME",
    builder: "Legacy Housing",
    community: "Ferry Road Farms",
    price: 184900,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1080,
    lotSize: "1.00 acres",
    parcelNumber: "R13-223-19-0000-0190-0020",
    photos: [],
    description: "Turnkey 3-bed home on full acre lot under contract with approved FHA buyer.",
    salesperson: "Scott Pierpont",
    publicVisible: true,
    featured: false,
    notes: "Under contract. Lender appraisal completed.",
    internalNotes: "Closing targeted for end of August. Escrow deposit received.",
    zoning: "AG-1",
    floodZone: "Zone X",
    utilities: { water: "WELL", sewer: "SEPTIC", electric: "WITHLACOOCHEE" },
    history: [
      {
        id: "log-13",
        timestamp: "2026-08-05T16:00:00Z",
        user: "Scott Pierpont",
        action: "Status Changed to UNDER_CONTRACT",
        oldValue: "AVAILABLE",
        newValue: "UNDER_CONTRACT"
      }
    ],
    createdAt: "2026-08-04T09:00:00Z",
    updatedAt: "2026-08-05T16:00:00Z"
  },
  {
    id: "EHS-014",
    address: "5746 W Lucky Ranch Trail",
    city: "Homosassa",
    county: "Citrus",
    state: "FL",
    zip: "34448",
    latitude: 28.8124,
    longitude: -82.5711,
    status: "STATUS_TO_CONFIRM",
    propertyType: "LAND",
    builder: null,
    community: "Lucky Ranch",
    price: null,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "1.25 acres",
    parcelNumber: "14E-19S-20-0020-0080",
    photos: [],
    description: "Acreage parcel in Lucky Ranch. Status and title verification in progress.",
    salesperson: "Unassigned",
    publicVisible: false,
    featured: false,
    notes: "Status and exact city/ZIP need confirmation with county records.",
    internalNotes: "Need updated title commitment and tax bill verification.",
    zoning: "Citrus Agricultural/Residential",
    floodZone: "Zone X",
    utilities: { water: "UNKNOWN", sewer: "UNKNOWN", electric: "UNKNOWN" },
    history: [],
    createdAt: "2026-08-04T10:00:00Z",
    updatedAt: "2026-08-04T10:00:00Z"
  },
  {
    id: "EHS-015",
    address: "716 Hazel Ave",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34601",
    latitude: 28.5492,
    longitude: -82.3912,
    status: "STATUS_TO_CONFIRM",
    propertyType: "LAND",
    builder: null,
    community: "Hazel Heights",
    price: null,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.38 acres",
    parcelNumber: "R15-222-19-1420-0010-0060",
    photos: [],
    description: "Infill lot on Hazel Ave.",
    salesperson: "Unassigned",
    publicVisible: false,
    featured: false,
    notes: "Status and exact city/ZIP need confirmation",
    internalNotes: "Checking probate status with county court records.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "UNKNOWN", sewer: "UNKNOWN", electric: "UNKNOWN" },
    history: [],
    createdAt: "2026-08-04T10:15:00Z",
    updatedAt: "2026-08-04T10:15:00Z"
  },
  {
    id: "EHS-016",
    address: "718 Hazel Ave",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34601",
    latitude: 28.5496,
    longitude: -82.3915,
    status: "STATUS_TO_CONFIRM",
    propertyType: "LAND",
    builder: null,
    community: "Hazel Heights",
    price: null,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.38 acres",
    parcelNumber: "R15-222-19-1420-0010-0070",
    photos: [],
    description: "Adjacent infill lot on Hazel Ave.",
    salesperson: "Unassigned",
    publicVisible: false,
    featured: false,
    notes: "Status and exact city/ZIP need confirmation",
    internalNotes: "Check joint easement with 716 Hazel Ave.",
    zoning: "R-1M",
    floodZone: "Zone X",
    utilities: { water: "UNKNOWN", sewer: "UNKNOWN", electric: "UNKNOWN" },
    history: [],
    createdAt: "2026-08-04T10:20:00Z",
    updatedAt: "2026-08-04T10:20:00Z"
  },
  {
    id: "EHS-017",
    address: "210 C St",
    city: "Brooksville",
    county: "Hernando",
    state: "FL",
    zip: "34601",
    latitude: 28.5521,
    longitude: -82.3855,
    status: "STATUS_TO_CONFIRM",
    propertyType: "LAND",
    builder: null,
    community: "Downtown Brooksville Infill",
    price: null,
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    lotSize: "0.25 acres",
    parcelNumber: "R17-222-19-0990-0040-0020",
    photos: [],
    description: "Commercial / residential hybrid lot near downtown Brooksville.",
    salesperson: "Unassigned",
    publicVisible: false,
    featured: false,
    notes: "Status and exact city/ZIP need confirmation",
    internalNotes: "Confirm Hernando County utility tap availability.",
    zoning: "C-1 / Residential Exception",
    floodZone: "Zone X",
    utilities: { water: "UNKNOWN", sewer: "UNKNOWN", electric: "UNKNOWN" },
    history: [],
    createdAt: "2026-08-04T10:30:00Z",
    updatedAt: "2026-08-04T10:30:00Z"
  }
];

// In-Memory Database Store (Single Source of Truth)
let propertyStore: Property[] = [...INITIAL_PROPERTIES];

export function getAllProperties(): Property[] {
  return [...propertyStore];
}

export function getPublicProperties(): Property[] {
  return propertyStore.filter((p) => p.publicVisible);
}

export function getPropertyById(id: string): Property | undefined {
  return propertyStore.find((p) => p.id === id);
}

export function formatPropertyAddress(property?: Property | null): string {
  if (!property) return "Unspecified Address";
  return [property.address, property.city, property.state, property.zip]
    .filter(Boolean)
    .join(", ");
}

export function createProperty(
  data: Partial<Property>,
  user: string = "Portal Admin"
): Property {
  const now = new Date().toISOString();
  const nextIdNumber = propertyStore.length + 1;
  const newId = `EHS-${String(nextIdNumber).padStart(3, "0")}`;

  const newProperty: Property = {
    id: data.id || newId,
    address: data.address || "New Property Address",
    city: data.city || "Brooksville",
    county: data.county || "Hernando",
    state: data.state || "FL",
    zip: data.zip || "34601",
    latitude: data.latitude || 28.5553,
    longitude: data.longitude || -82.3879,
    status: data.status || "AVAILABLE",
    propertyType: data.propertyType || "HOME",
    builder: data.builder || null,
    community: data.community || null,
    price: data.price != null ? Number(data.price) : null,
    bedrooms: data.bedrooms != null ? Number(data.bedrooms) : null,
    bathrooms: data.bathrooms != null ? Number(data.bathrooms) : null,
    squareFeet: data.squareFeet != null ? Number(data.squareFeet) : null,
    lotSize: data.lotSize || null,
    parcelNumber: data.parcelNumber || null,
    photos: Array.isArray(data.photos) ? data.photos : [],
    description: data.description || "",
    salesperson: data.salesperson || "Unassigned",
    publicVisible: data.publicVisible ?? true,
    featured: data.featured ?? false,
    notes: data.notes || "",
    internalNotes: data.internalNotes || "",
    zoning: data.zoning || "R-1M",
    floodZone: data.floodZone || "Zone X",
    utilities: data.utilities || {
      water: "UNKNOWN",
      sewer: "UNKNOWN",
      electric: "UNKNOWN"
    },
    history: [
      {
        id: `log-${Date.now()}`,
        timestamp: now,
        user,
        action: "Property Created in Portal",
        newValue: `Created as ${data.status || "AVAILABLE"}`
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  propertyStore.unshift(newProperty);
  return newProperty;
}

export function updateProperty(
  id: string,
  updates: Partial<Property>,
  user: string = "Portal Admin"
): Property | null {
  const index = propertyStore.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = propertyStore[index];
  const now = new Date().toISOString();
  const history: PropertyAuditLog[] = existing.history ? [...existing.history] : [];

  // Log key field changes
  if (updates.status && updates.status !== existing.status) {
    history.unshift({
      id: `log-${Date.now()}-status`,
      timestamp: now,
      user,
      action: "Status Changed",
      field: "status",
      oldValue: existing.status,
      newValue: updates.status
    });
  }

  if (updates.price !== undefined && updates.price !== existing.price) {
    history.unshift({
      id: `log-${Date.now()}-price`,
      timestamp: now,
      user,
      action: "Price Updated",
      field: "price",
      oldValue: existing.price,
      newValue: updates.price
    });
  }

  if (updates.publicVisible !== undefined && updates.publicVisible !== existing.publicVisible) {
    history.unshift({
      id: `log-${Date.now()}-visibility`,
      timestamp: now,
      user,
      action: "Public Visibility Toggled",
      field: "publicVisible",
      oldValue: existing.publicVisible,
      newValue: updates.publicVisible
    });
  }

  const updatedProperty: Property = {
    ...existing,
    ...updates,
    id: existing.id, // Immutable ID
    history,
    updatedAt: now
  };

  propertyStore[index] = updatedProperty;
  return updatedProperty;
}

export function deleteProperty(id: string, user: string = "Portal Admin"): boolean {
  const index = propertyStore.findIndex((p) => p.id === id);
  if (index === -1) return false;
  propertyStore.splice(index, 1);
  return true;
}

export function calculatePropertyStats(): PropertyStats {
  const total = propertyStore.length;
  let available = 0;
  let comingSoon = 0;
  let underContract = 0;
  let sold = 0;
  let statusToConfirm = 0;
  let availableHomes = 0;
  let availableLots = 0;

  let totalActiveValue = 0;
  let totalPipelineValue = 0;
  let pricedPropertiesCount = 0;
  let totalPriceSum = 0;

  const byCounty: Record<string, number> = {};
  const byBuilder: Record<string, number> = {};
  const byType: Record<string, number> = {};

  propertyStore.forEach((p) => {
    // Status counts
    if (p.status === "AVAILABLE") available++;
    else if (p.status === "COMING_SOON") comingSoon++;
    else if (p.status === "UNDER_CONTRACT") underContract++;
    else if (p.status === "SOLD") sold++;
    else if (p.status === "STATUS_TO_CONFIRM") statusToConfirm++;

    // Subtype counts
    if (p.status === "AVAILABLE") {
      if (p.propertyType === "HOME" || p.propertyType === "SPEC_HOME" || p.propertyType === "MODEL") {
        availableHomes++;
      } else if (p.propertyType === "LAND" || p.propertyType === "LAND_HOME_PACKAGE") {
        availableLots++;
      }
    }

    // Financial calculations
    if (p.price != null && Number.isFinite(p.price) && p.price > 0) {
      totalPriceSum += p.price;
      pricedPropertiesCount++;

      if (p.status === "AVAILABLE") {
        totalActiveValue += p.price;
      }
      if (p.status === "AVAILABLE" || p.status === "COMING_SOON" || p.status === "UNDER_CONTRACT") {
        totalPipelineValue += p.price;
      }
    }

    // County breakdown
    const countyKey = p.county ? `${p.county} County` : "Unassigned";
    byCounty[countyKey] = (byCounty[countyKey] || 0) + 1;

    // Builder breakdown
    const builderKey = p.builder || "Unassigned / Land";
    byBuilder[builderKey] = (byBuilder[builderKey] || 0) + 1;

    // Type breakdown
    byType[p.propertyType] = (byType[p.propertyType] || 0) + 1;
  });

  return {
    totalProperties: total,
    available,
    comingSoon,
    underContract,
    sold,
    statusToConfirm,
    availableHomes,
    availableLots,
    totalActiveValue,
    totalPipelineValue,
    averagePrice: pricedPropertiesCount > 0 ? Math.round(totalPriceSum / pricedPropertiesCount) : 0,
    byCounty,
    byBuilder,
    byType,
    updatedAt: new Date().toISOString()
  };
}
