import {
  SERVICE_CATALOG,
  calculateComprehensiveQuoteTotals,
  calculateBlockTieDown,
  calculateSkirtingByDimensions,
  type QuoteFinancialTotals
} from './pricingSpreadsheet';

export interface SelectedQuoteLineItem {
  id: string;
  sku: string;
  name: string;
  category: 'mandatory_services' | 'site_work' | 'addons' | 'options' | 'custom';
  unitPrice: number;
  unitCost: number;
  quantity: number;
  totalPrice: number;
  totalCost: number;
  description: string;
}

export interface DepositItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: string;
}

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  quoteDate?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  salesperson: string;
  salespersonEmail?: string;
  salespersonTitle?: string;
  salespersonPhone?: string;
  status: 'DRAFT' | 'SENT_TO_BUYER' | 'LENDER_REVIEW' | 'APPROVED' | 'IN_CONTRACT';

  // Home details
  homeModel: string;
  manufacturer?: string;
  series?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  dimensions?: string;
  homeWidth?: number;
  homeLength?: number;
  homePrice: number;
  factoryCost: number;
  homeDescription?: string;

  // Land / Site & Delivery
  propertyAddress: string;
  propertyPrice: number;
  deliveryRouteType?: 'dealer_to_customer' | 'factory_to_customer' | 'factory_to_dealer' | string;
  deliveryMiles?: number;
  escortsCount?: number;
  freightDelivery: number;
  freightCost?: number;

  // Site services
  siteWorkTotal: number;
  siteWorkCost?: number;
  lineItems: SelectedQuoteLineItem[];
  discounts: number;

  // Financing tab (Loan Officer, Deposits, Milestones)
  purchaseType?: 'cash' | 'financing';
  financingStatus?: string;
  preApprovalAmount?: number;
  targetBudget?: number;
  ehsLoanOfficerUsed?: boolean;
  activeLoanFee?: number;
  deposits?: DepositItem[];
  loanApprovalDate?: string;
  loanClosingDate?: string;
  permitApprovalDate?: string;
  siteReadyDate?: string;
  deliveryDate?: string;
  installationDate?: string;
  walkthroughDate?: string;
  moveInDate?: string;

  // Totals & Math
  subtotal: number;
  financedSubtotal?: number;
  nonFinancedSubtotal?: number;
  taxBasis: number;
  salesTax: number;
  totalTurnkeyPrice: number;
  estimatedTotal: number;
  downPaymentPercent?: number;
  downPaymentAmount?: number;
  estimatedMonthlyPayment?: number;

  // Profit / Margin Internal Totals
  financialTotals?: QuoteFinancialTotals;

  // Notes
  notes: string;
  notesCustomer?: string;
  notesInternal?: string;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_SAVED_QUOTES: SavedQuote[] = [
  {
    id: '2026_06_29_PIERPONT_NEW',
    quoteNumber: '2026_06_29_PIERPONT_NEW',
    quoteDate: '2026-06-29',
    customerName: 'Angie Floyd',
    customerPhone: '352-568-6946',
    customerEmail: 'angielynn011477@gmail.com',
    customerAddress: 'Homosassa, FL 34446',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    salespersonTitle: 'Principal & Operations Admin',
    salespersonPhone: '(352) 558-8888',
    status: 'APPROVED',
    homeModel: 'Sebastian 32644D',
    manufacturer: 'Cavco Douglas',
    series: 'Douglas Collection',
    beds: 4,
    baths: 2,
    sqft: 1920,
    dimensions: '32 x 64',
    homeWidth: 32,
    homeLength: 64,
    homePrice: 144776.71,
    factoryCost: 104239.23,
    homeDescription: 'The Sebastian 32644D built by Cavco Douglas is a spacious 4-bedroom, 2-bath ranch-style home offering 1,920 sq. ft. of well-designed living space across two sections.',
    propertyAddress: 'Homosassa, FL 34446',
    propertyPrice: 0.00,
    deliveryRouteType: 'factory_to_dealer',
    deliveryMiles: 50,
    escortsCount: 2,
    freightDelivery: 2860.00,
    freightCost: 2600.00,
    siteWorkTotal: 49486.00,
    siteWorkCost: 37114.50,
    discounts: 0,
    purchaseType: 'financing',
    financingStatus: 'approved',
    preApprovalAmount: 220000,
    targetBudget: 210000,
    ehsLoanOfficerUsed: false,
    activeLoanFee: 0,
    deposits: [
      { id: 'dep-1', name: 'Initial Binder Deposit', amount: 2500, date: '2026-06-29', status: 'Received' }
    ],
    loanApprovalDate: '2026-07-05',
    loanClosingDate: '2026-07-20',
    permitApprovalDate: '2026-07-25',
    siteReadyDate: '2026-08-01',
    deliveryDate: '2026-08-05',
    installationDate: '2026-08-10',
    walkthroughDate: '2026-08-15',
    moveInDate: '2026-08-20',
    lineItems: [
      {
        id: 'sw-1',
        sku: 'SITE-STEPS-WOOD',
        name: 'Wooden Steps — Two Sets',
        category: 'mandatory_services',
        unitPrice: 2500.00,
        unitCost: 1800.00,
        quantity: 1,
        totalPrice: 2500.00,
        totalCost: 1800.00,
        description: 'Two sets of pressure-treated wooden code-compliant entrance stairs with handrails.'
      },
      {
        id: 'sw-2',
        sku: 'SITE-PERMIT-PLAN',
        name: 'County Building, Zoning & Health Dept Permits',
        category: 'mandatory_services',
        unitPrice: 2000.00,
        unitCost: 2000.00,
        quantity: 1,
        totalPrice: 2000.00,
        totalCost: 2000.00,
        description: 'Citrus county building permit processing, plan review, zoning, and health inspections ($2,000 flat standard).'
      },
      {
        id: 'sw-3',
        sku: 'SITE-BLOCK-TIEDOWN',
        name: "Block & Tie-Down (Double · 66' table)",
        category: 'mandatory_services',
        unitPrice: 11000.00,
        unitCost: 8800.00,
        quantity: 1,
        totalPrice: 11000.00,
        totalCost: 8800.00,
        description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone ground anchors (Double wide 66ft table).'
      },
      {
        id: 'sw-4',
        sku: 'SITE-TRIMOUT',
        name: 'Trim Out',
        category: 'mandatory_services',
        unitPrice: 1500.00,
        unitCost: 1100.00,
        quantity: 1,
        totalPrice: 1500.00,
        totalCost: 1100.00,
        description: 'Interior and exterior marriage line trim out and final finishing.'
      },
      {
        id: 'sw-5',
        sku: 'SITE-ELEC-PANEL',
        name: 'Electric Pole & Panel',
        category: 'mandatory_services',
        unitPrice: 1850.00,
        unitCost: 1400.00,
        quantity: 1,
        totalPrice: 1850.00,
        totalCost: 1400.00,
        description: '200A utility disconnect pole, meter socket, and underground conduit riser.'
      },
      {
        id: 'sw-6',
        sku: 'SITE-ELEC-HOOKUP',
        name: 'Electric Hookups',
        category: 'mandatory_services',
        unitPrice: 2300.00,
        unitCost: 1700.00,
        quantity: 1,
        totalPrice: 2300.00,
        totalCost: 1700.00,
        description: 'Main panel feeder cable connection, grounding rods, and electrical inspection readiness.'
      },
      {
        id: 'sw-7',
        sku: 'HVAC-HP-4TON',
        name: 'AC Unit & Installation (4 ton · Package · Straight Cool)',
        category: 'mandatory_services',
        unitPrice: 5200.00,
        unitCost: 4700.00,
        quantity: 1,
        totalPrice: 5200.00,
        totalCost: 4700.00,
        description: '4.0-Ton high-efficiency package air conditioning unit with equipment pad and supply plenum tie-in.'
      },
      {
        id: 'sw-8',
        sku: 'SITE-WELL-SYSTEM',
        name: 'Well System',
        category: 'mandatory_services',
        unitPrice: 9400.00,
        unitCost: 7200.00,
        quantity: 1,
        totalPrice: 9400.00,
        totalCost: 7200.00,
        description: '4-inch deep potable water well drilling, submersible pump, pressure tank, and waterline hookup.'
      },
      {
        id: 'sw-9',
        sku: 'SITE-SEPTIC-SYSTEM',
        name: 'Septic System',
        category: 'mandatory_services',
        unitPrice: 8500.00,
        unitCost: 6500.00,
        quantity: 1,
        totalPrice: 8500.00,
        totalCost: 6500.00,
        description: '1,050-gallon concrete septic tank, header line, distribution box, and gravity drainfield.'
      },
      {
        id: 'sw-10',
        sku: 'SITE-SKIRTING-VALOR',
        name: 'Skirting Basic Valor (192 Linear Feet @ $8.00/ft)',
        category: 'mandatory_services',
        unitPrice: 1536.00,
        unitCost: 1050.00,
        quantity: 192,
        totalPrice: 1536.00,
        totalCost: 1050.00,
        description: 'Vented vinyl perimeter skirting around 192 linear ft (2 * (32 + 64)) with top trim and ground track.'
      }
    ],
    subtotal: 197122.71,
    financedSubtotal: 197122.71,
    nonFinancedSubtotal: 0,
    taxBasis: 197122.71,
    salesTax: 5913.68,
    totalTurnkeyPrice: 203036.39,
    estimatedTotal: 203036.39,
    downPaymentPercent: 10,
    downPaymentAmount: 20303.64,
    estimatedMonthlyPayment: 1198,
    notes: 'Turnkey land and home package proposal for Homosassa homesite.',
    notesCustomer: 'Complete turnkey setup including well, septic, 4-ton AC, permits, 200A electric, vinyl skirting, and wooden stairs.',
    notesInternal: 'FHA loan in underwriting. Ready for site visit verification.',
    shareToken: '2026_06_29_PIERPONT_NEW',
    createdAt: '2026-06-29T10:00:00Z',
    updatedAt: '2026-08-08T04:00:00Z'
  },
  {
    id: 'quote-1',
    quoteNumber: 'Q-2026-0801',
    quoteDate: '2026-08-01',
    customerName: 'Sarah Jenkins',
    customerPhone: '352-555-0192',
    customerEmail: 'sarah.j@example.com',
    customerAddress: '6645 W Erlen Ln, Homosassa, FL 34446',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    salespersonTitle: 'Principal & Operations Admin',
    salespersonPhone: '(352) 558-8888',
    status: 'APPROVED',
    homeModel: 'Move on Up (18x60 3b/2ba)',
    manufacturer: 'CLAYTON Addison',
    series: 'Tempo Series',
    beds: 3,
    baths: 2,
    sqft: 1080,
    dimensions: "18' x 60'",
    homeWidth: 18,
    homeLength: 60,
    homePrice: 94900.00,
    factoryCost: 68328.00,
    homeDescription: 'Move on Up by Clayton Addison offers 3 bedrooms, 2 bathrooms, modern open-concept kitchen, and Florida energy efficiency package.',
    propertyAddress: '6645 W Erlen Ln, Homosassa, FL 34446',
    propertyPrice: 49900.00,
    deliveryRouteType: 'dealer_to_customer',
    deliveryMiles: 32,
    escortsCount: 1,
    freightDelivery: 3850.00,
    freightCost: 3500.00,
    siteWorkTotal: 30650.00,
    siteWorkCost: 23150.00,
    discounts: 0,
    purchaseType: 'financing',
    financingStatus: 'approved',
    preApprovalAmount: 190000,
    targetBudget: 185000,
    ehsLoanOfficerUsed: false,
    activeLoanFee: 0,
    deposits: [
      { id: 'dep-1', name: 'Initial Binder Deposit', amount: 1000, date: '2026-08-01', status: 'Received' }
    ],
    loanApprovalDate: '2026-08-03',
    loanClosingDate: '2026-08-15',
    permitApprovalDate: '2026-08-18',
    siteReadyDate: '2026-08-22',
    deliveryDate: '2026-08-25',
    installationDate: '2026-08-28',
    walkthroughDate: '2026-09-02',
    moveInDate: '2026-09-05',
    lineItems: [
      {
        id: 'li-1',
        sku: 'SITE-BLOCK-TIEDOWN',
        name: 'Block & Hurricane Tie-Down Installation',
        category: 'mandatory_services',
        unitPrice: 5835.00,
        unitCost: 4668.00,
        quantity: 1,
        totalPrice: 5835.00,
        totalCost: 4668.00,
        description: 'Concrete pier pads, cinder blocks, leveling, and Florida wind zone ground anchors (60ft single table).'
      },
      {
        id: 'li-2',
        sku: 'HVAC-HP-3TON',
        name: '3.0-Ton Central A/C Heat Pump System (14.3 SEER2)',
        category: 'mandatory_services',
        unitPrice: 5555.00,
        unitCost: 5050.00,
        quantity: 1,
        totalPrice: 5555.00,
        totalCost: 5050.00,
        description: 'High-efficiency heat pump with digital thermostat, equipment pad, and plenum tie-in.'
      },
      {
        id: 'li-3',
        sku: 'SITE-DIRTPAD',
        name: 'Dirt Pad & Laser Site Grading (2 Loads)',
        category: 'mandatory_services',
        unitPrice: 2700.00,
        unitCost: 1800.00,
        quantity: 1,
        totalPrice: 2700.00,
        totalCost: 1800.00,
        description: 'Clearing, clean fill dirt import, compacting, and laser leveling for solid home pad.'
      },
      {
        id: 'li-4',
        sku: 'SITE-WELL-4INCH',
        name: '4-Inch Potable Water Well System',
        category: 'mandatory_services',
        unitPrice: 7500.00,
        unitCost: 5800.00,
        quantity: 1,
        totalPrice: 7500.00,
        totalCost: 5800.00,
        description: 'Drilling up to 120ft, submersible pump, pressure tank, and plumbing tie-in.'
      },
      {
        id: 'li-5',
        sku: 'SITE-SEPTIC-1050',
        name: '1,050-Gallon Septic Tank & Drainfield',
        category: 'mandatory_services',
        unitPrice: 6800.00,
        unitCost: 5200.00,
        quantity: 1,
        totalPrice: 6800.00,
        totalCost: 5200.00,
        description: 'Standard concrete septic tank, header line, distribution box, and gravity drainfield.'
      },
      {
        id: 'li-6',
        sku: 'SITE-PERMIT-PLAN',
        name: 'County Building, Zoning & Health Dept Permits',
        category: 'mandatory_services',
        unitPrice: 2000.00,
        unitCost: 2000.00,
        quantity: 1,
        totalPrice: 2000.00,
        totalCost: 2000.00,
        description: 'Hernando/Citrus county building permit processing, plan review, zoning, and health inspections ($2,000 standard).'
      },
      {
        id: 'li-7',
        sku: 'SITE-SKIRTING-VINYL',
        name: 'Vented Vinyl Perimeter Skirting & Steps (2 Sets)',
        category: 'mandatory_services',
        unitPrice: 3200.00,
        unitCost: 2200.00,
        quantity: 1,
        totalPrice: 3200.00,
        totalCost: 2200.00,
        description: 'Full perimeter vinyl skirting with ground channel and 2 sets of code stairs.'
      }
    ],
    subtotal: 179300.00,
    financedSubtotal: 179300.00,
    nonFinancedSubtotal: 0,
    taxBasis: 179300.00,
    salesTax: 5379.00,
    totalTurnkeyPrice: 184679.00,
    estimatedTotal: 184679.00,
    downPaymentPercent: 10,
    downPaymentAmount: 18467.90,
    estimatedMonthlyPayment: 1058,
    notes: 'FHA pre-approval with local Florida manufactured lender. Turnkey site work scheduled.',
    notesCustomer: 'Turnkey land and home package proposal for Homosassa homesite.',
    notesInternal: 'FHA pre-approval active.',
    shareToken: 'quote-1',
    createdAt: '2026-08-07T09:30:00Z',
    updatedAt: '2026-08-07T09:30:00Z'
  },
  {
    id: 'quote-2',
    quoteNumber: 'Q-2026-0802',
    quoteDate: '2026-08-02',
    customerName: 'Carlos Mendez',
    customerPhone: '813-555-0481',
    customerEmail: 'cmendez88@example.com',
    customerAddress: 'Buyer Owned Land, Spring Hill, FL',
    salesperson: 'Alex Vorasane',
    salespersonEmail: 'alex@easyhomesource.com',
    status: 'SENT_TO_BUYER',
    homeModel: 'The Tulip (TRT12482PH)',
    manufacturer: 'CLAYTON TRU',
    beds: 2,
    baths: 1,
    sqft: 576,
    dimensions: "12' x 48'",
    homeWidth: 12,
    homeLength: 48,
    homePrice: 39888.00,
    factoryCost: 28719.36,
    propertyAddress: 'Buyer Owned Land (Spring Hill, FL)',
    propertyPrice: 0.00,
    deliveryRouteType: 'dealer_to_customer',
    deliveryMiles: 25,
    escortsCount: 1,
    freightDelivery: 3850.00,
    siteWorkTotal: 28900.00,
    discounts: 0,
    lineItems: [],
    subtotal: 72638.00,
    taxBasis: 72638.00,
    salesTax: 2179.14,
    totalTurnkeyPrice: 74817.14,
    estimatedTotal: 74817.14,
    downPaymentPercent: 10,
    downPaymentAmount: 7481.71,
    estimatedMonthlyPayment: 440,
    notes: 'Customer owns private 0.75 acre lot in Hernando County. Standard well & septic hookup.',
    shareToken: 'quote-2',
    createdAt: '2026-08-07T08:45:00Z',
    updatedAt: '2026-08-07T08:45:00Z'
  },
  {
    id: 'quote-3',
    quoteNumber: 'Q-2026-0803',
    quoteDate: '2026-08-03',
    customerName: 'David & Michelle Miller',
    customerPhone: '352-555-0331',
    customerEmail: 'millerfamilyfl@example.com',
    customerAddress: '9248 Denmarsh Dr, Brooksville, FL',
    salesperson: 'CJ Cornett',
    salespersonEmail: 'cj@easyhomesource.com',
    status: 'IN_CONTRACT',
    homeModel: 'Oak (4b/2ba Double Wide)',
    manufacturer: 'LEGACY',
    beds: 4,
    baths: 2,
    sqft: 1800,
    dimensions: "28' x 64'",
    homeWidth: 28,
    homeLength: 64,
    homePrice: 84608.00,
    factoryCost: 60917.76,
    propertyAddress: '9248 Denmarsh Dr, Brooksville, FL 34601',
    propertyPrice: 47500.00,
    deliveryRouteType: 'dealer_to_customer',
    deliveryMiles: 18,
    escortsCount: 2,
    freightDelivery: 4200.00,
    siteWorkTotal: 66192.00,
    discounts: 0,
    lineItems: [],
    subtotal: 202500.00,
    taxBasis: 202500.00,
    salesTax: 6075.00,
    totalTurnkeyPrice: 208575.00,
    estimatedTotal: 208575.00,
    downPaymentPercent: 10,
    downPaymentAmount: 20857.50,
    estimatedMonthlyPayment: 1220,
    notes: 'Land & home package deal in Denmarsh Woods. Escrow earnest deposit received.',
    shareToken: 'quote-3',
    createdAt: '2026-08-06T16:15:00Z',
    updatedAt: '2026-08-06T16:15:00Z'
  },
  {
    id: 'quote-4',
    quoteNumber: 'Q-2026-0804',
    quoteDate: '2026-08-04',
    customerName: 'Robert Vance Contracting',
    customerPhone: '727-555-0819',
    customerEmail: 'rvance.contracting@example.com',
    customerAddress: '5043 Southtowne Loop, New Port Richey, FL',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    status: 'LENDER_REVIEW',
    homeModel: '15 On-Stilts Coastal Multi-Site Package',
    manufacturer: 'Timber Creek',
    beds: 3,
    baths: 2,
    sqft: 1440,
    dimensions: "24' x 60'",
    homeWidth: 24,
    homeLength: 60,
    homePrice: 0.00,
    factoryCost: 0.00,
    propertyAddress: '5043 Southtowne Loop, New Port Richey, FL 34652',
    propertyPrice: 685000.00,
    freightDelivery: 15000.00,
    siteWorkTotal: 210000.00,
    discounts: 0,
    lineItems: [],
    subtotal: 910000.00,
    taxBasis: 910000.00,
    salesTax: 27300.00,
    totalTurnkeyPrice: 937300.00,
    estimatedTotal: 937300.00,
    notes: 'Institutional builder coastal development package with Pasco County site development approvals.',
    shareToken: 'quote-4',
    createdAt: '2026-08-06T14:00:00Z',
    updatedAt: '2026-08-06T14:00:00Z'
  },
  {
    id: 'quote-5',
    quoteNumber: 'Q-2026-0805',
    quoteDate: '2026-08-05',
    customerName: 'Angela Robinson',
    customerPhone: '352-555-0722',
    customerEmail: 'arobinson.fl@example.com',
    customerAddress: '9868 Lake Dr, Spring Hill, FL',
    salesperson: 'Alex Vorasane',
    salespersonEmail: 'alex@easyhomesource.com',
    status: 'APPROVED',
    homeModel: 'Dogwood (2b/2ba Single Wide)',
    manufacturer: 'CLAYTON Addison',
    beds: 2,
    baths: 2,
    sqft: 840,
    dimensions: "14' x 60'",
    homeWidth: 14,
    homeLength: 60,
    homePrice: 61900.00,
    factoryCost: 44568.00,
    propertyAddress: '9868 Lake Dr, Spring Hill, FL 34606',
    propertyPrice: 54900.00,
    freightDelivery: 3850.00,
    siteWorkTotal: 51900.00,
    discounts: 0,
    lineItems: [],
    subtotal: 172550.00,
    taxBasis: 172550.00,
    salesTax: 5176.50,
    totalTurnkeyPrice: 177726.50,
    estimatedTotal: 177726.50,
    notes: 'Approved for USDA Rural Development 100% financing option.',
    shareToken: 'quote-5',
    createdAt: '2026-08-05T11:20:00Z',
    updatedAt: '2026-08-05T11:20:00Z'
  },
  {
    id: 'quote-6',
    quoteNumber: 'Q-2026-0806',
    quoteDate: '2026-08-06',
    customerName: 'Thomas & Brenda Wright',
    customerPhone: '813-555-0914',
    customerEmail: 'twright.tampa@example.com',
    customerAddress: '18810 St Paul Dr, Spring Hill, FL',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    status: 'SENT_TO_BUYER',
    homeModel: 'Boujee XL 2 (4b/3ba Luxury Master)',
    manufacturer: 'CLAYTON Addison',
    beds: 4,
    baths: 3,
    sqft: 2040,
    dimensions: "32' x 68'",
    homeWidth: 32,
    homeLength: 68,
    homePrice: 147374.00,
    factoryCost: 106109.28,
    propertyAddress: '18810 St Paul Dr, Spring Hill, FL 34610',
    propertyPrice: 199900.00,
    freightDelivery: 4500.00,
    siteWorkTotal: 50000.00,
    discounts: 0,
    lineItems: [],
    subtotal: 401774.00,
    taxBasis: 401774.00,
    salesTax: 12053.22,
    totalTurnkeyPrice: 413827.22,
    estimatedTotal: 413827.22,
    notes: 'Luxury acreage package on 0.50-acre high-and-dry site.',
    shareToken: 'quote-6',
    createdAt: '2026-08-04T15:40:00Z',
    updatedAt: '2026-08-04T15:40:00Z'
  },
  {
    id: 'quote-7',
    quoteNumber: 'Q-2026-0807',
    quoteDate: '2026-08-07',
    customerName: 'Patricia Cole',
    customerPhone: '352-555-0648',
    customerEmail: 'pcole.citrus@example.com',
    customerAddress: '7112 Fitzpatrick Ave, Brooksville, FL',
    salesperson: 'CJ Cornett',
    salespersonEmail: 'cj@easyhomesource.com',
    status: 'DRAFT',
    homeModel: 'Born to Run (2b/2ba)',
    manufacturer: 'CLAYTON Addison',
    beds: 2,
    baths: 2,
    sqft: 1120,
    dimensions: "16' x 70'",
    homeWidth: 16,
    homeLength: 70,
    homePrice: 89875.00,
    factoryCost: 64710.00,
    propertyAddress: '7112 Fitzpatrick Ave, Brooksville, FL 34601',
    propertyPrice: 49900.00,
    freightDelivery: 3850.00,
    siteWorkTotal: 34500.00,
    discounts: 0,
    lineItems: [],
    subtotal: 178125.00,
    taxBasis: 178125.00,
    salesTax: 5343.75,
    totalTurnkeyPrice: 183468.75,
    estimatedTotal: 183468.75,
    notes: 'Draft proposal prepared for Brooksville in-person consultation.',
    shareToken: 'quote-7',
    createdAt: '2026-08-04T09:15:00Z',
    updatedAt: '2026-08-04T09:15:00Z'
  },
  {
    id: 'quote-8',
    quoteNumber: 'Q-2026-0808',
    quoteDate: '2026-08-08',
    customerName: 'Marcus & Elena Davis',
    customerPhone: '352-555-0782',
    customerEmail: 'mdavis.zephyr@example.com',
    customerAddress: '26314 Glenwood Dr, Zephyrhills, FL',
    salesperson: 'Alex Vorasane',
    salespersonEmail: 'alex@easyhomesource.com',
    status: 'LENDER_REVIEW',
    homeModel: 'Classic C-1672-32C (3b/2ba)',
    manufacturer: 'LEGACY',
    beds: 3,
    baths: 2,
    sqft: 1152,
    dimensions: "16' x 72'",
    homeWidth: 16,
    homeLength: 72,
    homePrice: 83447.00,
    factoryCost: 60081.84,
    propertyAddress: '26314 Glenwood Dr, Zephyrhills, FL 33544',
    propertyPrice: 55000.00,
    freightDelivery: 3950.00,
    siteWorkTotal: 49953.00,
    discounts: 0,
    lineItems: [],
    subtotal: 192350.00,
    taxBasis: 192350.00,
    salesTax: 5770.50,
    totalTurnkeyPrice: 198120.50,
    estimatedTotal: 198120.50,
    notes: 'Conventional land-home mortgage submission with 21st Mortgage.',
    shareToken: 'quote-8',
    createdAt: '2026-08-03T14:10:00Z',
    updatedAt: '2026-08-03T14:10:00Z'
  },
  {
    id: 'quote-9',
    quoteNumber: 'Q-2026-0809',
    quoteDate: '2026-08-08',
    customerName: 'Gregory Harrison',
    customerPhone: '813-555-0329',
    customerEmail: 'gharrison.fl@example.com',
    customerAddress: '18034 Ferry Ave, Brooksville, FL',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    status: 'APPROVED',
    homeModel: 'Paxton 28523A Elite (3b/2ba)',
    manufacturer: 'Cavco Douglas',
    beds: 3,
    baths: 2,
    sqft: 1456,
    dimensions: "28' x 52'",
    homeWidth: 28,
    homeLength: 52,
    homePrice: 158888.00,
    factoryCost: 114399.36,
    propertyAddress: '18034 Ferry Ave, Brooksville, FL 34601',
    propertyPrice: 35000.00,
    freightDelivery: 4500.00,
    siteWorkTotal: 31012.00,
    discounts: 0,
    lineItems: [],
    subtotal: 229400.00,
    taxBasis: 229400.00,
    salesTax: 6882.00,
    totalTurnkeyPrice: 236282.00,
    estimatedTotal: 236282.00,
    notes: 'Approved buyer with excellent credit. Full acre lot package.',
    shareToken: 'quote-9',
    createdAt: '2026-08-03T11:45:00Z',
    updatedAt: '2026-08-03T11:45:00Z'
  },
  {
    id: 'quote-10',
    quoteNumber: 'Q-2026-0810',
    quoteDate: '2026-08-08',
    customerName: 'Jennifer Walsh',
    customerPhone: '352-555-0811',
    customerEmail: 'jwalsh.springhill@example.com',
    customerAddress: '9254 Denmarsh Dr, Brooksville, FL',
    salesperson: 'CJ Cornett',
    salespersonEmail: 'cj@easyhomesource.com',
    status: 'IN_CONTRACT',
    homeModel: 'Atmos 28603N Architectural (3b/2ba)',
    manufacturer: 'CLAYTON Addison',
    beds: 3,
    baths: 2,
    sqft: 1680,
    dimensions: "28' x 60'",
    homeWidth: 28,
    homeLength: 60,
    homePrice: 159324.00,
    factoryCost: 114713.28,
    propertyAddress: '9254 Denmarsh Dr, Brooksville, FL 34601',
    propertyPrice: 47500.00,
    freightDelivery: 4500.00,
    siteWorkTotal: 12976.00,
    discounts: 0,
    lineItems: [],
    subtotal: 224300.00,
    taxBasis: 224300.00,
    salesTax: 6729.00,
    totalTurnkeyPrice: 231029.00,
    estimatedTotal: 231029.00,
    notes: 'Contemporary double-wide design on half-acre lot.',
    shareToken: 'quote-10',
    createdAt: '2026-08-02T16:30:00Z',
    updatedAt: '2026-08-02T16:30:00Z'
  },
  {
    id: 'quote-11',
    quoteNumber: 'Q-2026-0811',
    quoteDate: '2026-08-08',
    customerName: 'Raymond Diaz Development',
    customerPhone: '352-555-0994',
    customerEmail: 'rdiaz.properties@example.com',
    customerAddress: '1295 S Rock Crusher Rd, Homosassa, FL',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    status: 'LENDER_REVIEW',
    homeModel: '23-Lot Master Subdivision Package',
    manufacturer: 'Multi-Manufacturer',
    beds: 3,
    baths: 2,
    sqft: 1500,
    dimensions: "28' x 56'",
    homeWidth: 28,
    homeLength: 56,
    homePrice: 0.00,
    factoryCost: 0.00,
    propertyAddress: '1295 S Rock Crusher Rd, Homosassa, FL 34448',
    propertyPrice: 1150000.00,
    freightDelivery: 25000.00,
    siteWorkTotal: 330000.00,
    discounts: 0,
    lineItems: [],
    subtotal: 1505000.00,
    taxBasis: 1505000.00,
    salesTax: 45150.00,
    totalTurnkeyPrice: 1550150.00,
    estimatedTotal: 1550150.00,
    notes: 'Subdivision infrastructure and utility installation proposal.',
    shareToken: 'quote-11',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z'
  },
  {
    id: 'quote-12',
    quoteNumber: 'Q-2026-0812',
    quoteDate: '2026-08-08',
    customerName: 'Kevin & Lisa Brooks',
    customerPhone: '813-555-0217',
    customerEmail: 'brooksfamily.fl@example.com',
    customerAddress: '26007 Shangri Dr, Brooksville, FL',
    salesperson: 'Alex Vorasane',
    salespersonEmail: 'alex@easyhomesource.com',
    status: 'SENT_TO_BUYER',
    homeModel: 'Craft Select 28603A (3b/2ba)',
    manufacturer: 'CLAYTON Addison',
    beds: 3,
    baths: 2,
    sqft: 1680,
    dimensions: "28' x 60'",
    homeWidth: 28,
    homeLength: 60,
    homePrice: 125540.00,
    factoryCost: 90388.80,
    propertyAddress: '26007 Shangri Dr, Brooksville, FL 34601',
    propertyPrice: 48000.00,
    freightDelivery: 4500.00,
    siteWorkTotal: 30960.00,
    discounts: 0,
    lineItems: [],
    subtotal: 209000.00,
    taxBasis: 209000.00,
    salesTax: 6270.00,
    totalTurnkeyPrice: 215270.00,
    estimatedTotal: 215270.00,
    notes: 'Craftsman double wide package on Shangri-La parcel.',
    shareToken: 'quote-12',
    createdAt: '2026-08-01T15:20:00Z',
    updatedAt: '2026-08-01T15:20:00Z'
  },
  {
    id: 'quote-13',
    quoteNumber: 'Q-2026-0813',
    quoteDate: '2026-08-08',
    customerName: 'Anthony Russo',
    customerPhone: '352-555-0442',
    customerEmail: 'arusso.tampa@example.com',
    customerAddress: 'Private Acreage, Citrus County, FL',
    salesperson: 'CJ Cornett',
    salespersonEmail: 'cj@easyhomesource.com',
    status: 'APPROVED',
    homeModel: 'Hey Jude (5b/2ba Massive Layout)',
    manufacturer: 'CLAYTON Addison',
    beds: 5,
    baths: 2,
    sqft: 2100,
    dimensions: "32' x 72'",
    homeWidth: 32,
    homeLength: 72,
    homePrice: 128101.00,
    factoryCost: 92232.72,
    propertyAddress: 'Private Acreage (Citrus County, FL)',
    propertyPrice: 0.00,
    freightDelivery: 4800.00,
    siteWorkTotal: 54499.00,
    discounts: 0,
    lineItems: [],
    subtotal: 187400.00,
    taxBasis: 187400.00,
    salesTax: 5622.00,
    totalTurnkeyPrice: 193022.00,
    estimatedTotal: 193022.00,
    notes: '5-bedroom home setup on family land in Citrus County.',
    shareToken: 'quote-13',
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-01T11:00:00Z'
  },
  {
    id: 'quote-14',
    quoteNumber: 'Q-2026-0814',
    quoteDate: '2026-08-08',
    customerName: 'Kimberly Scott',
    customerPhone: '352-555-0158',
    customerEmail: 'kscott.springhill@example.com',
    customerAddress: '9862 Lake Dr, Spring Hill, FL',
    salesperson: 'Alex Vorasane',
    salespersonEmail: 'alex@easyhomesource.com',
    status: 'DRAFT',
    homeModel: 'The Tulip (TRT12482PH)',
    manufacturer: 'CLAYTON TRU',
    beds: 2,
    baths: 1,
    sqft: 576,
    dimensions: "12' x 48'",
    homeWidth: 12,
    homeLength: 48,
    homePrice: 39888.00,
    factoryCost: 28719.36,
    propertyAddress: '9862 Lake Dr, Spring Hill, FL 34606',
    propertyPrice: 54900.00,
    freightDelivery: 3850.00,
    siteWorkTotal: 1612.00,
    discounts: 0,
    lineItems: [],
    subtotal: 100250.00,
    taxBasis: 100250.00,
    salesTax: 3007.50,
    totalTurnkeyPrice: 103257.50,
    estimatedTotal: 103257.50,
    notes: 'Budget starter home paired with vacant Lake Dr lot.',
    shareToken: 'quote-14',
    createdAt: '2026-07-31T14:30:00Z',
    updatedAt: '2026-07-31T14:30:00Z'
  },
  {
    id: 'quote-15',
    quoteNumber: 'Q-2026-0815',
    quoteDate: '2026-08-08',
    customerName: 'Brian O’Connor',
    customerPhone: '813-555-0901',
    customerEmail: 'boconnor.fl@example.com',
    customerAddress: '716 Hazel Ave, Brooksville, FL',
    salesperson: 'Scott Pierpont',
    salespersonEmail: 'scott@easyhomesource.com',
    status: 'LENDER_REVIEW',
    homeModel: 'Maple (28x48 3b/2ba)',
    manufacturer: 'LEGACY',
    beds: 3,
    baths: 2,
    sqft: 1344,
    dimensions: "28' x 48'",
    homeWidth: 28,
    homeLength: 48,
    homePrice: 98000.00,
    factoryCost: 70560.00,
    propertyAddress: '716 Hazel Ave, Brooksville, FL 34601',
    propertyPrice: 32000.00,
    freightDelivery: 4200.00,
    siteWorkTotal: 29800.00,
    discounts: 0,
    lineItems: [],
    subtotal: 164000.00,
    taxBasis: 164000.00,
    salesTax: 4920.00,
    totalTurnkeyPrice: 168920.00,
    estimatedTotal: 168920.00,
    notes: 'Infill lot package in downtown Brooksville.',
    shareToken: 'quote-15',
    createdAt: '2026-07-30T16:00:00Z',
    updatedAt: '2026-07-30T16:00:00Z'
  }
];

const STORAGE_KEY = 'ehs_saved_quotes';

export function getSavedQuotes(): SavedQuote[] {
  if (typeof window === 'undefined') {
    return INITIAL_SAVED_QUOTES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAVED_QUOTES));
      return INITIAL_SAVED_QUOTES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAVED_QUOTES));
      return INITIAL_SAVED_QUOTES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load quotes from storage:', err);
    return INITIAL_SAVED_QUOTES;
  }
}

export function getSavedQuoteById(id: string): SavedQuote | null {
  const all = getSavedQuotes();
  const found = all.find(
    (q) => q.id === id || q.quoteNumber === id || q.shareToken === id
  );
  if (found) return found;

  // Fallback match by removing prefix/special characters
  const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  return (
    all.find((q) => {
      const qClean = q.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const numClean = q.quoteNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
      return qClean.includes(cleanId) || numClean.includes(cleanId);
    }) || null
  );
}

export function saveQuoteToStore(quote: SavedQuote): SavedQuote {
  const all = getSavedQuotes();
  const existingIdx = all.findIndex(
    (q) => q.id === quote.id || q.quoteNumber === quote.quoteNumber
  );

  let updatedList: SavedQuote[];
  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = {
      ...quote,
      updatedAt: new Date().toISOString()
    };
  } else {
    updatedList = [
      {
        ...quote,
        createdAt: quote.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...all
    ];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('ehs_quotes_updated'));
    } catch (err) {
      console.error('Failed to save quotes to storage:', err);
    }
  }

  return quote;
}

export function deleteQuoteFromStore(id: string): boolean {
  const all = getSavedQuotes();
  const updatedList = all.filter((q) => q.id !== id && q.quoteNumber !== id);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('ehs_quotes_updated'));
    } catch (err) {
      console.error('Failed to delete quote from storage:', err);
      return false;
    }
  }
  return true;
}
