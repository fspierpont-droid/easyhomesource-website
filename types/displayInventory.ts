export type DisplayStatus =
  | 'ON_LOT_DISPLAY'
  | 'ORDERED_AT_FACTORY'
  | 'IN_TRANSIT'
  | 'SETUP_IN_PROGRESS'
  | 'DECOMMISSIONED';

export interface DisplayHomeRecord {
  id: string;
  stockNumber: string;
  modelName: string;
  manufacturer: string;
  series?: string;
  serialNumber: string;
  dimensions: string;
  beds: number;
  baths: number;
  squareFeet: number;
  displayStatus: DisplayStatus;
  padLocation: string; // e.g. "Pad #1 - Highway Frontage"
  orderDate: string;
  deliveryDate?: string;
  
  // Financial & Banking tracking (Floorplan financing)
  bankUsed: string; // e.g. "21st Mortgage Floorplan", "Triad Financial", "North Mill Capital"
  financeAmount: number; // Floorplan line drawn
  wholesaleInvoice: number; // Manufacturer invoice cost
  transportCost: number; // Freight from plant to Brooksville
  lotSetupCost: number; // Blocking, tie-downs, A/C, skirting, stairs
  interestRateFloorplan: number; // e.g. 7.25%
  monthlyCurtailment?: number; // Monthly floorplan holding fee

  optionsIncluded: string[];
  notes: string;
  keyBoxCode: string;
  updatedAt: string;
}

export const INITIAL_DISPLAY_INVENTORY: DisplayHomeRecord[] = [
  {
    id: 'disp-001',
    stockNumber: 'DISP-2026-01',
    modelName: 'The Tulip (TRT12482PH)',
    manufacturer: 'Clayton TRU',
    series: 'TRU Mini',
    serialNumber: 'CLY-TRU-FL-884920-A',
    dimensions: "12' x 48'",
    beds: 2,
    baths: 1,
    squareFeet: 544,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #1 - Front Highway Entrance',
    orderDate: '2026-05-10',
    deliveryDate: '2026-06-15',
    bankUsed: '21st Mortgage Floorplan',
    financeAmount: 28400,
    wholesaleInvoice: 27900,
    transportCost: 2850,
    lotSetupCost: 3600,
    interestRateFloorplan: 7.25,
    monthlyCurtailment: 380,
    optionsIncluded: [
      'Upgraded Thermal Zone 3 Insulation',
      'Dual-glazed vinyl low-E windows',
      '50-gallon water heater upgrade',
      'Full vinyl linoleum flooring'
    ],
    notes: 'Featured starting at $39,888 display leader. Heavy foot traffic walkthrough model.',
    keyBoxCode: '4920',
    updatedAt: '2026-08-07'
  },
  {
    id: 'disp-002',
    stockNumber: 'DISP-2026-02',
    modelName: 'Dogwood (DOG-14602)',
    manufacturer: 'Cavco Plant City',
    series: 'TRU Origin',
    serialNumber: 'CAV-PC-2026-10492-AB',
    dimensions: "14' x 60'",
    beds: 2,
    baths: 2,
    squareFeet: 790,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #2 - Center Display Row',
    orderDate: '2026-05-18',
    deliveryDate: '2026-06-28',
    bankUsed: 'Triad Financial Services',
    financeAmount: 46500,
    wholesaleInvoice: 45200,
    transportCost: 3200,
    lotSetupCost: 4100,
    interestRateFloorplan: 6.95,
    monthlyCurtailment: 510,
    optionsIncluded: [
      'Split 2-bath privacy package',
      'Deluxe kitchen appliance package (black)',
      'Front porch landing steps'
    ],
    notes: 'On display in Brooksville. Clean interior staging.',
    keyBoxCode: '1049',
    updatedAt: '2026-08-06'
  },
  {
    id: 'disp-003',
    stockNumber: 'DISP-2026-03',
    modelName: 'Classic C-1672-32C',
    manufacturer: 'Legacy Housing',
    series: 'Classic Collection',
    serialNumber: 'LEG-FL-49201-A',
    dimensions: "16' x 72'",
    beds: 3,
    baths: 2,
    squareFeet: 1068,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #3 - East Model Row',
    orderDate: '2026-06-01',
    deliveryDate: '2026-07-10',
    bankUsed: '21st Mortgage Floorplan',
    financeAmount: 62000,
    wholesaleInvoice: 60500,
    transportCost: 3800,
    lotSetupCost: 4400,
    interestRateFloorplan: 7.25,
    monthlyCurtailment: 680,
    optionsIncluded: [
      'Open concept living and dining',
      'Walk-in primary closet',
      'Hardwood cabinetry upgrades'
    ],
    notes: 'Very popular 3-bedroom display layout.',
    keyBoxCode: '4921',
    updatedAt: '2026-08-06'
  },
  {
    id: 'disp-004',
    stockNumber: 'DISP-2026-04',
    modelName: 'Born to Run (BTR-16602)',
    manufacturer: 'Timber Creek Housing',
    series: 'Tempo Series',
    serialNumber: 'TC-CSFL-2026-981',
    dimensions: "16' x 60'",
    beds: 2,
    baths: 2,
    squareFeet: 900,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #4 - Center Walkway',
    orderDate: '2026-06-12',
    deliveryDate: '2026-07-20',
    bankUsed: 'North Mill Capital',
    financeAmount: 65800,
    wholesaleInvoice: 64200,
    transportCost: 3900,
    lotSetupCost: 4500,
    interestRateFloorplan: 7.50,
    monthlyCurtailment: 720,
    optionsIncluded: [
      'Kitchen island with bar seating',
      'Luxury vinyl plank flooring throughout',
      'Recessed LED can lighting'
    ],
    notes: 'Contemporary modern exterior finish on lot.',
    keyBoxCode: '0981',
    updatedAt: '2026-08-05'
  },
  {
    id: 'disp-005',
    stockNumber: 'DISP-2026-05',
    modelName: 'Move on Up (MOU-18603)',
    manufacturer: 'Clayton Addison',
    series: 'Tempo Series',
    serialNumber: 'CLY-ADD-2026-77192',
    dimensions: "18' x 60'",
    beds: 3,
    baths: 2,
    squareFeet: 1080,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #5 - Premier Frontage',
    orderDate: '2026-06-20',
    deliveryDate: '2026-07-28',
    bankUsed: '21st Mortgage Floorplan',
    financeAmount: 69400,
    wholesaleInvoice: 67800,
    transportCost: 4100,
    lotSetupCost: 4800,
    interestRateFloorplan: 7.25,
    monthlyCurtailment: 760,
    optionsIncluded: [
      '18-foot extra wide single section frame',
      'Upgraded residential 2x6 exterior walls',
      'Stainless steel kitchen suite'
    ],
    notes: 'Highest lead conversion 3-bedroom on display.',
    keyBoxCode: '7719',
    updatedAt: '2026-08-05'
  },
  {
    id: 'disp-006',
    stockNumber: 'DISP-2026-06',
    modelName: 'Oak (OAK-28544 Double Wide)',
    manufacturer: 'Legacy Housing',
    series: 'Classic Collection',
    serialNumber: 'LEG-DW-2026-00481-AB',
    dimensions: "28' x 54'",
    beds: 4,
    baths: 2,
    squareFeet: 1475,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #6 - Multi-Section Display Pad A',
    orderDate: '2026-06-25',
    deliveryDate: '2026-08-01',
    bankUsed: 'Triad Financial Services',
    financeAmount: 74200,
    wholesaleInvoice: 72000,
    transportCost: 5200,
    lotSetupCost: 6500,
    interestRateFloorplan: 6.95,
    monthlyCurtailment: 815,
    optionsIncluded: [
      '4 full bedrooms with walk-in closets',
      'Double vanity in master suite',
      'Dual section crane and set tie-downs'
    ],
    notes: 'Affordable family double wide under $100k MSRP.',
    keyBoxCode: '0481',
    updatedAt: '2026-08-04'
  },
  {
    id: 'disp-007',
    stockNumber: 'DISP-2026-07',
    modelName: 'Paxton (28523A Elite)',
    manufacturer: 'Palm Harbor Plant City',
    series: 'Elite Series',
    serialNumber: 'PH-PC-2026-99201-AB',
    dimensions: "28' x 52'",
    beds: 3,
    baths: 2,
    squareFeet: 1394,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #7 - Multi-Section Display Pad B',
    orderDate: '2026-07-01',
    deliveryDate: '2026-08-03',
    bankUsed: 'First American Floorplan',
    financeAmount: 114000,
    wholesaleInvoice: 111500,
    transportCost: 5600,
    lotSetupCost: 7200,
    interestRateFloorplan: 6.85,
    monthlyCurtailment: 1250,
    optionsIncluded: [
      'Heavy-duty 28-wide floor system',
      'Craftsman exterior trim & shutters',
      'Designer ceramic tile accents'
    ],
    notes: 'Premium luxury Palm Harbor model on lot.',
    keyBoxCode: '9920',
    updatedAt: '2026-08-04'
  },
  {
    id: 'disp-008',
    stockNumber: 'DISP-2026-08',
    modelName: 'Boujee XL 2 (4b/3ba Luxury)',
    manufacturer: 'Clayton Addison',
    series: 'Boujee Series',
    serialNumber: 'CLY-BOU-2026-44120-AB',
    dimensions: "32' x 64'",
    beds: 4,
    baths: 3,
    squareFeet: 1980,
    displayStatus: 'ON_LOT_DISPLAY',
    padLocation: 'Pad #8 - Flagship Display Pad',
    orderDate: '2026-07-05',
    deliveryDate: '2026-08-05',
    bankUsed: '21st Mortgage Floorplan',
    financeAmount: 118500,
    wholesaleInvoice: 116000,
    transportCost: 5900,
    lotSetupCost: 7800,
    interestRateFloorplan: 7.25,
    monthlyCurtailment: 1310,
    optionsIncluded: [
      'Freestanding soaking tub & walk-in shower',
      'Chef entertainment kitchen with double island',
      '3 full designer bathrooms'
    ],
    notes: 'Flagship luxury home on Brooksville display lot.',
    keyBoxCode: '4412',
    updatedAt: '2026-08-03'
  },
  {
    id: 'disp-009',
    stockNumber: 'DISP-2026-09',
    modelName: 'Maple (28x48 3b/2ba)',
    manufacturer: 'Clayton TRU',
    series: 'TRU Origin',
    serialNumber: 'CLY-TRU-2026-88901',
    dimensions: "28' x 48'",
    beds: 3,
    baths: 2,
    squareFeet: 1264,
    displayStatus: 'ORDERED_AT_FACTORY',
    padLocation: 'Pad #9 - Staging Queue',
    orderDate: '2026-07-25',
    deliveryDate: '2026-08-22',
    bankUsed: 'Triad Financial Services',
    financeAmount: 58000,
    wholesaleInvoice: 56500,
    transportCost: 4200,
    lotSetupCost: 5100,
    interestRateFloorplan: 6.95,
    monthlyCurtailment: 635,
    optionsIncluded: [
      'New arrival factory order',
      'Energy Smart home package',
      'Ecobee smart thermostat'
    ],
    notes: 'Factory offline scheduled for August 18; delivery to lot expected August 22.',
    keyBoxCode: 'TBD',
    updatedAt: '2026-08-07'
  },
  {
    id: 'disp-010',
    stockNumber: 'DISP-2026-10',
    modelName: 'The White Oak (CS-3221)',
    manufacturer: 'Timber Creek Housing',
    series: 'Creekside Series',
    serialNumber: 'TC-CS-2026-3221-AB',
    dimensions: "30' x 76'",
    beds: 3,
    baths: 2,
    squareFeet: 2280,
    displayStatus: 'IN_TRANSIT',
    padLocation: 'Pad #10 - Rear Display Pad',
    orderDate: '2026-07-15',
    deliveryDate: '2026-08-12',
    bankUsed: 'North Mill Capital',
    financeAmount: 124000,
    wholesaleInvoice: 121500,
    transportCost: 6100,
    lotSetupCost: 8200,
    interestRateFloorplan: 7.50,
    monthlyCurtailment: 1360,
    optionsIncluded: [
      'Massive 2,280 sq ft layout',
      'Fireplace with shiplap wall accent',
      'Barn door interior accents'
    ],
    notes: 'In transit from Alabama factory to Brooksville. Freight carrier dispatch confirmed.',
    keyBoxCode: '3221',
    updatedAt: '2026-08-07'
  },
  {
    id: 'disp-011',
    stockNumber: 'DISP-2026-11',
    modelName: 'The Delilah (CSFL-3301)',
    manufacturer: 'Timber Creek Housing',
    series: 'Creekside Series',
    serialNumber: 'TC-CSFL-2026-3301-AB',
    dimensions: "30' x 76'",
    beds: 4,
    baths: 2,
    squareFeet: 2280,
    displayStatus: 'SETUP_IN_PROGRESS',
    padLocation: 'Pad #11 - North Staging',
    orderDate: '2026-07-10',
    deliveryDate: '2026-08-02',
    bankUsed: 'First American Floorplan',
    financeAmount: 126000,
    wholesaleInvoice: 123800,
    transportCost: 6100,
    lotSetupCost: 8500,
    interestRateFloorplan: 6.85,
    monthlyCurtailment: 1380,
    optionsIncluded: [
      '4 bedrooms with family activity room',
      'Gourmet kitchen with double wall ovens',
      'Wrap-around front display deck'
    ],
    notes: 'Delivered to Brooksville lot August 2; setup crew currently finishing drywall marriage line and stairs.',
    keyBoxCode: '3301',
    updatedAt: '2026-08-07'
  }
];
