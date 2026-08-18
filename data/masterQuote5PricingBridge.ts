import * as legacy from './pricingSpreadsheet';
import type { QuoteFinancialTotals, ServiceCatalogItem } from './pricingSpreadsheet';

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
} as const;

function service(
  sku: string,
  name: string,
  category: ServiceCatalogItem['category'],
  cost: number,
  price: number,
  description: string,
  unit = 'job',
  calcType: ServiceCatalogItem['calcType'] = 'flat',
  requiresBid = false,
): ServiceCatalogItem {
  return {
    sku,
    name,
    category,
    categoryTitle:
      category === 'mandatory_services' ? 'Setup & Install' :
      category === 'site_work' ? 'Site Work' :
      category === 'addons' ? 'Add-Ons' : 'Options',
    defaultCost: cost,
    defaultPrice: price,
    description,
    unit,
    calcType,
    requiresBid,
  };
}

export const DIRT_PAD_LOADS_TABLE = legacy.DIRT_PAD_LOADS_TABLE;
export const BLOCK_TIE_DOWN_MATRIX = legacy.BLOCK_TIE_DOWN_MATRIX;
export const BLOCK_TIE_DOWN_LENGTH_BRACKETS = legacy.BLOCK_TIE_DOWN_LENGTH_BRACKETS;
export const AC_HEATING_MATRIX = legacy.AC_HEATING_MATRIX;

export const calculateBlockTieDown = legacy.calculateBlockTieDown;

export function calculateDirtPadPricing(loads: number) {
  const count = Math.min(20, Math.max(1, Math.round(Number(loads) || 1)));
  return DIRT_PAD_LOADS_TABLE.find((row) => row.loads === count) || DIRT_PAD_LOADS_TABLE[0];
}

export function calculateSkirtingByDimensions(width = 14, length = 60) {
  const linearFeet = 2 * ((Number(width) || 14) + (Number(length) || 60));
  return {
    linearFeet,
    cost: linearFeet * 8,
    price: linearFeet * 10,
  };
}

export function calculateTrimOut(sections: number) {
  const count = Math.min(3, Math.max(1, Math.round(Number(sections) || 1)));
  if (count === 1) return { label: 'Single-Wide', cost: 1000, price: 1100 };
  if (count === 2) return { label: 'Double-Wide', cost: 3000, price: 3300 };
  return { label: 'Triple-Wide', cost: 4000, price: 4400 };
}

export function getRecommendedSepticTankSize(bedrooms: number, squareFeet: number) {
  const beds = Number(bedrooms) || 0;
  const sqft = Number(squareFeet) || 0;
  if (beds <= 3 && sqft <= 2250) return 900;
  if (beds <= 4 && sqft <= 3300) return 1050;
  return 1200;
}

export interface DeliveryInputResult {
  routeType: 'factory_to_customer' | 'factory_to_dealer' | 'dealer_to_customer';
  miles: number;
  transportSides: number;
  escortCount: number;
  totalFreightCost: number;
  totalFreightPrice: number;
  warning?: string;
}

export function calculateDeliveryFromInputs(
  routeType: DeliveryInputResult['routeType'],
  miles: number,
  homeWidth = 14,
  escortCount = 0,
): DeliveryInputResult {
  const width = Number(homeWidth) || 14;
  const transportSides = width <= 18 ? 1 : width <= 36 ? 2 : 3;
  const enteredMiles = Math.max(0, Number(miles) || 0);
  const escorts = Math.max(0, Math.round(Number(escortCount) || 0));

  if (routeType === 'factory_to_customer' || routeType === 'factory_to_dealer') {
    const totalFreightCost = 6000 * transportSides;
    return {
      routeType,
      miles: enteredMiles,
      transportSides,
      escortCount: escorts,
      totalFreightCost,
      totalFreightPrice: 6600 * transportSides,
      warning: 'Factory-route Master Quote 5 baseline: $6,000 cost / $6,600 customer price per transported section.',
    };
  }

  if (!(enteredMiles > 0)) {
    return {
      routeType,
      miles: 0,
      transportSides,
      escortCount: escorts,
      totalFreightCost: 0,
      totalFreightPrice: 0,
      warning: 'Enter the actual dealership-to-site route mileage. No default mileage is assumed.',
    };
  }

  const milesOver50 = Math.max(0, enteredMiles - 50);
  const costPerSection =
    800 +
    (250 * escorts) +
    (8.5 * milesOver50) +
    (2 * escorts * milesOver50);
  const totalFreightCost = costPerSection * transportSides;
  const totalFreightPrice = Math.round(totalFreightCost * 1.1 * 100) / 100;

  return {
    routeType,
    miles: enteredMiles,
    transportSides,
    escortCount: escorts,
    totalFreightCost,
    totalFreightPrice,
  };
}

// Preserve the old signature for callers that still import autoCalculateDelivery,
// but fail closed for dealership routes rather than inventing a mileage from a city.
export function autoCalculateDelivery(
  destinationAddress: string,
  homeWidth = 14,
  routeType: DeliveryInputResult['routeType'] = 'dealer_to_customer',
) {
  const result = calculateDeliveryFromInputs(routeType, 0, homeWidth, 0);
  return {
    ...result,
    originAddress: routeType === 'dealer_to_customer' ? '9011 McIntyre Rd, Brooksville, FL 34601' : 'Manufacturer Plant',
    destinationAddress: destinationAddress || 'Delivery site not entered',
    durationText: '',
    baseHaulCost: result.totalFreightCost,
    perMileCost: 0,
    escortCost: 0,
  };
}

const dirtOptions: ServiceCatalogItem[] = DIRT_PAD_LOADS_TABLE.map((row) =>
  service(
    `SITE-DIRTPAD-${row.loads}-LOAD${row.loads === 1 ? '' : 'S'}`,
    `Dirt Pad & Laser Site Grading (${row.loads} Load${row.loads === 1 ? '' : 's'})`,
    'site_work',
    row.cost,
    row.price,
    `Paid ${row.loads}-load dirt-pad package. No dirt loads are included for free.`,
    'package',
  ),
);

const hvacOptions: ServiceCatalogItem[] = Object.entries(AC_HEATING_MATRIX).flatMap(([key, values]) => {
  const [tons, mode] = key.split('|');
  const tonLabel = tons.replace('.5', '.5');
  const modeLabel = mode === 'heat_pump' ? 'Heat Pump' : 'Straight Cool';
  const token = tons.replace('.', '_');
  return [
    service(`HVAC-PKG-${mode === 'heat_pump' ? 'HP' : 'SC'}-${token}TON`, `${tonLabel}-Ton Package ${modeLabel}`, 'mandatory_services', values.packageCost, values.packagePrice, 'Choose the actual tonnage and package configuration for the selected home.', 'system', 'per_ton'),
    service(`HVAC-SPLIT-${mode === 'heat_pump' ? 'HP' : 'SC'}-${token}TON`, `${tonLabel}-Ton Split ${modeLabel}`, 'mandatory_services', values.splitCost, values.splitPrice, 'Choose the actual tonnage and split configuration for the selected home.', 'system', 'per_ton'),
  ];
});

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  service('SITE-BLOCK-TIEDOWN', 'Block & Tie-Down & Vapor Barrier', 'mandatory_services', 0, 0, 'Calculated from home section class and length.', 'system', 'per_side'),
  service('SITE-TRIMOUT', 'Trim Out', 'mandatory_services', 3000, 3300, 'Calculated by section class: single $1,000/$1,100; double $3,000/$3,300; triple $4,000/$4,400 cost/price.', 'job', 'per_side'),
  service('SITE-PERIMETER-STABILIZATION', 'Perimeter Stabilization', 'mandatory_services', 1000, 1100, 'Perimeter stabilization baseline to protect the finished home site.'),
  service('SITE-STEPS-2SET', 'Wooden Steps - 2 Sets', 'mandatory_services', 1000, 2500, 'Two-set wooden-step package.'),
  service('SITE-SKIRTING-VALOR', 'Basic Valor Skirting', 'mandatory_services', 8, 10, '$8 cost / $10 customer price per actual perimeter linear foot.', 'linear ft', 'per_foot'),
  ...hvacOptions,
  ...dirtOptions,
  service('SITE-PERMIT-PLAN', 'County Building / Zoning / Health Permits', 'site_work', 2000, 2000, 'Standard permit allowance; verify county-specific requirements before final.'),
  service('SITE-WELL-4INCH', '4-Inch Potable Water Well System', 'addons', 8500, 9350, 'Well drilling/installation baseline. Verify depth and separate hookup/electric requirements.'),
  service('SITE-WELL-HOOKUP-LT50', 'Well Hookup (<50 ft)', 'addons', 350, 385, 'Well hookup under 50 ft.'),
  service('SITE-WELL-HOOKUP-50-100', 'Well Hookup (50-100 ft)', 'addons', 500, 550, 'Well hookup 50-100 ft; verify additional distance.'),
  service('SITE-WELL-ELECTRIC', 'Well Electric Connection', 'addons', 700, 770, 'Electrical connection for well equipment.'),
  service('SITE-SEPTIC-900', '900-Gallon Septic Tank + 375 sq ft Drain Field', 'addons', 6500, 7150, 'Verified base septic system. Larger tank sizes require verified/custom pricing.'),
  service('SITE-SEPTIC-DROP-SINGLE', 'Septic - Single Drop', 'addons', 500, 550, 'Single septic drop add-on.'),
  service('SITE-SEPTIC-DROP-MULTI', 'Septic - Multiple Drops', 'addons', 1000, 1100, 'Multiple septic drops add-on.'),
  service('SITE-SEPTIC-DEMO', 'Septic - Existing Tank Demolition', 'addons', 1000, 1100, 'Existing septic tank demolition add-on.'),
  service('SITE-WATER-HOOKUP', 'Water Hookups', 'addons', 850, 935, 'Selected water-hookup package; confirm source and distance.'),
  service('ELEC-PANEL-SWITCH-UPDATE', 'Electric - Switch / Update Panel', 'addons', 600, 660, 'Existing-panel switch/update component.'),
  service('ELEC-PANEL-NEW-POST', 'Electric - New Post + Panel', 'addons', 1250, 1375, 'New post and panel component.'),
  service('ELEC-WIRE-HOOKUP-50', 'Electric - Wire Hookup & Conduit (up to 50 ft)', 'addons', 1100, 1210, 'Wire hookup and conduit from pole to panel, up to 50 ft.'),
  service('ELEC-AC-DISCONNECT', 'Electric - A/C Disconnect Installation', 'addons', 500, 550, 'A/C disconnect installation.'),
  service('ELEC-WELL-CONNECTION', 'Electric - Well Electric Connection', 'addons', 700, 770, 'Electrical connection for well equipment.'),
  service('SITE-LEGAL-IMPACT', 'Legal + Impact Fees Allowance', 'site_work', 1350, 1485, 'Allowance only; confirm actual county/municipal fee structure.'),
  service('SITE-DEMO-LIGHT', 'Demolition - Light Demo', 'site_work', 2000, 4000, 'Trash, small debris, shrubs/fencing; no ground disturbance.'),
  service('SITE-DEMO-SURFACE', 'Demolition - Surface Removal / Small Machinery', 'site_work', 4000, 8000, 'Surface-level removal using small machinery with minimal excavation.'),
  service('SITE-DEMO-SHALLOW', 'Demolition - Shallow Demolition & Grading', 'site_work', 8000, 10000, 'Slabs, footings and shallow foundations with light grading.'),
  service('SITE-DEMO-HEAVY', 'Demolition - Heavy Removal & Earthwork', 'site_work', 8000, 12000, 'Foundations, buried debris, cut/fill and compaction.'),
  service('SITE-DEMO-FULL', 'Demolition - Full Site Demolition & Reconditioning', 'site_work', 12000, 16000, 'Complete site demolition and reconditioning.'),
  service('SITE-CLEAR-LIGHT', 'Land Clearing - Light Clearing', 'site_work', 2000, 4000, 'Light vegetation and brush clearing.'),
  service('SITE-CLEAR-MULCH', 'Land Clearing - Forestry Mulching', 'site_work', 3000, 6000, 'Selective forestry mulching/clearing.'),
  service('SITE-CLEAR-GRUB', 'Land Clearing - Grubbing & Dozing', 'site_work', 4000, 8000, 'Grubbing/dozing including root removal.'),
  service('SITE-CLEAR-CUTFILL', 'Land Clearing - Cut & Fill Excavation', 'site_work', 6000, 10000, 'Cut/fill excavation and shaping.'),
  service('SITE-CLEAR-GRADE', 'Land Clearing - Rough Grading / Drainage Prep', 'site_work', 8000, 12000, 'Rough grading and drainage preparation.'),
  service('SITE-PERIM-SOD', 'Perimeter Stabilization - Sod', 'site_work', 1000, 1100, 'Sod perimeter-stabilization option.'),
  service('SITE-PERIM-FLOWER', 'Perimeter Stabilization - Flower Bed', 'site_work', 1800, 1980, 'Flower-bed perimeter-stabilization option.'),
  service('SITE-PERIM-ROCK', 'Perimeter Stabilization - Rock', 'site_work', 2000, 2200, 'Rock perimeter-stabilization option.'),
  service('SITE-SEWER-HOOKUP-50', 'Sewer Hookup (up to 50 ft)', 'addons', 1500, 1650, 'Sewer hookup baseline up to 50 ft.'),
  service('SITE-APRON', '12-ft Driveway Apron', 'site_work', 2480, 2728, '12-ft concrete apron baseline; verify dimensions/vendor.'),
  service('SITE-APRON-DAVID-YORK', 'Concrete Apron - Alternate Vendor', 'site_work', 2500, 2750, 'Alternate concrete-apron vendor option.'),
  service('SITE-DRIVEWAY-BID', 'Driveway - Bid Required', 'site_work', 0, 0, 'Enter confirmed site-specific driveway bid.', 'job', 'bid_required', true),
  service('ADDON-DECK-BID', 'Deck - Bid Required', 'addons', 0, 0, 'Enter confirmed deck dimensions and bid.', 'job', 'bid_required', true),
  service('ADDON-PORCH-BID', 'Porch - Bid Required', 'addons', 0, 0, 'Enter confirmed porch dimensions and bid.', 'job', 'bid_required', true),
  service('ADDON-GUTTERS', 'Gutters & Downspouts', 'addons', 10, 11, '$10 cost / $11 customer price per linear foot.', 'linear ft', 'per_foot'),
  service('ADDON-LANDSCAPING-BID', 'Landscaping - Bid Required', 'addons', 0, 0, 'Enter confirmed landscaping bid.', 'job', 'bid_required', true),
];

export function calculateComprehensiveQuoteTotals(
  homePrice: number,
  landPrice: number,
  deliveryPrice: number,
  siteWorkPrice: number,
  addonsPrice: number,
  discountsPrice = 0,
  factoryCost = 0,
  deliveryCost = 0,
  siteWorkCost = 0,
  addonsCost = 0,
  taxRate = 0.03,
  ehsLoanOfficerUsed = false,
): QuoteFinancialTotals {
  const homeSubtotal = Number(homePrice) || 0;
  const landSubtotal = Number(landPrice) || 0;
  const deliveryTotal = Number(deliveryPrice) || 0;
  const siteWorkTotal = Number(siteWorkPrice) || 0;
  const addonsTotal = Number(addonsPrice) || 0;
  const discountsTotal = Number(discountsPrice) || 0;
  const subtotal = homeSubtotal + landSubtotal + deliveryTotal + siteWorkTotal + addonsTotal - discountsTotal;
  const salesTaxTotal = Math.round(subtotal * taxRate * 100) / 100;
  const estimatedTotal = Math.round((subtotal + salesTaxTotal) * 100) / 100;

  const actualFactoryCost = Number(factoryCost) || 0;
  const houseGrossMargin = Math.max(0, homeSubtotal - actualFactoryCost);
  const adminFee = Math.round(houseGrossMargin * 0.05 * 100) / 100;
  const loanFee = ehsLoanOfficerUsed ? 1000 : 0;
  const commissionableHouseMargin = Math.max(0, houseGrossMargin - adminFee - loanFee);
  const salespersonCommission = Math.round(commissionableHouseMargin * 0.20 * 100) / 100;

  const actualDeliveryCost = Number(deliveryCost) || 0;
  const actualSiteWorkCost = Number(siteWorkCost) || 0;
  const actualAddonsCost = Number(addonsCost) || 0;
  const serviceProfit =
    (deliveryTotal - actualDeliveryCost) +
    (siteWorkTotal - actualSiteWorkCost) +
    (addonsTotal - actualAddonsCost);
  const netTakeHome = houseGrossMargin - adminFee - loanFee - salespersonCommission + serviceProfit;

  return {
    home_subtotal: homeSubtotal,
    land_subtotal: landSubtotal,
    delivery_total: deliveryTotal,
    site_work_total: siteWorkTotal,
    addons_total: addonsTotal,
    discounts_total: discountsTotal,
    subtotal,
    financed_subtotal: subtotal,
    non_financed_subtotal: 0,
    tax_basis: subtotal,
    sales_tax_rate: taxRate,
    sales_tax_total: salesTaxTotal,
    estimated_total: estimatedTotal,
    factory_cost: actualFactoryCost,
    ehs_price_calculated: homeSubtotal,
    house_gross_margin: houseGrossMargin,
    commissionable_house_margin: commissionableHouseMargin,
    service_profit: serviceProfit,
    admin_fee: adminFee,
    loan_fee: loanFee,
    salesperson_commission: salespersonCommission,
    net_take_home: netTakeHome,
    take_home_floor: 20000,
    target_met: netTakeHome >= 20000,
  };
}

const guardSkirting = calculateSkirtingByDimensions(28, 60);
if (guardSkirting.linearFeet !== 176 || guardSkirting.cost !== 1408 || guardSkirting.price !== 1760) {
  throw new Error(`Master Quote 5 skirting guard failed: ${JSON.stringify(guardSkirting)}`);
}
const guardBlock = calculateBlockTieDown(60, 'double');
if (guardBlock.cost !== 9756 || guardBlock.price !== 12195) {
  throw new Error(`Master Quote 5 block/tie guard failed: ${JSON.stringify(guardBlock)}`);
}
const guardDirt = calculateDirtPadPricing(20);
if (guardDirt.cost !== 10900 || guardDirt.price !== 16350) {
  throw new Error(`Master Quote 5 dirt-pad guard failed: ${JSON.stringify(guardDirt)}`);
}
