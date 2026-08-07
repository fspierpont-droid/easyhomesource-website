import { homes, type Home } from '@/data/homes';

export interface ServiceCatalogItem {
  sku: string;
  name: string;
  category: 'mandatory_services' | 'site_work' | 'addons' | 'options';
  categoryTitle: string;
  defaultPrice: number;
  description: string;
  calcType: 'flat' | 'per_side' | 'per_foot' | 'per_ton' | 'bid_required';
  unit: string;
  requiresBid?: boolean;
}

// Complete Standard Service Catalog (Dropdown Line Items from QS Master Quote ERP)
export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  // Mandatory Services & Site Work
  {
    sku: 'SITE-BLOCK-TIEDOWN',
    name: 'Block & Hurricane Tie-Down Installation',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 4500,
    description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone hurricane ground anchors.',
    calcType: 'per_side',
    unit: 'setup'
  },
  {
    sku: 'SITE-TRIMOUT',
    name: 'Interior & Exterior Trim Out',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 1850,
    description: 'Marriage line seaming, drywall finishing, carpet/vinyl seam completion, and exterior soffit trim.',
    calcType: 'per_side',
    unit: 'seam'
  },
  {
    sku: 'SITE-DIRTPAD',
    name: 'Dirt Pad & Laser Site Grading',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 3200,
    description: 'Clearing, clean fill dirt import, compacting, and laser leveling for solid home foundation.',
    calcType: 'flat',
    unit: 'pad'
  },
  {
    sku: 'SITE-WELL-4INCH',
    name: '4-Inch Potable Water Well System',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 7500,
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
    description: 'Front and rear fiberglass or pressure-treated stairs with handrails matching Florida building code.',
    calcType: 'flat',
    unit: '2 sets'
  },
  {
    sku: 'SITE-SKIRTING-VINYL',
    name: 'Vented Vinyl Perimeter Skirting',
    category: 'mandatory_services',
    categoryTitle: 'Site Work & Setup',
    defaultPrice: 1800,
    description: 'Full perimeter vinyl skirting with ground channel, top rail, and crawlspace access door.',
    calcType: 'per_foot',
    unit: 'perimeter'
  },

  // A/C & Heating Matrices
  {
    sku: 'HVAC-HP-2TON',
    name: '2.0-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 5170,
    description: 'High-efficiency heat pump system with digital thermostat, pad, whip, and ductwork plenum.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-2.5TON',
    name: '2.5-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 5280,
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
    description: '3.5 ton split heat pump system for homes 1,400 - 1,800 sq. ft.',
    calcType: 'per_ton',
    unit: 'system'
  },
  {
    sku: 'HVAC-HP-4TON',
    name: '4.0-Ton Central A/C Heat Pump (14.3 SEER2)',
    category: 'mandatory_services',
    categoryTitle: 'A/C & Heating',
    defaultPrice: 6150,
    description: '4.0 ton split heat pump system for homes 1,700 - 2,200 sq. ft.',
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
    description: 'Deep single basin chef sink with high-arc gooseneck faucet.',
    calcType: 'flat',
    unit: 'upgrade'
  }
];

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
  routeType: 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer' = 'dealer_to_customer'
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

  // Escorts required in FL if width > 14ft or distance > 60 miles
  const escortCount = homeWidth > 14 || miles > 50 ? (transportSides > 1 ? 2 : 1) : 0;

  const baseHaulCost = 1250 * transportSides;
  const perMileCost = miles * 18 * transportSides;
  const escortCost = escortCount * 650;

  const totalFreightCost = baseHaulCost + perMileCost + escortCost;
  // Standard wholesale to retail markup
  const totalFreightPrice = Math.round(totalFreightCost * 1.15);

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
