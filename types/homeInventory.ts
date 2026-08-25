export type HomeInventoryStatus =
  | 'ON_LOT'
  | 'ORDERED'
  | 'IN_TRANSIT'
  | 'SETUP_IN_PROGRESS'
  | 'SOLD_AWAITING_DELIVERY'
  | 'OFF_LOT'
  | 'STATUS_TO_CONFIRM';

export type InventoryDocumentCategory =
  | 'Factory Invoice'
  | 'Certificate of Origin/MSO'
  | 'Build Sheet/Order'
  | 'Floorplan Financing'
  | 'Title'
  | 'Other';

export const INVENTORY_DOCUMENT_CATEGORIES: InventoryDocumentCategory[] = [
  'Factory Invoice',
  'Certificate of Origin/MSO',
  'Build Sheet/Order',
  'Floorplan Financing',
  'Title',
  'Other',
];

export interface HomeInventoryRecord {
  id: string;
  display_name: string;
  manufacturer?: string | null;
  model_name?: string | null;
  series?: string | null;
  serial_number?: string | null;
  hud_labels?: string[];
  catalog_home_id?: string | null;
  status: HomeInventoryStatus;
  lot_location?: string | null;
  notes?: string;
  ehs_retail_price?: number | null;
  /** Legacy compatibility only. New UI uses invoice_without_freight. */
  factory_invoice_cost?: number | null;
  invoice_without_freight?: number | null;
  freight_financed?: number | null;
  freight_paid?: number | null;
  final_invoice_total?: number | null;
  floorplan_financing_balance?: number | null;
  financing_provider?: string | null;
  ordered_date?: string | null;
  delivered_date?: string | null;
  estimated_offline_date?: string | null;
  active: boolean;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryDocument {
  id: string;
  inventory_id: string;
  category: InventoryDocumentCategory;
  filename: string;
  content_type: 'application/pdf';
  size_bytes: number;
  uploaded_at: string;
  uploaded_by_id?: string;
  uploaded_by_name?: string;
}
