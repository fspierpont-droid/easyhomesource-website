import { type MasterCatalogHome } from '@/data/fullMasterCatalog.generated';

// V05 Block & Hurricane Tie-Down Matrix Brackets (by home length)
export const BLOCK_TIE_DOWN_LENGTH_BRACKETS = [30, 36, 40, 44, 48, 52, 56, 60, 66, 72, 76, 80];

export const BLOCK_TIE_DOWN_MATRIX = {
  single: {
    cost: [3318, 3588, 3858, 4128, 4398, 4668, 6538, 6708, 6978, 7148, 7418, 7588],
    price: [4147.5, 4485, 4822.5, 5160, 5497.5, 5835, 8172.5, 8385, 8722.5, 8935, 9272.5, 9485]
  },
  double: {
    cost: [5218, 5704, 6302, 6788, 7386, 7872, 9270, 9756, 10354, 10760, 11358, 11844],
    price: [6522.5, 7130, 7877.5, 8485, 9232.5, 9840, 11587.5, 12195, 12942.5, 13450, 14197.5, 14805]
  },
  triple: {
    cost: [6261.6, 6844.8, 7562.4, 8145.6, 8863.2, 9446.4, 11124, 11707.2, 12424.8, 12912, 13629.6, 14212.8],
    price: [7827, 8556, 9453, 10182, 11079, 11808, 13905, 14634, 15531, 16140, 17037, 17766]
  }
};

// V05 A/C & Heating Matrices
export const AC_HEATING_MATRIX: Record<string, { packageCost: number; packagePrice: number; splitCost: number; splitPrice: number }> = {
  '2|straight_cool': { packageCost: 4500, packagePrice: 4950, splitCost: 3800, splitPrice: 4180 },
  '2|heat_pump': { packageCost: 4700, packagePrice: 5170, splitCost: 4050, splitPrice: 4455 },
  '2.5|straight_cool': { packageCost: 4600, packagePrice: 5060, splitCost: 4100, splitPrice: 4510 },
  '2.5|heat_pump': { packageCost: 4800, packagePrice: 5280, splitCost: 4300, splitPrice: 4730 },
  '3|straight_cool': { packageCost: 4750, packagePrice: 5225, splitCost: 4500, splitPrice: 4950 },
  '3|heat_pump': { packageCost: 5050, packagePrice: 5555, splitCost: 4700, splitPrice: 5170 },
  '3.5|straight_cool': { packageCost: 4950, packagePrice: 5445, splitCost: 4900, splitPrice: 5390 },
  '3.5|heat_pump': { packageCost: 5200, packagePrice: 5720, splitCost: 5100, splitPrice: 5610 },
  '4|straight_cool': { packageCost: 5150, packagePrice: 5665, splitCost: 5300, splitPrice: 5830 },
  '4|heat_pump': { packageCost: 5500, packagePrice: 6050, splitCost: 5550, splitPrice: 6105 },
  '5|straight_cool': { packageCost: 6000, packagePrice: 6600, splitCost: 5750, splitPrice: 6325 },
  '5|heat_pump': { packageCost: 6500, packagePrice: 7150, splitCost: 5950, splitPrice: 6545 }
};

// V05 Dirt Pad Table (1 to 20 loads)
export const DIRT_PAD_LOADS_TABLE = [
  { loads: 1, cost: 1000, price: 1500 },
  { loads: 2, cost: 1800, price: 2700 },
  { loads: 3, cost: 2400, price: 3600 },
  { loads: 4, cost: 2900, price: 4350 },
  { loads: 5, cost: 3400, price: 5100 },
  { loads: 6, cost: 3900, price: 5850 },
  { loads: 7, cost: 4400, price: 6600 },
  { loads: 8, cost: 4900, price: 7350 },
  { loads: 9, cost: 5400, price: 8100 },
  { loads: 10, cost: 5900, price: 8850 },
  { loads: 11, cost: 6400, price: 9600 },
  { loads: 12, cost: 6900, price: 10350 },
  { loads: 13, cost: 7400, price: 11100 },
  { loads: 14, cost: 7900, price: 11850 },
  { loads: 15, cost: 8400, price: 12600 },
  { loads: 16, cost: 8900, price: 13350 },
  { loads: 17, cost: 9400, price: 14100 },
  { loads: 18, cost: 9900, price: 14850 },
  { loads: 19, cost: 10400, price: 15600 },
  { loads: 20, cost: 10900, price: 16350 }
];

export interface ServiceCatalogItem {
  sku: string;
  name: string;
  category: 'mandatory_services' | 'site_work' | 'addons' | 'options';
  categoryTitle: string;
  defaultPrice: number;
  defaultCost: number;
  description: string;
  calcType: 'flat' | 'per_side' | 'per_foot' | 'per_ton' | 'bid_required';
  unit: string;
  requiresBid?: boolean;
}

// Complete Standard Service Catalog (Dropdown Line Items from QS Master Quote ERP V05)
export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  // Mandatory Services & Site Work
  {
    sku: 'SITE-BLOCK-TIEDOWN',
    name: 'Block & Hurricane Tie-Down Installation',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 5835,
    defaultCost: 4668,
    description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone hurricane ground anchors (calculated by length/sections).',
    calcType: 'per_side',
    unit: 'setup'
  },
  {
    sku: 'SITE-TRIMOUT',
    name: 'Interior & Exterior Trim Out',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 1850,
    defaultCost: 1400,
    description: 'Marriage line seaming, drywall finishing, carpet/vinyl seam completion, and exterior soffit trim.',
    calcType: 'per_side',
    unit: 'seam'
  },
  {
    sku: 'SITE-DIRTPAD',
    name: 'Dirt Pad & Laser Site Grading (2 Loads)',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 2700,
    defaultCost: 1800,
    description: 'Clearing, clean fill dirt import, compacting, and laser leveling for solid home foundation (V05 table).',
    calcType: 'flat',
    unit: 'pad'
  },
  {
    sku: 'SITE-WELL-4INCH',
    name: '4-Inch Potable Water Well System',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 7500,
    defaultCost: 5800,
    description: 'Drilling up to 120ft, submersible pump, pressure tank, control box, and plumbing tie-in.',
    calcType: 'flat',
    unit: 'well'
  },
  {
    sku: 'SITE-SEPTIC-1050',
    name: '1,050-Gallon Septic Tank & Drainfield',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 6800,
    defaultCost: 5200,
    description: 'Standard concrete septic tank, header line, distribution box, and gravity drainfield system.',
    calcType: 'flat',
    unit: 'system'
  },
  {
    sku: 'SITE-ELEC-PANEL',
    name: '200-Amp Electric Pole & Meter Panel',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 2450,
    defaultCost: 1850,
    description: '200A service disconnect, utility pole/riser, ground rod, and electrical conduit hookup.',
    calcType: 'flat',
    unit: 'panel'
  },
  {
    sku: 'SITE-PERMIT-PLAN',
    name: 'County Building, Zoning & Health Dept Permits',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 2650,
    defaultCost: 2650,
    description: 'Hernando, Citrus, Pasco, or Sumter county building permit processing and inspection fees.',
    calcType: 'flat',
    unit: 'permit'
  },
  {
    sku: 'SITE-STEPS-2SET',
    name: '2 Sets Code-Compliant Exterior Steps',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 1400,
    defaultCost: 950,
    description: 'Front and rear fiberglass or pressure-treated stairs with handrails matching Florida building code.',
    calcType: 'flat',
    unit: '2 sets'
  },
  {
    sku: 'SITE-SKIRTING-VINYL',
    name: 'Vented Vinyl Perimeter Skirting & Foundation Channel',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 3200,
    defaultCost: 2200,
    description: 'Full perimeter vinyl skirting with ground channel, top rail, and crawlspace access door.',
    calcType: 'per_foot',
    unit: 'perimeter'
  },

  // A/C & Heating Matrices (V05 ERP 14.3 SEER2 Systems)
  {
    sku: 'HVAC-HP-2TON',
    name: '2.0-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 5170,
    defaultCost: 4700,
    description: 'High-efficiency heat pump package with digital thermostat, pad, whip, and ductwork plenum.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-2.5TON',
    name: '2.5-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 5280,
    defaultCost: 4800,
    description: '2.5 ton split heat pump system for homes 700 - 1,100 sq. ft.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-3TON',
    name: '3.0-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 5555,
    defaultCost: 5050,
    description: '3.0 ton split heat pump system for homes 1,100 - 1,500 sq. ft.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-3.5TON',
    name: '3.5-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 5720,
    defaultCost: 5200,
    description: '3.5 ton split heat pump system for homes 1,400 - 1,800 sq. ft.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-4TON',
    name: '4.0-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 6050,
    defaultCost: 5500,
    description: '4.0 ton split heat pump system for homes 1,700 - 2,200 sq. ft.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-5TON',
    name: '5.0-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 7150,
    defaultCost: 6500,
    description: '5.0 ton split heat pump system for homes 2,200+ sq. ft.',
    calcType: 'per_ton',
    unit: 'system'
  },

  // Add-Ons & Upgrades
  {
    sku: 'ADDON-DECK-8X10',
    name: '8x10 Pressure-Treated Front Porch Deck',
    category: 'addons',
    categoryTitle: 'Add-Ons & Decks',
    defaultPrice: 3400,
    defaultCost: 2400,
    description: 'Custom built wooden front entry deck with safety handrails and wide stair treads.',
    calcType: 'flat',
    unit: 'deck'
  },
  {
    sku: 'ADDON-DECK-10X12',
    name: '10x12 Covered Back Entertainment Deck',
    category: 'addons',
    categoryTitle: 'Add-Ons & Decks',
    defaultPrice: 4800,
    defaultCost: 3500,
    description: 'Spacious rear outdoor living deck with corrugated roof cover.',
    calcType: 'flat',
    unit: 'deck'
  },
  {
    sku: 'ADDON-CARPORT',
    name: '18x24 Aluminum Vehicle Carport',
    category: 'addons',
    categoryTitle: 'Add-Ons & Decks',
    defaultPrice: 5600,
    defaultCost: 4100,
    description: 'Heavy gauge steel/aluminum hurricane-rated 2-car covered carport.',
    calcType: 'flat',
    unit: 'carport'
  },
  {
    sku: 'ADDON-SMART-THERM',
    name: 'Ecobee Smart WiFi Thermostat Package',
    category: 'options',
    categoryTitle: 'Options & Upgrades',
    defaultPrice: 350,
    defaultCost: 220,
    description: 'Smart energy management with mobile app controls.',
    calcType: 'flat',
    unit: 'device'
  },
  {
    sku: 'ADDON-FARM-SINK',
    name: 'Stainless Steel Farmhouse Apron Sink & Pull-Down Faucet',
    category: 'options',
    categoryTitle: 'Options & Upgrades',
    defaultPrice: 650,
    defaultCost: 420,
    description: 'Deep single basin chef sink with high-arc gooseneck faucet.',
    calcType: 'flat',
    unit: 'upgrade'
  }
];

// Helper: Calculate Block & Tie-Down based on home length & section class
export function calculateBlockTieDown(
  lengthFt: number = 60,
  homeClass: 'single' | 'double' | 'triple' = 'single'
): { cost: number; price: number; matchedLength: number } {
  const brackets = BLOCK_TIE_DOWN_LENGTH_BRACKETS;
  let idx = brackets.findIndex((b) => lengthFt <= b);
  if (idx < 0) idx = brackets.length - 1;

  const matrix = BLOCK_TIE_DOWN_MATRIX[homeClass] || BLOCK_TIE_DOWN_MATRIX.single;
  const cost = matrix.cost[idx] || matrix.cost[0];
  const price = matrix.price[idx] || matrix.price[0];

  return {
    cost,
    price,
    matchedLength: brackets[idx]
  };
}

// Delivery calculation engine
export interface DeliveryCalculationResult {
  routeType: 'factory_to_customer' | 'factory_to_dealer' | 'dealer_to_customer';
  originAddress: string;
  destinationAddress: string;
  miles: number;
  durationText: string;
  transportSides: number;
  escortCount: number;
  baseHaulCost: number;
  perMileCost: number;
  escortCost: number;
  totalFreightCost: number;
  totalFreightPrice: number;
  warning?: string;
}

export function autoCalculateDelivery(
  destinationAddress: string,
  homeWidth: number = 14,
  routeType: 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer' = 'dealer_to_customer',
  homeOrigin: 'florida' | 'outside_florida' = 'outside_florida'
): DeliveryCalculationResult {
  const originAddress = '9011 McIntyre Rd, Brooksville, FL 34601';
  const cleanDest = (destinationAddress || '').toLowerCase();

  // Estimate distance based on Central Florida destination
  let miles = 25; // Default Hernando / Brooksville area
  let durationText = '35 mins';

  if (cleanDest.includes('homosassa') || cleanDest.includes('crystal river') || cleanDest.includes('34446') || cleanDest.includes('34448')) {
    miles = 32;
    durationText = '42 mins';
  } else if (cleanDest.includes('spring hill') || cleanDest.includes('34606') || cleanDest.includes('34608') || cleanDest.includes('34609')) {
    miles = 18;
    durationText = '25 mins';
  } else if (cleanDest.includes('new port richey') || cleanDest.includes('hudson') || cleanDest.includes('34652') || cleanDest.includes('34667')) {
    miles = 38;
    durationText = '48 mins';
  } else if (cleanDest.includes('zephyrhills') || cleanDest.includes('dade city') || cleanDest.includes('33544') || cleanDest.includes('33525')) {
    miles = 44;
    durationText = '55 mins';
  } else if (cleanDest.includes('ocala') || cleanDest.includes('marion') || cleanDest.includes('34471') || cleanDest.includes('34476')) {
    miles = 52;
    durationText = '58 mins';
  } else if (cleanDest.includes('tampa') || cleanDest.includes('hillsborough') || cleanDest.includes('33602')) {
    miles = 58;
    durationText = '1 hr 5 mins';
  } else if (cleanDest.includes('bushnell') || cleanDest.includes('sumter') || cleanDest.includes('33513')) {
    miles = 28;
    durationText = '34 mins';
  }

  // Multi-section vs single section transport sides
  const transportSides = homeWidth > 18 ? 2 : 1;

  // Escorts required in FL if width > 14ft or distance > 50 miles
  const escortCount = homeWidth > 14 || miles > 50 ? (transportSides > 1 ? 2 : 1) : 0;

  // Out of state factory route flat rate calculation if factory direct
  if (routeType !== 'dealer_to_customer' && homeOrigin === 'outside_florida') {
    const costPerSide = 6000;
    const pricePerSide = Math.round(costPerSide * 1.1);
    const totalFreightCost = costPerSide * transportSides;
    const totalFreightPrice = pricePerSide * transportSides;
    return {
      routeType,
      originAddress: 'Manufacturer Out-of-State Plant',
      destinationAddress: destinationAddress || 'Central Florida Site',
      miles,
      durationText,
      transportSides,
      escortCount,
      baseHaulCost: totalFreightCost,
      perMileCost: 0,
      escortCost: 0,
      totalFreightCost,
      totalFreightPrice,
      warning: 'Out-of-state manufacturer freight flat rate.'
    };
  }

  // V05 Standard Delivery Freight Formula:
  // Base 800 + 250*escorts + 8.5*(miles-50) + 2*(miles-50)*escorts per side
  const overMiles = Math.max(0, miles - 50);
  const costPerSide = 800 + 250 * escortCount + 8.5 * overMiles + 2 * overMiles * escortCount;
  const pricePerSide = Math.round(costPerSide * 1.1);

  const baseHaulCost = 800 * transportSides;
  const perMileCost = (8.5 * overMiles) * transportSides;
  const escortCost = (250 * escortCount + 2 * overMiles * escortCount) * transportSides;

  const totalFreightCost = costPerSide * transportSides;
  const totalFreightPrice = pricePerSide * transportSides;

  let warning: string | undefined;
  if (transportSides > 1) {
    warning = 'Multi-section transport: requires two dedicated transport carriers and staggered highway delivery.';
  } else if (escortCount > 0) {
    warning = 'Wide-load escort vehicle required under Florida DOT transport regulations.';
  }

  return {
    routeType,
    originAddress,
    destinationAddress: destinationAddress || 'Central Florida Site',
    miles,
    durationText,
    transportSides,
    escortCount,
    baseHaulCost,
    perMileCost,
    escortCost,
    totalFreightCost,
    totalFreightPrice,
    warning
  };
}

// Full Quote Totals Engine (matching V05 ERP and the exact customer-facing + internal layout)
export interface QuoteFinancialTotals {
  home_subtotal: number;
  delivery_total: number;
  site_work_total: number;
  addons_total: number;
  discounts_total: number;
  subtotal: number;
  financed_subtotal: number;
  non_financed_subtotal: number;
  tax_basis: number;
  sales_tax_rate: number;
  sales_tax_total: number;
  estimated_total: number;

  // Internal Only Metrics
  factory_cost: number;
  ehs_price_calculated: number;
  house_gross_margin: number;
  commissionable_house_margin: number;
  service_profit: number;
  admin_fee: number;
  loan_fee: number;
  salesperson_commission: number;
  net_take_home: number;
  take_home_floor: number;
  target_met: boolean;
}

export function calculateComprehensiveQuoteTotals(
  homePrice: number,
  deliveryPrice: number,
  siteWorkPrice: number,
  addonsPrice: number,
  discountsPrice: number = 0,
  factoryCost: number = 0,
  deliveryCost: number = 0,
  siteWorkCost: number = 0,
  addonsCost: number = 0,
  taxRate: number = 0.03
): QuoteFinancialTotals {
  const home_subtotal = Number(homePrice) || 0;
  const delivery_total = Number(deliveryPrice) || 0;
  const site_work_total = Number(siteWorkPrice) || 0;
  const addons_total = Number(addonsPrice) || 0;
  const discounts_total = Number(discountsPrice) || 0;

  const subtotal = home_subtotal + delivery_total + site_work_total + addons_total - discounts_total;
  const financed_subtotal = subtotal;
  const non_financed_subtotal = 0;
  const tax_basis = subtotal;

  const sales_tax_rate = taxRate;
  const sales_tax_total = Math.round(tax_basis * sales_tax_rate * 100) / 100;
  const estimated_total = Math.round((subtotal + sales_tax_total) * 100) / 100;

  // Internal calculations
  const fCost = Number(factoryCost) || Math.round(home_subtotal * 0.72);
  const ehs_price_calculated = home_subtotal;
  const house_gross_margin = home_subtotal - fCost;
  const commissionable_house_margin = house_gross_margin - 1000;

  const dCost = Number(deliveryCost) || Math.round(delivery_total / 1.1);
  const sCost = Number(siteWorkCost) || Math.round(site_work_total * 0.75);
  const aCost = Number(addonsCost) || Math.round(addons_total * 0.7);

  const service_profit = (delivery_total - dCost) + (site_work_total - sCost) + (addons_total - aCost);
  const admin_fee = Math.round(subtotal * 0.05 * 100) / 100;
  const loan_fee = 1000;
  const salesperson_commission = commissionable_house_margin > 0 ? Math.round(commissionable_house_margin * 0.2 * 100) / 100 : 0;

  const net_take_home = (house_gross_margin + service_profit) - (admin_fee + loan_fee + salesperson_commission);
  const take_home_floor = Math.round(subtotal * 0.12);
  const target_met = net_take_home >= take_home_floor;

  return {
    home_subtotal,
    delivery_total,
    site_work_total,
    addons_total,
    discounts_total,
    subtotal,
    financed_subtotal,
    non_financed_subtotal,
    tax_basis,
    sales_tax_rate,
    sales_tax_total,
    estimated_total,
    factory_cost: fCost,
    ehs_price_calculated,
    house_gross_margin,
    commissionable_house_margin,
    service_profit,
    admin_fee,
    loan_fee,
    salesperson_commission,
    net_take_home,
    take_home_floor,
    target_met
  };
}
