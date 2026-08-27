export type TimberCreekCatalogModel = {
  name: string;
  displayName: string;
  slug: string;
  modelNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  width: number;
  length: number;
  size: string;
  floorplanId: number;
  sourceSlug: string;
  sourcePage: string;
  brochureUrl: string;
  floorPlanImage: string;
  isModular: boolean;
};

const DEALER_ID = 5774;
const DEALER_PATH = "easy-homesource/hernando";
const CDN_ROOT = "https://d132mt2yijm03y.cloudfront.net/manufacturer/3391/floorplan";

function sourcePage(floorplanId: number, sourceSlug: string) {
  return `https://www.timbercreekhousing.com/floorplan/${floorplanId}-${DEALER_ID}/${DEALER_PATH}/creekside-series/${sourceSlug}/`;
}

function brochureUrl(floorplanId: number) {
  return `https://www.timbercreekhousing.com/brochure/dealer/${DEALER_ID}/${floorplanId}/`;
}

function floorPlanImage(floorplanId: number, modelNumber: string) {
  const imageCode = modelNumber.replace(/^CS(?:FL)?-/, "");
  return `${CDN_ROOT}/${floorplanId}/${imageCode}.jpg`;
}

function model(
  name: string,
  displayName: string,
  slug: string,
  modelNumber: string,
  bedrooms: number,
  bathrooms: number,
  squareFeet: number,
  width: number,
  length: number,
  size: string,
  floorplanId: number,
  sourceSlug: string,
  isModular = false,
): TimberCreekCatalogModel {
  return {
    name,
    displayName,
    slug,
    modelNumber,
    bedrooms,
    bathrooms,
    squareFeet,
    width,
    length,
    size,
    floorplanId,
    sourceSlug,
    sourcePage: sourcePage(floorplanId, sourceSlug),
    brochureUrl: brochureUrl(floorplanId),
    floorPlanImage: floorPlanImage(floorplanId, modelNumber),
    isModular,
  };
}

/**
 * Current Creekside Series lineup offered through Timber Creek Housing's
 * Easy Homesource dealer catalog (dealer 5774). Pricing intentionally lives
 * outside this manufacturer snapshot and must remain EHS-controlled.
 */
export const timberCreekCatalog: TimberCreekCatalogModel[] = [
  model("Hangout", "The Hangout CS-3263", "hangout-cs-3263", "CS-3263", 3, 2, 1980, 30, 66, "30' x 66'", 237110, "the-hangout-cs-3263"),
  model("Low Country", "The Low Country CS-3262", "low-country-cs-3262", "CS-3262", 3, 2, 2100, 30, 70, "30' x 70'", 237149, "the-low-country-cs-3262"),
  model("Cedar Creek", "The Cedar Creek CS-3240", "cedar-creek-cs-3240", "CS-3240", 4, 2, 2280, 32, 76, "32' x 76'", 237172, "the-cedar-creek-cs-3240"),
  model("Lake Wood", "The Lake Wood CS-3254", "lake-wood-cs-3254", "CS-3254", 3, 2, 2040, 30, 68, "30' x 68'", 235413, "the-lake-wood-cs-3254"),
  model("Highland Oak", "The Highland Oak CS-3253", "highland-oak-cs-3253", "CS-3253", 4, 2, 2280, 30, 76, "30' x 76'", 235411, "the-highland-oak-cs-3253"),
  model("Roxy", "The Roxy CSFL-3305", "roxy-csfl-3305", "CSFL-3305", 4, 2, 1920, 30, 64, "30' x 64'", 235412, "the-roxy-csfl-3305"),
  model("Cahaba", "The Cahaba CS-1604", "cahaba-cs-1604", "CS-1604", 3, 2, 1140, 15.17, 76, "15' 2\" x 76'", 231596, "the-cahaba-cs-1604"),
  model("Callaway", "The Callaway CS-3215", "callaway-cs-3215", "CS-3215", 4, 2, 2280, 32, 76, "32' x 76'", 231597, "the-callaway-cs-3215", true),
  model("White Oak", "The White Oak CS-3221", "white-oak", "CS-3221", 3, 2, 2280, 32, 76, "32' x 76'", 231618, "the-white-oak-cs-3221"),
  model("Delilah", "The Delilah CSFL-3301", "delilah", "CSFL-3301", 4, 2, 2280, 30, 76, "30' x 76'", 232817, "the-delilah-csfl-3301"),
  model("Cheaha", "The Cheaha CS-1620", "cheaha-cs-1620", "CS-1620", 3, 2, 1140, 15, 76, "15' x 76'", 233372, "the-cheaha-cs-1620"),
  model("Canyon Creek", "The Canyon Creek CS-1622", "canyon-creek-cs-1622", "CS-1622", 3, 2, 1140, 16, 76, "16' x 76'", 233555, "the-canyon-creek-cs-1622"),
  model("Twin Creek", "The Twin Creek CS-3242", "twin-creek-cs-3242", "CS-3242", 4, 2.5, 2280, 30, 76, "30' x 76'", 233556, "the-twin-creek-cs-3242"),
  model("Shoal Creek", "The Shoal Creek CS-3241", "shoal-creek-cs-3241", "CS-3241", 3, 2, 1980, 32, 66, "32' x 66'", 233557, "the-shoal-creek-cs-3241"),
  model("Shades Creek", "The Shades Creek CS-3248", "shades-creek-cs-3248", "CS-3248", 3, 2, 1800, 30, 60, "30' x 60'", 234817, "the-shades-creek-cs-3248"),
  model("Patton Creek", "The Patton Creek CS-3249", "patton-creek-cs-3249", "CS-3249", 4, 2, 2040, 30, 68, "30' x 68'", 234818, "the-patton-creek-cs-3249"),
  model("Caney Creek", "The Caney Creek CS-1623", "caney-creek-cs-1623", "CS-1623", 3, 2, 1140, 15, 76, "15' x 76'", 234819, "the-caney-creek-cs-1623"),
  model("Keystone", "The Keystone CS-1625", "keystone-cs-1625", "CS-1625", 2, 2, 1140, 15, 76, "15' x 76'", 237147, "the-keystone-cs-1625"),
  model("Little Creek", "The Little Creek CS-3243", "little-creek-cs-3243", "CS-3243", 3, 2, 1800, 30, 60, "30' x 60'", 237173, "the-little-creek-cs-3243"),
  model("South Fork", "The South Fork CS-3268", "south-fork-cs-3268", "CS-3268", 3, 2, 2229, 30, 76, "30' x 76'", 237680, "the-south-fork-cs-3268"),
  model("Mountain Laurel", "The Mountain Laurel CS-3290", "mountain-laurel-cs-3290", "CS-3290", 3, 2, 1904, 28, 68, "28' x 68'", 237681, "the-mountain-laurel-cs-3290"),
  model("Keystone", "The Keystone CS-1625-2", "keystone-cs-1625-2", "CS-1625-2", 2, 2, 1140, 15, 76, "15' x 76'", 237682, "the-keystone-cs-1625-2"),
  model("Willow Oak", "The Willow Oak CS-3229", "willow-oak-cs-3229", "CS-3229", 3, 2, 1980, 32, 66, "32' x 66'", 232347, "the-willow-oak-cs-3229", true),
  model("Chickasaw Extra", "The Chickasaw Extra CS-3214", "chickasaw-extra-cs-3214", "CS-3214", 4, 2, 2040, 32, 68, "32' x 68'", 231601, "the-chickasaw-extra-cs-3214", true),
  model("Willow Oak Extra", "The Willow Oak Extra CS-3232", "willow-oak-extra-cs-3232", "CS-3232", 4, 2, 2280, 32, 76, "32' x 76'", 232706, "the-willow-oak-extra-cs-3232", true),
  model("Big Mulberry", "The Big Mulberry CS-3230", "big-mulberry-cs-3230", "CS-3230", 4, 2, 2280, 32, 76, "32' x 76'", 233371, "the-big-mulberry-cs-3230", true),
  model("Gloria", "The Gloria CSFL-3302", "gloria-csfl-3302", "CSFL-3302", 3, 2, 1800, 30, 60, "30' x 60'", 233641, "the-gloria-csfl-3302"),
  model("Carolina", "The Carolina CSFL-3300", "carolina-csfl-3300", "CSFL-3300", 3, 2, 1920, 30, 64, "30' x 64'", 233644, "the-carolina-csfl-3300"),
  model("Susie Q5", "The Susie Q5 CSFL-3304", "susie-q5-csfl-3304", "CSFL-3304", 5, 3, 2160, 32, 76, "32' x 76'", 235438, "the-susie-q5-csfl-3304"),
  model("Keystone 3", "The Keystone 3 CS-1626", "keystone-3-cs-1626", "CS-1626", 3, 2, 1140, 15, 76, "15' x 76'", 237148, "the-keystone-3-cs-1626"),
  model("Low Country Extra", "The Low Country Extra CS-3264", "low-country-extra-cs-3264", "CS-3264", 4, 2, 2280, 30, 76, "30' x 76'", 237150, "the-low-country-extra-cs-3264"),
];

export const timberCreekCatalogBySlug: Record<string, TimberCreekCatalogModel> = Object.fromEntries(
  timberCreekCatalog.map((home) => [home.slug, home]),
);
