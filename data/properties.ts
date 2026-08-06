export const PROPERTY_STORAGE_KEY = "ehs-property-inventory-v1";

export const propertyStatuses = [
  "Available Now",
  "Coming Soon / In Progress",
  "Under Contract / Sold",
  "Status to Confirm"
] as const;

export const propertyTypes = [
  "Finished Home",
  "Home in Progress",
  "Vacant Lot / Land",
  "Unknown"
] as const;

export type PropertyStatus = (typeof propertyStatuses)[number];
export type PropertyType = (typeof propertyTypes)[number];

export type PropertyRecord = {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  status: PropertyStatus;
  propertyType: PropertyType;
  units: number;
  price: number | null;
  salesRep: string;
  notes: string;
  source: string;
  updatedAt: string;
  displayOrder: number;
  publicVisible: boolean;
};

export const properties: PropertyRecord[] = [
  {
    id: "EHS-001",
    street: "6645 W Erlen Ln",
    city: "Homosassa",
    state: "FL",
    zip: "34446",
    status: "Available Now",
    propertyType: "Finished Home",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Finished home, ready on market",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 1,
    publicVisible: true
  },
  {
    id: "EHS-002",
    street: "3219 Welsh St",
    city: "Spring Hill",
    state: "FL",
    zip: "34606",
    status: "Available Now",
    propertyType: "Finished Home",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Finished home, ready on market",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 2,
    publicVisible: true
  },
  {
    id: "EHS-003",
    street: "18810 St Paul Dr",
    city: "Spring Hill",
    state: "FL",
    zip: "34610",
    status: "Available Now",
    propertyType: "Finished Home",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Finished home, ready on market",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 3,
    publicVisible: true
  },
  {
    id: "EHS-004",
    street: "7112 Fitzpatrick Ave",
    city: "Brooksville",
    state: "FL",
    zip: "34613",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Vacant lot",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 4,
    publicVisible: true
  },
  {
    id: "EHS-005",
    street: "9248 Denmarsh Dr",
    city: "Brooksville",
    state: "FL",
    zip: "34613",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Vacant lot",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 5,
    publicVisible: true
  },
  {
    id: "EHS-006",
    street: "9254 Denmarsh Dr",
    city: "Brooksville",
    state: "FL",
    zip: "34613",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Vacant lot",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 6,
    publicVisible: true
  },
  {
    id: "EHS-007",
    street: "9868 Lake Dr",
    city: "Spring Hill",
    state: "FL",
    zip: "34613",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Vacant lot",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 7,
    publicVisible: true
  },
  {
    id: "EHS-008",
    street: "9862 Lake Dr",
    city: "Spring Hill",
    state: "FL",
    zip: "34446",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Vacant lot",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 8,
    publicVisible: true
  },
  {
    id: "EHS-009",
    street: "5043 Southtowne Loop",
    city: "New Port Richey",
    state: "FL",
    zip: "34652",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 15,
    price: null,
    salesRep: "Unassigned",
    notes: "15 on-stilts vacant lots",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 9,
    publicVisible: true
  },
  {
    id: "EHS-010",
    street: "1295 S Rock Crusher Rd",
    city: "Homosassa",
    state: "FL",
    zip: "34448",
    status: "Available Now",
    propertyType: "Vacant Lot / Land",
    units: 23,
    price: null,
    salesRep: "Unassigned",
    notes: "23 vacant lots; approximately half-acre home sites",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 10,
    publicVisible: true
  },
  {
    id: "EHS-011",
    street: "26007 Shangri Dr",
    city: "Brooksville",
    state: "FL",
    zip: "34601",
    status: "Coming Soon / In Progress",
    propertyType: "Home in Progress",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Home in progress; expected to be ready in a few months",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 11,
    publicVisible: true
  },
  {
    id: "EHS-012",
    street: "26314 Glenwood Dr",
    city: "Zephyrhills",
    state: "FL",
    zip: "33544",
    status: "Coming Soon / In Progress",
    propertyType: "Home in Progress",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Flip/stick home; work finishing or beginning",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 12,
    publicVisible: true
  },
  {
    id: "EHS-013",
    street: "18034 Ferry Ave",
    city: "Brooksville",
    state: "FL",
    zip: "34604",
    status: "Under Contract / Sold",
    propertyType: "Home in Progress",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Under contract",
    source: "Team messages",
    updatedAt: "2026-08-04",
    displayOrder: 13,
    publicVisible: true
  },
  {
    id: "EHS-014",
    street: "5746 W Lucky Ranch Trail",
    city: "",
    state: "FL",
    zip: "",
    status: "Status to Confirm",
    propertyType: "Unknown",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Status and exact city/ZIP need confirmation",
    source: "Apple Maps guide",
    updatedAt: "2026-08-04",
    displayOrder: 14,
    publicVisible: false
  },
  {
    id: "EHS-015",
    street: "716 Hazel Ave",
    city: "",
    state: "FL",
    zip: "",
    status: "Status to Confirm",
    propertyType: "Unknown",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Status and exact city/ZIP need confirmation",
    source: "Apple Maps guide",
    updatedAt: "2026-08-04",
    displayOrder: 15,
    publicVisible: false
  },
  {
    id: "EHS-016",
    street: "718 Hazel Ave",
    city: "",
    state: "FL",
    zip: "",
    status: "Status to Confirm",
    propertyType: "Unknown",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Status and exact city/ZIP need confirmation",
    source: "Apple Maps guide",
    updatedAt: "2026-08-04",
    displayOrder: 16,
    publicVisible: false
  },
  {
    id: "EHS-017",
    street: "210 C St",
    city: "",
    state: "FL",
    zip: "",
    status: "Status to Confirm",
    propertyType: "Unknown",
    units: 1,
    price: null,
    salesRep: "Unassigned",
    notes: "Status and exact city/ZIP need confirmation",
    source: "Apple Maps guide",
    updatedAt: "2026-08-04",
    displayOrder: 17,
    publicVisible: false
  }
];

export function formatPropertyAddress(property: PropertyRecord) {
  return [property.street, property.city, property.state, property.zip].filter(Boolean).join(", ");
}

export function getPropertyMapUrl(property: PropertyRecord) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatPropertyAddress(property))}`;
}
