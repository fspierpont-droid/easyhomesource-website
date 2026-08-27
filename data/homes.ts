import { catalogHomeSeeds } from "@/data/catalogHomeSeeds";
import { getImportedHomeMedia } from "@/data/homeMedia";
import { scrapedHomeDetails } from "@/data/scrapedHomeDetails.generated";
import { timberCreekCatalog, timberCreekCatalogBySlug } from "@/data/timberCreekCatalog";

export type HomeStatus = "Available" | "Coming Soon" | "Sold";
export type GalleryCategory = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "video" | "other";
export type StandardFeatureCategory = "Exterior & Construction" | "Interior" | "Kitchen" | "Bathroom" | "Mechanical" | "Energy / Insulation" | "Options / Upgrades";

export type HomeGalleryItem = { src: string; alt: string; category: GalleryCategory; isPrimary?: boolean; sourceUrl?: string };
export type StandardFeatureGroup = { category: StandardFeatureCategory; items: string[] };

export type Home = {
  id: string;
  name: string;
  displayName?: string | null;
  alternateName?: string | null;
  slug: string;
  manufacturer?: string | null;
  manufacturerUrl?: string | null;
  modelNumber?: string | null;
  series?: string | null;
  homeType?: string | null;
  note?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
  width?: number | null;
  length?: number | null;
  size?: string | null;
  startingPrice?: number | null;
  salePrice?: number | null;
  priceLabel?: string | null;
  priceDisclaimer?: string | null;
  status: HomeStatus;
  isActive: boolean;
  isFeatured: boolean;
  isOnDisplay: boolean;
  isCatalogModel: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  isComingSoon: boolean;
  shortDescription: string;
  longDescription?: string;
  features: string[];
  standardFeatures: StandardFeatureGroup[];
  images: string[];
  gallery: HomeGalleryItem[];
  floorPlanImage?: string | null;
  brochureUrl?: string | null;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  walkthroughVideoUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
};

export const catalogPriceDisclaimer = "Home availability, pricing, financing, delivery and setup, taxes, fees, permits, site conditions, lender approval, and final project costs are subject to change and final quote.";

const standardFeatures: StandardFeatureGroup[] = [
  { category: "Exterior & Construction", items: ["Manufactured home construction", "Delivery and setup guidance available"] },
  { category: "Interior", items: ["Functional living spaces", "Floor plan options may vary by model"] },
  { category: "Kitchen", items: ["Kitchen package varies by selected home and options"] },
  { category: "Bathroom", items: ["Bathroom fixtures and finishes vary by model"] },
  { category: "Mechanical", items: ["Mechanical systems reviewed during final quote"] },
  { category: "Energy / Insulation", items: ["Insulation and energy details confirmed by home specification sheet"] },
  { category: "Options / Upgrades", items: ["Available options and upgrades confirmed with Easy HomeSource"] }
];

const timberCreekStandardFeatures: StandardFeatureGroup[] = [
  {
    category: "Exterior & Construction",
    items: [
      "2 x 4 exterior walls at 16 in. O.C.",
      "3/4 in. tongue-and-groove OSB floor decking",
      "Floor joist spacing and specification matched to home width",
      "7/16 in. OSB roof decking",
      "Vinyl siding with OSB underlayment",
      "Low-E thermopane windows",
      "Fiberglass shingle roof"
    ]
  },
  {
    category: "Interior",
    items: [
      "1/2 in. finished drywall throughout",
      "3 1/4 in. shaker molding package",
      "5-panel interior doors with mortised hinges",
      "Residential light-stipple ceiling finish"
    ]
  },
  {
    category: "Kitchen",
    items: [
      "Double-bowl stainless steel sink",
      "Stainless side-by-side refrigerator with ice and water",
      "Glass-top range, stainless dishwasher, and stainless microwave",
      "Recessed kitchen lighting",
      "42 in. Eastern White Oak MDF cabinets",
      "Solido rolled-edge countertops",
      "Adjustable shelving, hidden hinges, and decorative cabinet pulls"
    ]
  },
  {
    category: "Bathroom",
    items: [
      "LED recessed lighting",
      "China lavatories with brushed-nickel metal faucets",
      "Fiberglass tubs and showers per selected floor plan",
      "Elongated commodes"
    ]
  },
  {
    category: "Mechanical",
    items: [
      "200-amp electrical service",
      "Whole-house and fixture water shutoffs",
      "Digital thermostat",
      "50-gallon dual-element water heater"
    ]
  },
  {
    category: "Energy / Insulation",
    items: [
      "Typical published Creekside insulation package: R-11 floors, R-11 walls, and R-21 ceiling; confirm the selected factory build sheet"
    ]
  },
  {
    category: "Options / Upgrades",
    items: [
      "Final colors, materials, specifications, and optional features are confirmed on the selected factory order/build sheet"
    ]
  }
];

const displayFeatures = ["Available through Easy HomeSource", "Pricing guidance available", "Delivery and setup conversation available", "Financing conversation available"];
const catalogFeatures = ["Online floor plan catalog model", "Available to quote or order", "Pricing confirmed by Easy HomeSource", "Delivery, setup, and financing guidance available"];

const desc = (name: string, catalogModel = false, slug?: string) => {
  if (slug === "tulip") return `${name} is the TRU Mini TRT12482PH, offered by Easy HomeSource at the advertised special price. Contact our Brooksville team for current pricing, availability, floor plan details, delivery and setup, financing guidance, and a final quote.`;
  const timberCreek = slug ? timberCreekCatalogBySlug[slug] : undefined;
  if (timberCreek) {
    return `${timberCreek.displayName} is a ${timberCreek.bedrooms}-bedroom, ${timberCreek.bathrooms}-bath Creekside Series home with approximately ${timberCreek.squareFeet.toLocaleString()} square feet in a ${timberCreek.size} layout. It is available through Easy HomeSource with Timber Creek floor-plan information, factory brochure access, and manufacturer specifications. Contact our Brooksville team for current order availability, selected options, EHS pricing, delivery and setup, financing guidance, and a final quote.`;
  }
  return catalogModel
    ? `${name} is part of the Easy HomeSource online floor plan catalog. Contact our Brooksville team for current availability, order options, pricing, delivery and setup, financing guidance, and a final quote.`
    : `The ${name} is part of the Easy HomeSource display inventory. Contact our Brooksville team for current pricing, availability, floor plan details, delivery and setup, financing guidance, and a final quote.`;
};

type Seed = Pick<Home, "name"|"displayName"|"alternateName"|"slug"|"manufacturer"|"series"|"modelNumber"|"bedrooms"|"bathrooms"|"squareFeet"|"width"|"length"|"size"|"startingPrice"|"priceLabel"|"isFeatured"|"isOnDisplay"|"isCatalogModel"|"isSpecialOffer"|"isNewArrival"|"note">;

const displaySeeds: Seed[] = [
  { name: "Tulip", alternateName: "TRT12482PH", slug: "tulip", manufacturer: "Clayton TRU", series: "TRU Mini", modelNumber: "TRT12482PH", bedrooms: 2, bathrooms: 1, squareFeet: 544, width: 12, length: 48, size: "12' x 48'", startingPrice: 39888, priceLabel: "Special Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: true, isNewArrival: false, note: "Verified against the official TRU manufacturer page and sales sheet for model TRT12482PH. Keep the approved Easy HomeSource special price at $39,888 unless management changes it. Manufacturer photography and floor plan are representative; colors, finishes, options, and availability may vary." },
  { name: "Dogwood", slug: "dogwood", manufacturer: "Clayton TRU", series: "TRU Origin", modelNumber: "Dogwood", bedrooms: 2, bathrooms: 2, squareFeet: 790, width: 14, length: 60, size: "14' x 60'", startingPrice: 61900, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Born to Run", slug: "born-to-run", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "Born to Run", bedrooms: 2, bathrooms: 2, squareFeet: 900, width: 16, length: 60, size: "16' x 60'", startingPrice: 89875, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Classic C-1672-32C", slug: "classic-c-1672-32c", manufacturer: "Legacy", series: "Classic", modelNumber: "C-1672-32C", bedrooms: 3, bathrooms: 2, squareFeet: 1068, width: 16, length: 72, size: "16' x 72'", startingPrice: 83447.31, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Move on Up", slug: "move-on-up", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "Move on Up", bedrooms: 3, bathrooms: 2, squareFeet: 1080, width: 16, length: 72, size: "16' x 72'", startingPrice: 94900, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Paxton", slug: "paxton", manufacturer: "Cavco Plant City", series: "Elite", modelNumber: "Paxton 28523A", bedrooms: 3, bathrooms: 2, squareFeet: 1394, width: 26.67, length: 52, size: "26' 8\" x 52'", startingPrice: 158888, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Oak", slug: "oak", manufacturer: "Clayton TRU", series: "TRU Origin", modelNumber: "Oak", bedrooms: 4, bathrooms: 2, squareFeet: 1475, width: 28, length: 56, size: "28' x 56'", startingPrice: 84608.94, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Atmos 28603N", slug: "atmos-28603n", manufacturer: "Cavco Plant City", series: "Alpha", modelNumber: "Atmos 28603N", bedrooms: 3, bathrooms: 2, squareFeet: 1600, width: 26.67, length: 60, size: "26' 8\" x 60'", startingPrice: 158829.11, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Craft Select 28603A", slug: "craft-select-28603a", manufacturer: "Cavco Plant City", series: "Craft Select", modelNumber: "Craft Select 28603A", bedrooms: 3, bathrooms: 2, squareFeet: 1680, width: 26.67, length: 60, size: "26' 8\" x 60'", startingPrice: 125540, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false, note: "Verified against the current Easy HomeSource product page for Craft Select 28603A. Use $125,540 unless management changes it." },
  { name: "Hey Jude", slug: "hey-jude", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "Hey Jude", bedrooms: 5, bathrooms: 2, squareFeet: 1896, width: 28, length: 72, size: "28' x 72'", startingPrice: 128101.34, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Boujee XL 2", slug: "boujee-xl-2", manufacturer: "Clayton Addison", series: "Boujee Series", modelNumber: "Boujee XL 2", bedrooms: 3, bathrooms: 2, squareFeet: 1832, width: 28, length: 72, size: "28' x 72'", startingPrice: 147374.32, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false }
];

const knownLineupSeeds: Seed[] = [
  { name: "Maple", alternateName: "TRT28483MH", slug: "maple", manufacturer: "Clayton TRU", series: "TRU Origin", modelNumber: "TRT28483MH", bedrooms: 3, bathrooms: 2, squareFeet: 1264, width: 28, length: 48, size: "28' x 48'", startingPrice: 98000, priceLabel: "Starting Price", isFeatured: false, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: true },
  { name: "White Oak", displayName: "The White Oak", slug: "white-oak", manufacturer: "Timber Creek Housing", series: "Creekside Series", modelNumber: "CS-3221", bedrooms: 3, bathrooms: 2, squareFeet: 2280, width: 30, length: 76, size: "30' x 76'", startingPrice: 189900, priceLabel: "Starting Price", isFeatured: false, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: true },
  { name: "Boujee 2", slug: "boujee-2", manufacturer: "Clayton Addison", series: "Boujee Series", modelNumber: "44BOU28603BH", bedrooms: 3, bathrooms: 2, squareFeet: 1580, width: 28, length: 60, size: "28' x 60'", startingPrice: 132400, priceLabel: "Starting Price", isFeatured: false, isOnDisplay: false, isCatalogModel: true, isSpecialOffer: false, isNewArrival: true },
  { name: "Delilah", slug: "delilah", manufacturer: "Timber Creek Housing", series: "Creekside Series", modelNumber: "CSFL-3301", bedrooms: 4, bathrooms: 2, squareFeet: 2280, width: 30, length: 76, size: "30' x 76'", startingPrice: 168900, priceLabel: "Starting Price", isFeatured: false, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: true },
  { name: "Craft Select 15663A", slug: "craft-select-15663a", manufacturer: "Cavco Plant City / Palm Harbor", series: "Craft Select", modelNumber: "15663A", bedrooms: 3, bathrooms: 2, squareFeet: 1140, width: 15, length: 76, size: "15' x 76'", startingPrice: null, priceLabel: "Call/Text for starting price", isFeatured: false, isOnDisplay: false, isCatalogModel: true, isSpecialOffer: false, isNewArrival: true }
];

const cleanKey = (s?: string | null) => (s ? s.toLowerCase().replace(/[^a-z0-9]/g, "") : "");

const curatedKeys = new Set([
  ...displaySeeds.flatMap((home) => [cleanKey(home.name), cleanKey(home.slug), cleanKey(home.modelNumber)]),
  ...knownLineupSeeds.flatMap((home) => [cleanKey(home.name), cleanKey(home.slug), cleanKey(home.modelNumber)])
].filter(Boolean));

const timberCreekSeeds: Seed[] = timberCreekCatalog
  .filter((home) => ![cleanKey(home.name), cleanKey(home.slug), cleanKey(home.modelNumber)].some((key) => key && curatedKeys.has(key)))
  .map((home) => ({
    name: home.name,
    displayName: home.displayName,
    slug: home.slug,
    manufacturer: "Timber Creek Housing",
    series: "Creekside Series",
    modelNumber: home.modelNumber,
    bedrooms: home.bedrooms,
    bathrooms: home.bathrooms,
    squareFeet: home.squareFeet,
    width: home.width,
    length: home.length,
    size: home.size,
    startingPrice: null,
    priceLabel: "Call/Text for starting price",
    isFeatured: false,
    isOnDisplay: false,
    isCatalogModel: true,
    isSpecialOffer: false,
    isNewArrival: true,
    note: `Verified from Timber Creek Housing's Easy Homesource dealer catalog, floorplan ${home.floorplanId}. Manufacturer media and specifications are representative; final colors, options, EHS pricing, and availability must be confirmed before quoting.`
  }));

/**
 * Generated-catalog URLs that refer to an already curated public home.
 * Keep these aliases here both to exclude duplicate cards and to preserve old links.
 */
export const legacyHomeSlugAliases: Record<string, string> = {
  "clayton-tru-mini-tulip": "tulip",
  "tru-homes-tru-origin-dogwood": "dogwood",
  "legacy-housing-classic-collection-c-1672-32c": "classic-c-1672-32c",
  "tru-homes-tru-origin-maple": "maple",
  "palm-harbor-plant-city-elite-paxton-28523a": "paxton",
  "palm-harbor-plant-city-craft-select-28603a": "craft-select-28603a",
  "timber-creek-creekside-series-the-white-oak": "white-oak",
  "timber-creek-creekside-series-the-delilah": "delilah",
  "timber-creek-creekside-series-the-twin-creek": "twin-creek-cs-3242",
  "palm-harbor-plant-city-craft-select-15663a": "craft-select-15663a",
  ...Object.fromEntries(timberCreekCatalog.map((home) => [`timber-creek-creekside-series-${home.sourceSlug}`, home.slug]))
};

const existingDisplayKeys = new Set([
  ...displaySeeds.flatMap((home) => [cleanKey(home.name), cleanKey(home.slug), cleanKey(home.modelNumber)]),
  ...knownLineupSeeds.flatMap((home) => [cleanKey(home.name), cleanKey(home.slug), cleanKey(home.modelNumber)]),
  ...timberCreekSeeds.flatMap((home) => [cleanKey(home.name), cleanKey(home.slug), cleanKey(home.modelNumber)])
].filter(Boolean));

const seenModelKeys = new Set<string>(existingDisplayKeys);
const catalogSeeds: Seed[] = [];
for (const home of catalogHomeSeeds) {
  if (legacyHomeSlugAliases[home.slug]) continue;

  const k1 = cleanKey(home.name);
  const k2 = home.displayName ? cleanKey(home.displayName) : "";
  const k3 = home.modelNumber ? cleanKey(home.modelNumber) : "";
  const k4 = cleanKey(home.slug);

  if (
    (k1 && seenModelKeys.has(k1)) ||
    (k2 && seenModelKeys.has(k2)) ||
    (k3 && seenModelKeys.has(k3)) ||
    (k4 && seenModelKeys.has(k4))
  ) continue;

  if (k1) seenModelKeys.add(k1);
  if (k2) seenModelKeys.add(k2);
  if (k3) seenModelKeys.add(k3);
  if (k4) seenModelKeys.add(k4);

  catalogSeeds.push({
    ...home,
    startingPrice: home.startingPrice,
    priceLabel: "Starting Price",
    isFeatured: false,
    isOnDisplay: false,
    isCatalogModel: true,
    isSpecialOffer: false,
    isNewArrival: true,
    note: "Online catalog model. Website price is sourced from the EHS Price calculation in QS Master Quote ERP Template V05. Confirm availability, options, freight, setup, and order timing before quoting."
  });
}

const seeds: Seed[] = [...displaySeeds, ...knownLineupSeeds, ...timberCreekSeeds, ...catalogSeeds];
const protectedSeedPriceSlugs = new Set(["tulip", "dogwood", "born-to-run", "paxton", "craft-select-28603a", ...catalogHomeSeeds.map((home) => home.slug)]);

export const homes: Home[] = seeds.map((home, index) => {
  const importedMedia = getImportedHomeMedia(home.slug);
  const scraped = scrapedHomeDetails[home.slug];
  const timberCreek = timberCreekCatalogBySlug[home.slug];
  const importedGallery = importedMedia?.gallery.filter((item) => item.category !== "brochure" && item.category !== "video") as HomeGalleryItem[] | undefined;
  const gallery = importedGallery?.length ? importedGallery : [];

  // Manufacturer pages never set EHS retail pricing. Existing curated EHS prices win;
  // new Timber Creek catalog models intentionally remain call-for-price.
  const startingPrice = timberCreek
    ? home.startingPrice ?? null
    : protectedSeedPriceSlugs.has(home.slug)
      ? home.startingPrice ?? scraped?.startingPrice ?? null
      : scraped?.startingPrice ?? home.startingPrice ?? null;

  const description = desc(home.displayName ?? home.name, home.isCatalogModel, home.slug);
  const baseTitle = `${home.displayName ?? home.name} - ${home.bedrooms ? `${home.bedrooms} Bed, ${home.bathrooms} Bath` : "Manufactured Home"}`;
  const seoTitle = `${baseTitle} | Brooksville, FL`;
  const seoDescription = home.isCatalogModel
    ? `View the ${home.displayName ?? home.name} floor plan by ${home.manufacturer || "our builders"}. This ${home.squareFeet || "spacious"} sq. ft. home is available to order in Brooksville, FL with financing & delivery support.`
    : `Tour the ${home.displayName ?? home.name} on our lot in Brooksville, FL! This ${home.bedrooms ? `${home.bedrooms}-bed, ${home.bathrooms}-bath` : "beautiful"} manufactured home is available now. Call for a quote.`;

  return {
    id: home.slug,
    slug: home.slug,
    name: home.name,
    displayName: home.displayName ?? null,
    alternateName: home.alternateName ?? null,
    modelNumber: home.modelNumber ?? null,
    manufacturer: home.manufacturer ?? null,
    manufacturerUrl: timberCreek?.sourcePage ?? null,
    series: home.series ?? null,
    note: home.note ?? null,
    homeType: timberCreek?.isModular ? "Manufactured / Modular Home" : "Manufactured Home",
    bedrooms: home.bedrooms,
    bathrooms: home.bathrooms,
    squareFeet: home.squareFeet,
    width: home.width,
    length: home.length,
    size: home.size,
    startingPrice,
    salePrice: null,
    priceLabel: timberCreek
      ? home.priceLabel ?? (startingPrice ? "Starting Price" : "Call/Text for starting price")
      : protectedSeedPriceSlugs.has(home.slug)
        ? home.priceLabel
        : scraped?.priceLabel ?? home.priceLabel ?? (startingPrice ? "Starting Price" : "Call for current pricing"),
    priceDisclaimer: catalogPriceDisclaimer,
    status: "Available",
    isActive: true,
    isFeatured: home.isFeatured,
    isOnDisplay: home.isOnDisplay,
    isCatalogModel: home.isCatalogModel,
    isNewArrival: home.isNewArrival,
    isSpecialOffer: home.isSpecialOffer,
    isComingSoon: false,
    shortDescription: description,
    longDescription: description,
    features: home.isCatalogModel ? catalogFeatures : displayFeatures,
    standardFeatures: timberCreek ? timberCreekStandardFeatures : standardFeatures,
    images: gallery.map((item) => item.src),
    gallery,
    floorPlanImage: importedMedia?.floorPlanImage ?? timberCreek?.floorPlanImage ?? null,
    brochureUrl: importedMedia?.brochureUrl ?? timberCreek?.brochureUrl ?? null,
    videoUrl: importedMedia?.videoUrl ?? null,
    virtualTourUrl: importedMedia?.virtualTourUrl ?? null,
    walkthroughVideoUrl: null,
    seoTitle,
    seoDescription,
    createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`
  };
});

/** Keep prices numeric in home data; add customer-facing context only at render time. */
export function formatStartingPrice(price?: number | null): string {
  return price != null && Number.isFinite(price) && price > 0
    ? `Starting at $${Math.round(price).toLocaleString()}`
    : "Call/Text for starting price";
}

/** Records without the core facts customers use to compare homes need extra context. */
export function hasIncompleteCatalogDetails(home: Home): boolean {
  return !(
    home.startingPrice != null && Number.isFinite(home.startingPrice) && home.startingPrice > 0 &&
    home.bedrooms != null && home.bedrooms > 0 &&
    home.bathrooms != null && home.bathrooms > 0 &&
    home.squareFeet != null && home.squareFeet > 0 &&
    Boolean(home.size) &&
    Boolean(home.manufacturer) &&
    Boolean(home.modelNumber)
  );
}

export function formatHomePrice(home: Home): string {
  return formatStartingPrice(home.salePrice ?? home.startingPrice);
}

export function getFeaturedHomes() {
  return homes.filter((home) => home.isFeatured && home.isActive);
}

export function getHomeBySlug(slug: string) {
  const canonicalSlug = legacyHomeSlugAliases[slug] ?? slug;
  return homes.find((home) => home.slug === canonicalSlug && home.isActive);
}

export const getHomeById = getHomeBySlug;
