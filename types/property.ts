export type PropertyStatus =
  | "AVAILABLE"
  | "COMING_SOON"
  | "UNDER_CONTRACT"
  | "SOLD"
  | "STATUS_TO_CONFIRM";

export type PropertyType =
  | "LAND"
  | "HOME"
  | "LAND_HOME_PACKAGE"
  | "SPEC_HOME"
  | "MODEL";

export interface PropertyUtilityInfo {
  water: "WELL" | "MUNICIPAL" | "NEEDS_WELL" | "UNKNOWN";
  sewer: "SEPTIC" | "MUNICIPAL" | "NEEDS_SEPTIC" | "UNKNOWN";
  electric: "CONNECTED" | "AT_ROAD" | "NEEDS_DROP" | "WITHLACOOCHEE" | "DUKE" | "UNKNOWN";
}

export interface PropertyAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  field?: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  status: PropertyStatus;
  propertyType: PropertyType;
  builder?: string | null;
  community?: string | null;
  price?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
  lotSize?: string | null;
  parcelNumber?: string | null;
  photos: string[];
  description: string;
  salesperson: string;
  publicVisible: boolean;
  featured: boolean;
  notes: string;
  internalNotes?: string;
  zoning?: string | null;
  floodZone?: string | null;
  utilities?: PropertyUtilityInfo;
  history?: PropertyAuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyStats {
  totalProperties: number;
  available: number;
  comingSoon: number;
  underContract: number;
  sold: number;
  statusToConfirm: number;
  availableHomes: number;
  availableLots: number;
  totalActiveValue: number;
  totalPipelineValue: number;
  averagePrice: number;
  byCounty: Record<string, number>;
  byBuilder: Record<string, number>;
  byType: Record<string, number>;
  updatedAt: string;
}

export const PROPERTY_STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; bg: string; text: string; border: string; dot: string; mapPinColor: string }
> = {
  AVAILABLE: {
    label: "Available",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    mapPinColor: "#10b981"
  },
  COMING_SOON: {
    label: "Coming Soon",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    mapPinColor: "#f59e0b"
  },
  UNDER_CONTRACT: {
    label: "Under Contract",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    mapPinColor: "#6366f1"
  },
  SOLD: {
    label: "Sold",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
    mapPinColor: "#64748b"
  },
  STATUS_TO_CONFIRM: {
    label: "Status To Confirm",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    mapPinColor: "#f43f5e"
  }
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  LAND: "Vacant Land / Lot",
  HOME: "Completed Home",
  LAND_HOME_PACKAGE: "Land & Home Package",
  SPEC_HOME: "Spec Home in Progress",
  MODEL: "Display Model"
};
