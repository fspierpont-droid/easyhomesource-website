import {
  SERVICE_CATALOG as BASE_SERVICE_CATALOG,
  type ServiceCatalogItem,
} from './masterQuote5PricingV2';

export * from './masterQuote5PricingV2';

function flat(
  sku: string,
  name: string,
  category: ServiceCatalogItem['category'],
  cost: number,
  price: number,
  description: string,
): ServiceCatalogItem {
  return {
    sku,
    name,
    category,
    categoryTitle: category === 'addons' ? 'Add-Ons' : 'Site Work',
    defaultCost: cost,
    defaultPrice: price,
    description,
    calcType: 'flat',
    unit: 'job',
  };
}

const replaced = new Set([
  'ELEC-POLE-PANEL',
  'ELEC-HOOKUP',
  'SITE-DEMO-BID',
  'SITE-CLEARING-BID',
]);

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  ...BASE_SERVICE_CATALOG.filter((item) => !replaced.has(item.sku)),

  flat('ELEC-PANEL-SWITCH-UPDATE', 'Electric - Switch / Update Panel', 'addons', 600, 660,
    'Master Quote 5 electrical component. Charge only when the site needs an existing-panel switch/update.'),
  flat('ELEC-PANEL-NEW-POST', 'Electric - New Post + Panel', 'addons', 1250, 1375,
    'Master Quote 5 electrical component. Charge only when a new post and panel are required.'),
  flat('ELEC-WIRE-HOOKUP-50', 'Electric - Wire Hookup & Conduit (up to 50 ft)', 'addons', 1100, 1210,
    'Wire hookup and conduit from pole to panel, up to 50 ft.'),
  flat('ELEC-AC-DISCONNECT', 'Electric - A/C Disconnect Installation', 'addons', 500, 550,
    'A/C disconnect installation.'),
  flat('ELEC-WELL-CONNECTION', 'Electric - Well Electric Connection', 'addons', 700, 770,
    'Electrical connection for well equipment.'),

  flat('SITE-DEMO-LIGHT', 'Demolition - Light Demo', 'site_work', 2000, 4000,
    'Trash, small debris, shrubs/fencing; hand tools or small equipment; no ground disturbance.'),
  flat('SITE-DEMO-SURFACE', 'Demolition - Surface Removal / Small Machinery', 'site_work', 4000, 8000,
    'Surface-level removal using small machinery with minimal excavation.'),
  flat('SITE-DEMO-SHALLOW', 'Demolition - Shallow Demolition & Grading', 'site_work', 8000, 10000,
    'Removal of slabs, footings and shallow foundations with light excavation/rough grading.'),
  flat('SITE-DEMO-HEAVY', 'Demolition - Heavy Removal & Earthwork', 'site_work', 8000, 12000,
    'Old foundations, utilities/buried debris, cut/fill, compaction and structural ground modification.'),
  flat('SITE-DEMO-FULL', 'Demolition - Full Site Demolition & Reconditioning', 'site_work', 12000, 16000,
    'Complete removal of structures/subsurface elements plus soil replacement, stabilization and drainage work.'),

  flat('SITE-CLEAR-LIGHT', 'Land Clearing - Light Clearing', 'site_work', 2000, 4000,
    'Light vegetation/brush clearing.'),
  flat('SITE-CLEAR-MULCH', 'Land Clearing - Forestry Mulching (Selective Clearing)', 'site_work', 3000, 6000,
    'Selective forestry mulching/clearing.'),
  flat('SITE-CLEAR-GRUB', 'Land Clearing - Grubbing & Dozing (Root Removal)', 'site_work', 4000, 8000,
    'Grubbing/dozing including root removal.'),
  flat('SITE-CLEAR-CUTFILL', 'Land Clearing - Cut & Fill Excavation', 'site_work', 6000, 10000,
    'Cut/fill excavation and shaping.'),
  flat('SITE-CLEAR-GRADE', 'Land Clearing - Rough Grading / Drainage Prep', 'site_work', 8000, 12000,
    'Final rough grading/drainage preparation for the home area.'),

  flat('SITE-PERIM-SOD', 'Perimeter Stabilization - Sod', 'site_work', 1000, 1100,
    'Master Quote 5 sod perimeter-stabilization option.'),
  flat('SITE-PERIM-FLOWER', 'Perimeter Stabilization - Flower Bed', 'site_work', 1800, 1980,
    'Master Quote 5 flower-bed perimeter-stabilization option.'),
  flat('SITE-PERIM-ROCK', 'Perimeter Stabilization - Rock', 'site_work', 2000, 2200,
    'Master Quote 5 rock perimeter-stabilization option.'),

  flat('SITE-SEWER-HOOKUP-50', 'Sewer Hookup (up to 50 ft)', 'addons', 1500, 1650,
    'Master Quote 5 sewer hookup baseline up to 50 ft. Verify site-specific distance before final.'),

  flat('SITE-APRON-DAVID-YORK', 'Concrete Apron - David York Cost', 'site_work', 2500, 2750,
    'Alternate Master Quote 5 concrete-apron vendor option.'),
];
