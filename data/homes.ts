export type HomeStatus = "Available" | "Coming Soon" | "Sold";
export type GalleryCategory = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "video";
export type StandardFeatureCategory = "Exterior & Construction" | "Interior" | "Kitchen" | "Bathroom" | "Mechanical" | "Energy / Insulation" | "Options / Upgrades";

export type HomeGalleryItem = { src: string; alt: string; category: GalleryCategory; isPrimary?: boolean };
export type StandardFeatureGroup = { category: StandardFeatureCategory; items: string[] };

export type Home = {
  id: string; name: string; slug: string; manufacturer?: string | null; modelNumber?: string | null; series?: string | null; homeType?: string | null;
  bedrooms?: number | null; bathrooms?: number | null; squareFeet?: number | null; width?: string | null; length?: string | null; size?: string | null;
  startingPrice?: number | null; salePrice?: number | null; priceLabel?: string | null; priceDisclaimer?: string | null;
  status: HomeStatus; isActive: boolean; isFeatured: boolean; isOnDisplay: boolean; isNewArrival: boolean; isSpecialOffer: boolean; isComingSoon: boolean;
  shortDescription: string; longDescription?: string; features: string[]; standardFeatures: StandardFeatureGroup[];
  images: string[]; gallery: HomeGalleryItem[]; floorPlanImage?: string | null; brochureUrl?: string | null; videoUrl?: string | null; virtualTourUrl?: string | null; walkthroughVideoUrl?: string | null;
  seoTitle?: string; seoDescription?: string; createdAt: string;
};

export const catalogPriceDisclaimer = "Home availability, pricing, financing, delivery, setup, taxes, fees, permits, site conditions, lender approval, and final project costs are subject to change and final quote.";

const standardFeatures: StandardFeatureGroup[] = [
  { category: "Exterior & Construction", items: ["Manufactured home construction", "Delivery and setup guidance available"] },
  { category: "Interior", items: ["Functional living spaces", "Floor plan options may vary by model"] },
  { category: "Kitchen", items: ["Kitchen package varies by selected home and options"] },
  { category: "Bathroom", items: ["Bathroom fixtures and finishes vary by model"] },
  { category: "Mechanical", items: ["Mechanical systems reviewed during final quote"] },
  { category: "Energy / Insulation", items: ["Insulation and energy details confirmed by home specification sheet"] },
  { category: "Options / Upgrades", items: ["Available options and upgrades confirmed with Easy HomeSource"] }
];
const defaultFeatures = ["Public home catalog listing", "Pricing guidance available", "Delivery and setup conversation available", "Financing conversation available"];
const desc = (name: string) => `${name} is listed in the Easy HomeSource public home catalog. Request current pricing, availability, floor plan details, media, delivery, setup, financing guidance, and final quote information from the Brooksville team.`;
const price = (n?: number | null) => n ? `$${n.toLocaleString()}` : null;
const galleryFor = (slug: string, name: string): HomeGalleryItem[] => [
  { src: `/homes/${slug}/exterior/${slug}-exterior-01.jpg`, alt: `${name} manufactured home exterior at Easy HomeSource`, category: "exterior", isPrimary: true },
  { src: `/homes/${slug}/interior/${slug}-living-01.jpg`, alt: `${name} living room interior`, category: "interior" },
  { src: `/homes/${slug}/kitchen/${slug}-kitchen-01.jpg`, alt: `${name} kitchen`, category: "kitchen" },
  { src: `/homes/${slug}/bathroom/${slug}-bathroom-01.jpg`, alt: `${name} bathroom`, category: "bathroom" },
  { src: `/homes/${slug}/bedroom/${slug}-bedroom-01.jpg`, alt: `${name} bedroom`, category: "bedroom" },
  { src: `/homes/${slug}/floorplan/${slug}-floorplan.jpg`, alt: `${name} floor plan`, category: "floorplan" }
];

type Seed = Pick<Home, "name"|"slug"|"modelNumber"|"bedrooms"|"bathrooms"|"squareFeet"|"size"|"startingPrice"|"isFeatured"|"isOnDisplay"|"isSpecialOffer"|"isNewArrival">;
const seeds: Seed[] = [
  { name: "The Tulip", slug: "tulip", bedrooms: 1, bathrooms: 1, squareFeet: 480, size: "12' x 40'", startingPrice: 39888, isFeatured: true, isOnDisplay: false, isSpecialOffer: true, isNewArrival: false },
  { name: "Paxton", modelNumber: "Paxton 28523A", slug: "paxton", bedrooms: 3, bathrooms: 2, squareFeet: 1394, size: "26' 8\" x 52'", startingPrice: 143185, isFeatured: true, isOnDisplay: true, isSpecialOffer: false, isNewArrival: false },
  { name: "Dogwood", slug: "dogwood", bedrooms: 2, bathrooms: 2, squareFeet: 790, size: "14' x 60'", startingPrice: 62900, isFeatured: true, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Born to Run", slug: "born-to-run", bedrooms: 2, bathrooms: 2, squareFeet: 900, size: "16' x 60'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Classic C-1672-32C", slug: "classic-c-1672-32c", bedrooms: 3, bathrooms: 2, squareFeet: 1068, size: "16' x 72'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Move on Up", slug: "move-on-up", bedrooms: 3, bathrooms: 2, squareFeet: 1080, size: "16' x 72'", isFeatured: true, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Oak", slug: "oak", bedrooms: 4, bathrooms: 2, squareFeet: 1475, size: "28' x 56'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Atmos 28603N", slug: "atmos-28603n", bedrooms: 3, bathrooms: 2, squareFeet: 1600, size: "26' 8\" x 60'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: true },
  { name: "Craft Select 28603A", slug: "craft-select-28603a", bedrooms: 3, bathrooms: 2, squareFeet: 1680, size: "26' 8\" x 60'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: true },
  { name: "Hey Jude", slug: "hey-jude", bedrooms: 5, bathrooms: 2, squareFeet: 1896, size: "28' x 72'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Boujee XL 2", slug: "boujee-xl-2", bedrooms: 4, bathrooms: 3, squareFeet: 1980, size: "28' x 72'", isFeatured: false, isOnDisplay: false, isSpecialOffer: false, isNewArrival: false }
];

export const homes: Home[] = seeds.map((home, index) => ({
  id: home.slug, slug: home.slug, name: home.name, modelNumber: home.modelNumber ?? null, manufacturer: null, series: null, homeType: "Manufactured Home",
  bedrooms: home.bedrooms, bathrooms: home.bathrooms, squareFeet: home.squareFeet, size: home.size, width: home.size?.split(" x ")[0] ?? null, length: home.size?.split(" x ")[1] ?? null,
  startingPrice: home.startingPrice ?? null, salePrice: null, priceLabel: home.startingPrice ? "Starting Price" : "Call for current pricing", priceDisclaimer: catalogPriceDisclaimer,
  status: "Coming Soon", isActive: true, isFeatured: home.isFeatured, isOnDisplay: home.isOnDisplay, isNewArrival: home.isNewArrival, isSpecialOffer: home.isSpecialOffer, isComingSoon: true,
  shortDescription: desc(home.name), longDescription: desc(home.name), features: defaultFeatures, standardFeatures, images: [], gallery: galleryFor(home.slug, home.name),
  floorPlanImage: `/homes/${home.slug}/floorplan/${home.slug}-floorplan.jpg`, brochureUrl: null, videoUrl: null, virtualTourUrl: null, walkthroughVideoUrl: null,
  seoTitle: `${home.name} Manufactured Home | Easy HomeSource`, seoDescription: `Explore ${home.name} specs, price guidance, photos, floor plans, videos, and brochure media from Easy HomeSource.`, createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`
}));

export function formatHomePrice(home: Home): string { return home.salePrice ? `$${home.salePrice.toLocaleString()}` : home.startingPrice ? `$${home.startingPrice.toLocaleString()}` : "Call for current pricing"; }
export function getFeaturedHomes() { return homes.filter((home) => home.isFeatured && home.isActive); }
export function getHomeBySlug(slug: string) { return homes.find((home) => home.slug === slug && home.isActive); }
export const getHomeById = getHomeBySlug;
