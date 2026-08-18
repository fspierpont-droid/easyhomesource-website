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

type MasterServiceInput = Omit<ServiceCatalogItem, 'categoryTitle' | 'calcType'> & {
  categoryTitle?: string;
  calcType?: ServiceCatalogItem['calcType'];
};

function service(input: MasterServiceInput): ServiceCatalogItem {
  const categoryTitle = input.categoryTitle || (
    input.category === 'mandatory_services' ? 'Setup & Install' :
    input.category === 'site_work' ? 'Site Work' :
    input.category === 'addons' ? 'Add-Ons' : 'Options'
  );
  const calcType = input.calcType || (
    input.requiresBid ? 'bid_required' : input.unit === 'linear ft' ? 'per_foot' : 'flat'
  );
  return { ...input, categoryTitle, calcType };
}

const dirtPadOptions: MasterServiceInput[] = DIRT_PAD_LOAD_PRICING.map((row) => ({
  sku: `SITE-DIRTPAD-${row.loads}-LOAD${row.loads === 1 ? '' : 'S'}`,
  name: `Dirt Pad & Laser Site Grading (${row.loads} Load${row.loads === 1 ? '' : 's'})`,
  category: 'site_work',
  description: `Paid dirt-pad package for ${row.loads} load${row.loads === 1 ? '' : 's'} of fill. Select the actual site-required load count; no loads are included for free.`,
  defaultCost: row.cost,
  defaultPrice: row.price,
  unit: 'package',
}));

const acRows: Array<[string, string, number, number]> = [
  ['HVAC-PKG-SC-2TON', '2.0-Ton Package Straight Cool', 4500, 4950],
  ['HVAC-PKG-HP-2TON', '2.0-Ton Package Heat Pump', 4700, 5170],
  ['HVAC-SPLIT-SC-2TON', '2.0-Ton Split — Whole System', 3800, 4180],
  ['HVAC-SPLIT-HP-2TON', '2.0-Ton Split Heat Pump — Whole System', 4050, 4455],
  ['HVAC-PKG-SC-2_5TON', '2.5-Ton Package Straight Cool', 4600, 5060],
  ['HVAC-PKG-HP-2_5TON', '2.5-Ton Package Heat Pump', 4800, 5280],
  ['HVAC-SPLIT-SC-2_5TON', '2.5-Ton Split — Whole System', 4100, 4510],
  ['HVAC-SPLIT-HP-2_5TON', '2.5-Ton Split Heat Pump — Whole System', 4300, 4730],
  ['HVAC-PKG-SC-3TON', '3.0-Ton Package Straight Cool', 4750, 5225],
  ['HVAC-PKG-HP-3TON', '3.0-Ton Package Heat Pump', 5050, 5555],
  ['HVAC-SPLIT-SC-3TON', '3.0-Ton Split — Whole System', 4500, 4950],
  ['HVAC-SPLIT-HP-3TON', '3.0-Ton Split Heat Pump — Whole System', 4700, 5170],
  ['HVAC-PKG-SC-3_5TON', '3.5-Ton Package Straight Cool', 4950, 5445],
  ['HVAC-PKG-HP-3_5TON', '3.5-Ton Package Heat Pump', 5200, 5720],
  ['HVAC-SPLIT-SC-3_5TON', '3.5-Ton Split — Whole System', 4900, 5390],
  ['HVAC-SPLIT-HP-3_5TON', '3.5-Ton Split Heat Pump — Whole System', 5100, 5610],
  ['HVAC-PKG-SC-4TON', '4.0-Ton Package Straight Cool', 5150, 5665],
  ['HVAC-PKG-HP-4TON', '4.0-Ton Package Heat Pump', 5500, 6050],
  ['HVAC-SPLIT-SC-4TON', '4.0-Ton Split — Whole System', 5300, 5830],
  ['HVAC-SPLIT-HP-4TON', '4.0-Ton Split Heat Pump — Whole System', 5550, 6105],
  ['HVAC-PKG-SC-5TON', '5.0-Ton Package Straight Cool', 6000, 6600],
  ['HVAC-PKG-HP-5TON', '5.0-Ton Package Heat Pump', 6500, 7150],
  ['HVAC-SPLIT-SC-5TON', '5.0-Ton Split — Whole System', 5750, 6325],
  ['HVAC-SPLIT-HP-5TON', '5.0-Ton Split Heat Pump — Whole System', 5950, 6545],
];

const acOptions: MasterServiceInput[] = acRows.map(([sku, name, cost, price]) => ({
  sku,
  name,
  category: 'mandatory_services',
  categoryTitle: 'A/C & Heating',
  description: 'Master Quote 5 A/C selection. Choose the actual tonnage and package/split configuration; no sample system is assumed to fit every home.',
  defaultCost: cost,
  defaultPrice: price,
  unit: 'system',
  calcType: 'per_ton',
}));

const serviceInputs: MasterServiceInput[] = [
  {
    sku: 'SITE-BLOCK-TIEDOWN',
    name: 'Block & Tie-Down & Vapor Barrier',
    category: 'mandatory_services',
    description: 'Structural stabilization, block/level, tie-down and vapor barrier. Calculated from home section count and length.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'system',
    calcType: 'per_side',
  },
  {
    sku: 'SITE-TRIMOUT',
    name: 'Trim Out',
    category: 'mandatory_services',
    description: 'Final interior detailing after the home is set. Master Quote 5: single-wide $1,000/$1,100; double-wide $3,000/$3,300; triple-wide $4,000/$4,400 cost/price.',
    defaultCost: 3000,
    defaultPrice: 3300,
    unit: 'job',
    calcType: 'per_side',
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
    sku: 'SITE-PERIMETER-STABILIZATION',
    name: 'Perimeter Stabilization',
    category: 'mandatory_services',
    description: 'Perimeter stabilization to prevent washouts and maintain level ground around the home.',
    defaultCost: 1000,
    defaultPrice: 1100,
    unit: 'job',
  },
  {
    sku: 'SITE-SKIRTING-VALOR',
    name: 'Basic Valor Skirting',
    category: 'mandatory_services',
    description: 'Basic Valor skirting with vents, corners and trim. $8 cost / $10 customer price per linear foot.',
    defaultCost: 8,
    defaultPrice: 10,
    unit: 'linear ft',
    calcType: 'per_foot',
  },
  {
    sku: 'ELEC-POLE-PANEL',
    name: 'Electric Pole & Panel',
    category: 'addons',
    description: 'Selected Master Quote 5 pole/panel package; verify site power scope before finalizing.',
    defaultCost: 1850,
    defaultPrice: 2035,
    unit: 'job',
  },
  {
    sku: 'ELEC-HOOKUP',
    name: 'Electric Hookups',
    category: 'addons',
    description: 'Master Quote 5 selected hookup package price is $1,320. Component scope must be confirmed before finalization.',
    defaultCost: 1200,
    defaultPrice: 1320,
    unit: 'job',
  },
  {
    sku: 'SITE-WELL-4INCH',
    name: '4-Inch Potable Water Well System',
    category: 'addons',
    description: 'Drilling depth + installation baseline. Verify drilling depth, electric connection and hookup distance before final.',
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
    description: 'Well hookup 50–100 ft. Master Quote 5 notes $150 for each additional 50 ft beyond this range.',
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
  ...dirtPadOptions,
  {
    sku: 'SITE-DEMO-BID',
    name: 'Demolition & Removal — Bid Required',
    category: 'site_work',
    description: 'Site-specific demolition. Enter confirmed bid/custom price; no placeholder charge is assumed.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
    requiresBid: true,
  },
  {
    sku: 'SITE-CLEARING-BID',
    name: 'Land Clearing — Bid Required',
    category: 'site_work',
    description: 'Site-specific clearing. Enter confirmed bid/custom price; no placeholder charge is assumed.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
    requiresBid: true,
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
    requiresBid: true,
  },
  {
    sku: 'ADDON-DECK-BID',
    name: 'Deck — Bid Required',
    category: 'addons',
    description: 'Enter confirmed dimensions and bid.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
    requiresBid: true,
  },
  {
    sku: 'ADDON-PORCH-BID',
    name: 'Porch — Bid Required',
    category: 'addons',
    description: 'Enter confirmed dimensions and bid.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
    requiresBid: true,
  },
  {
    sku: 'ADDON-GUTTERS',
    name: 'Gutters & Downspouts',
    category: 'addons',
    description: '$10 cost / $11 price per linear foot. Confirm which roof edges/sides are included.',
    defaultCost: 10,
    defaultPrice: 11,
    unit: 'linear ft',
    calcType: 'per_foot',
  },
  {
    sku: 'ADDON-LANDSCAPING-BID',
    name: 'Landscaping — Bid Required',
    category: 'addons',
    description: 'Enter a confirmed landscaping package/bid; no placeholder charge is assumed.',
    defaultCost: 0,
    defaultPrice: 0,
    unit: 'job',
    requiresBid: true,
  },
];

export const SERVICE_CATALOG: ServiceCatalogItem[] = serviceInputs.map(service);

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
  const markupFactor = Math.max(
    27368 / cost,
    MASTER_QUOTE_5_GLOBALS.pricingMultiplier * Math.pow(cost, -MASTER_QUOTE_5_GLOBALS.curveMultiplier),
  );
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
