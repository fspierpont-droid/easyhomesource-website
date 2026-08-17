import * as legacy from './pricingSpreadsheet';
import type { ServiceCatalogItem, QuoteFinancialTotals } from './pricingSpreadsheet';

export * from './pricingSpreadsheet';

export const MASTER_QUOTE_5_GLOBALS = {
  salesTaxRate: 0.03,
  adminFeeRate: 0.05,
  loanFee: 1000,
  agentCommissionRate: 0.20,
  takeHomeFloor: 20000,
  msrpRate: 0.15,
  curveMultiplier: 0.454,
  pricingMultiplier: 85,
  materialSurcharge: 2000,
  stateAssociationDuesPerFloor: 200,
  mhiDues: 35,
  wz3Upgrade: 2500,
  modularOnFrameFee: 5000,
  modularOffFrameFee: 12000,
  vipDiscountRate: 0.05,
} as const;

export const DIRT_PAD_LOAD_PRICING = legacy.DIRT_PAD_LOAD_PRICING;
export const BLOCK_TIE_DOWN_TABLE = legacy.BLOCK_TIE_DOWN_TABLE;
export const calculateBlockTieDown = legacy.calculateBlockTieDown;
export const calculateDirtPadPricing = legacy.calculateDirtPadPricing;

const dirtPadOptions: ServiceCatalogItem[] = DIRT_PAD_LOAD_PRICING.map((row) => ({
  sku: `SITE-DIRTPAD-${row.loads}-LOAD${row.loads === 1 ? '' : 'S'}`,
  name: `Dirt Pad & Laser Site Grading (${row.loads} Load${row.loads === 1 ? '' : 's'})`,
  category: 'site_work',
  description: `Paid dirt-pad package for ${row.loads} load${row.loads === 1 ? '' : 's'} of fill. Select the actual site-required load count; no loads are included for free.`,
  defaultCost: row.cost,
  defaultPrice: row.price,
  unit: 'package',
}));

const acOptions: ServiceCatalogItem[] = [
  ['HVAC-SC-2TON', '2.0-Ton Split — Whole System', 4500, 4950],
  ['HVAC-HP-2TON', '2.0-Ton Heat Pump — Whole System', 4700, 5170],
  ['HVAC-SC-2_5TON', '2.5-Ton Split — Whole System', 4600, 5060],
  ['HVAC-HP-2_5TON', '2.5-Ton Heat Pump — Whole System', 4800, 5280],
  ['HVAC-SC-3TON', '3.0-Ton Split — Whole System', 4500, 4950],
  ['HVAC-HP-3TON', '3.0-Ton Heat Pump — Whole System', 5050, 5555],
  ['HVAC-SC-3_5TON', '3.5-Ton Split — Whole System', 4900, 5390],
  ['HVAC-HP-3_5TON', '3.5-Ton Heat Pump — Whole System', 5100, 5610],
  ['HVAC-SC-4TON', '4.0-Ton Split — Whole System', 5300, 5830],
  ['HVAC-HP-4TON', '4.0-Ton Heat Pump — Whole System', 5550, 6105],
  ['HVAC-SC-5TON', '5.0-Ton Split — Whole System', 5750, 6325],
  ['HVAC-HP-5TON', '5.0-Ton Heat Pump — Whole System', 5950, 6545],
].map(([sku, name, cost, price]) => ({
  sku: String(sku),
  name: String(name),
  category: 'mandatory_services' as const,
  description: 'Master Quote 5 A/C system selection. Choose the correct tonnage/configuration for the home; do not infer a system from a sample quote.',
  defaultCost: Number(cost),
  defaultPrice: Number(price),
  unit: 'system',
}));

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    sku: 'SITE-BLOCK-TIEDOWN',
    name: 'Block & Tie-Down & Vapor Barrier',
    category: 'mandatory_services',
    description: 'Structural stabilization, block/level, tie-down and vapor barrier. Price is calculated from home width/section count and length.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'system',
  },
  {
    sku: 'SITE-TRIM',
    name: 'Trim Out',
    category: 'mandatory_services',
    description: 'Final interior detailing after the home is set. Master Quote 5: single-wide $1,000/$1,100; double-wide $3,000/$3,300; triple-wide $4,000/$4,400 cost/price.',
    defaultCost: 3000,
    defaultPrice: 3300,
    unit: 'job',
  },
  {
    sku: 'ELEC-POLE-PANEL',
    name: 'Electric Pole & Panel',
    category: 'addons',
    description: 'Selected Master Quote 5 pole/panel package; verify the site power scope before finalizing.',
    defaultCost: 1850,
    defaultPrice: 2035,
    unit: 'job',
  },
  {
    sku: 'ELEC-HOOKUP',
    name: 'Electric Hookups',
    category: 'addons',
    description: 'Electrical hookup package. Master Quote 5 selected sample price is $1,320; component scope must be confirmed before finalization.',
    defaultCost: 1200,
    defaultPrice: 1320,
    unit: 'job',
  },
  {
    sku: 'SITE-WELL-4INCH',
    name: '4-Inch Potable Water Well System',
    category: 'addons',
    description: 'Master Quote 5 drilling depth + installation baseline. Verify drilling depth, electric connection and hookup distance before final.',
    defaultCost: 8500,
    defaultPrice: 9350,
    unit: 'system',
  },
  {
    sku: 'SITE-WELL-HOOKUP-LT50',
    name: 'Well Hookup (<50 ft)',
    category: 'addons',
    description: 'Well hookup under 50 ft.',
    defaultCost: 350,
    defaultPrice: 385,
    unit: 'job',
  },
  {
    sku: 'SITE-WELL-HOOKUP-50-100',
    name: 'Well Hookup (50–100 ft)',
    category: 'addons',
    description: 'Well hookup from 50–100 ft. Master sheet notes $150 for each additional 50 ft beyond this range.',
    defaultCost: 500,
    defaultPrice: 550,
    unit: 'job',
  },
  {
    sku: 'SITE-WELL-ELECTRIC',
    name: 'Well Electric Connection',
    category: 'addons',
    description: 'Electrical connection for well equipment.',
    defaultCost: 700,
    defaultPrice: 770,
    unit: 'job',
  },
  {
    sku: 'SITE-SEPTIC-900',
    name: '900-Gallon Septic Tank + 375 sq ft Drain Field',
    category: 'addons',
    description: 'Master Quote 5 base septic system. Confirm required tank size from bedrooms/square footage and site conditions.',
    defaultCost: 6500,
    defaultPrice: 7150,
    unit: 'system',
  },
  {
    sku: 'SITE-SEPTIC-DROP-SINGLE',
    name: 'Septic — Single Drop',
    category: 'addons',
    description: 'Single septic drop add-on.',
    defaultCost: 500,
    defaultPrice: 550,
    unit: 'job',
  },
  {
    sku: 'SITE-SEPTIC-DROP-MULTI',
    name: 'Septic — Multiple Drops',
    category: 'addons',
    description: 'Multiple septic drops add-on.',
    defaultCost: 1000,
    defaultPrice: 1100,
    unit: 'job',
  },
  {
    sku: 'SITE-SEPTIC-DEMO',
    name: 'Septic — Existing Tank Demolition',
    category: 'addons',
    description: 'Existing septic tank demolition add-on.',
    defaultCost: 1000,
    defaultPrice: 1100,
    unit: 'job',
  },
  {
    sku: 'SITE-WATER-HOOKUP',
    name: 'Water Hookups',
    category: 'addons',
    description: 'Selected water-hookup package. Confirm source and distance.',
    defaultCost: 850,
    defaultPrice: 935,
    unit: 'job',
  },
  {
    sku: 'SITE-LEGAL-IMPACT',
    name: 'Legal + Impact Fees Allowance',
    category: 'site_work',
    description: 'Allowance only; confirm actual county/municipal fee structure before final.',
    defaultCost: 1350,
    defaultPrice: 1485,
    unit: 'allowance',
  },
  ...acOptions,
  {
    sku: 'SITE-PERIMETER-STABILIZATION',
    name: 'Perimeter Stabilization',
    category: 'mandatory_services',
    description: 'Perimeter stabilization to prevent washouts and maintain level ground around the home.',
    defaultCost: 1000,
    defaultPrice: 1100,
    unit: 'job',
  },
  {
    sku: 'SITE-STEPS-2SET',
    name: 'Wooden Steps — 2 Sets',
    category: 'mandatory_services',
    description: 'Master Quote 5 selected two-set wooden-step package.',
    defaultCost: 1000,
    defaultPrice: 2500,
    unit: 'package',
  },
  {
    sku: 'SITE-SKIRTING-VALOR',
    name: 'Basic Valor Skirting',
    category: 'mandatory_services',
    description: 'Basic Valor skirting with vents, corners and trim. $8 cost / $10 customer price per linear foot.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'linear ft',
  },
  ...dirtPadOptions,
  {
    sku: 'SITE-DEMO-BID',
    name: 'Demolition & Removal — Bid Required',
    category: 'site_work',
    description: 'Site-specific demolition. Enter confirmed bid/custom price; no placeholder charge is assumed.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
  },
  {
    sku: 'SITE-CLEARING-BID',
    name: 'Land Clearing — Bid Required',
    category: 'site_work',
    description: 'Site-specific clearing. Enter confirmed bid/custom price; no placeholder charge is assumed.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
  },
  {
    sku: 'SITE-APRON',
    name: '12-ft Driveway Apron',
    category: 'site_work',
    description: 'Master Quote 5 AMHI 12-ft apron baseline. Confirm dimensions/vendor before final.',
    defaultCost: 2480,
    defaultPrice: 2728,
    unit: 'job',
  },
  {
    sku: 'SITE-DRIVEWAY-BID',
    name: 'Driveway — Bid Required',
    category: 'site_work',
    description: 'Concrete, asphalt or gravel access path; enter confirmed site-specific bid.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
  },
  {
    sku: 'ADDON-DECK-BID',
    name: 'Deck — Bid Required',
    category: 'addons',
    description: 'Enter confirmed dimensions and bid.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
  },
  {
    sku: 'ADDON-PORCH-BID',
    name: 'Porch — Bid Required',
    category: 'addons',
    description: 'Enter confirmed dimensions and bid.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
  },
  {
    sku: 'ADDON-GUTTERS',
    name: 'Gutters & Downspouts',
    category: 'addons',
    description: '$10 cost / $11 price per linear foot. Confirm which roof edges/sides are included.',
    defaultCost: 10,
    defaultPrice: 11,
    unit: 'linear ft',
  },
  {
    sku: 'ADDON-LANDSCAPING-BID',
    name: 'Landscaping — Bid Required',
    category: 'addons',
    description: 'Enter a confirmed landscaping package/bid; no placeholder charge is assumed.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
  },
];

export function calculateTrimOut(sectionCount: number): { cost: number; price: number; label: string } {
  if (sectionCount <= 1) return { cost: 1000, price: 1100, label: 'Single-wide' };
  if (sectionCount === 2) return { cost: 3000, price: 3300, label: 'Double-wide' };
  return { cost: 4000, price: 4400, label: 'Triple-wide' };
}

export function calculateSkirtingByDimensions(widthFeet: number, lengthFeet: number) {
  const linearFeet = Math.max(0, Math.round((Number(widthFeet) + Number(lengthFeet)) * 2));
  return {
    linearFeet,
    costPerFoot: 8,
    pricePerFoot: 10,
    cost: linearFeet * 8,
    price: linearFeet * 10,
  };
}

export type MasterQuote5SepticTankSize = 900 | 1050 | 1200;

export function getRecommendedSepticTankSize(bedrooms: number, squareFeet: number): MasterQuote5SepticTankSize {
  if (bedrooms <= 2 && squareFeet < 1500) return 900;
  if (bedrooms <= 3 && squareFeet <= 2250) return 1050;
  return 1200;
}

export function calculateMasterQuote5HousePrice(unitFactoryCost: number): number {
  const cost = Number(unitFactoryCost) || 0;
  if (cost <= 0) return 0;
  const markupFactor = Math.max(27368 / cost, MASTER_QUOTE_5_GLOBALS.pricingMultiplier * Math.pow(cost, -MASTER_QUOTE_5_GLOBALS.curveMultiplier));
  return cost * (markupFactor + 1);
}

export function calculateMasterQuote5Profit(params: {
  finalHomePrice: number;
  trueFactoryInvoice: number;
  siteWorkPrice?: number;
  siteWorkCost?: number;
  ehsLoanOfficerUsed?: boolean;
}) {
  const grossMargin = params.finalHomePrice - params.trueFactoryInvoice;
  const adminFee = Math.max(0, grossMargin) * MASTER_QUOTE_5_GLOBALS.adminFeeRate;
  const loanFee = params.ehsLoanOfficerUsed ? MASTER_QUOTE_5_GLOBALS.loanFee : 0;
  const commissionableHouseMargin = Math.max(0, grossMargin - adminFee - loanFee);
  const salesCommission = commissionableHouseMargin * MASTER_QUOTE_5_GLOBALS.agentCommissionRate;
  const ehsDealProfit = grossMargin - adminFee - loanFee - salesCommission;
  const siteWorkProfit = (params.siteWorkPrice || 0) - (params.siteWorkCost || 0);
  return {
    grossMargin,
    adminFee,
    loanFee,
    commissionableHouseMargin,
    salesCommission,
    ehsDealProfit,
    siteWorkProfit,
    totalProjectProfit: ehsDealProfit + siteWorkProfit,
    targetMet: ehsDealProfit >= MASTER_QUOTE_5_GLOBALS.takeHomeFloor,
  };
}

export function calculateComprehensiveQuoteTotals(
  homePrice: number,
  landPrice: number,
  deliveryPrice: number,
  siteWorkPrice: number,
  addonsPrice: number,
  discountsPrice: number,
  factoryCost: number,
  deliveryCost: number,
  siteWorkCost: number,
  addonsCost: number,
  taxRate = MASTER_QUOTE_5_GLOBALS.salesTaxRate,
): QuoteFinancialTotals {
  const totals = legacy.calculateComprehensiveQuoteTotals(
    homePrice,
    landPrice,
    deliveryPrice,
    siteWorkPrice,
    addonsPrice,
    discountsPrice,
    factoryCost,
    deliveryCost,
    siteWorkCost,
    addonsCost,
    taxRate,
  );

  const houseGrossMargin = homePrice - factoryCost;
  const adminFee = Math.max(0, houseGrossMargin) * MASTER_QUOTE_5_GLOBALS.adminFeeRate;
  const commissionableHouseMargin = Math.max(0, houseGrossMargin - adminFee);
  const salespersonCommission = commissionableHouseMargin * MASTER_QUOTE_5_GLOBALS.agentCommissionRate;
  const serviceProfit = (deliveryPrice - deliveryCost) + (siteWorkPrice - siteWorkCost) + (addonsPrice - addonsCost);
  const netTakeHome = houseGrossMargin - adminFee - salespersonCommission;

  return {
    ...totals,
    house_gross_margin: houseGrossMargin,
    commissionable_house_margin: commissionableHouseMargin,
    service_profit: serviceProfit,
    admin_fee: adminFee,
    salesperson_commission: salespersonCommission,
    net_take_home: netTakeHome,
    take_home_floor: MASTER_QUOTE_5_GLOBALS.takeHomeFloor,
    target_met: netTakeHome >= MASTER_QUOTE_5_GLOBALS.takeHomeFloor,
  };
}
