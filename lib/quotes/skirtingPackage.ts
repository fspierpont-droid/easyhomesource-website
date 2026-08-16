export interface SkirtingLineItemLike {
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  totalCost: number;
  [key: string]: unknown;
}

export const SKIRTING_PACKAGE_SKU = 'SITE-SKIRTING-VINYL';

export function normalizeSkirtingPackageLine<T extends SkirtingLineItemLike>(item: T): T {
  if (item.sku !== SKIRTING_PACKAGE_SKU) return item;

  // calculateSkirtingByDimensions already returns the complete perimeter package
  // price/cost. Linear footage is descriptive metadata, never a quantity multiplier.
  return {
    ...item,
    quantity: 1,
    totalPrice: Number(item.unitPrice) || 0,
    totalCost: Number(item.unitCost) || 0,
  };
}
