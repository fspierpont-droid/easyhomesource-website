import { catalogHomeSeeds } from "@/data/catalogHomeSeeds";
import { getImportedHomeMedia } from "@/data/homeMedia";
import { scrapedHomeDetails } from "@/data/scrapedHomeDetails.generated";
export type HomeStatus = "Available" | "Coming Soon" | "Sold";
export type GalleryCategory = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "video" | "other";
export type StandardFeatureCategory = "Exterior & Construction" | "Interior" | "Kitchen" | "Bathroom" | "Mechanical" | "Energy / Insulation" | "Options / Upgrades";

export type HomeGalleryItem = { src: string; alt: string; category: GalleryCategory; isPrimary?: boolean; sourceUrl?: string };
export type StandardFeatureGroup = { category: StandardFeatureCategory; items: string[] };

export type Home = {
  id: string; name: string; displayName?: string | null; alternateName?: string | null; slug: string; manufacturer?: string | null; modelNumber?: string | null; series?: string | null; homeType?: string | null; note?: string | null;
  bedrooms?: number | null; bathrooms?: number | null; squareFeet?: number | null; width?: number | null; length?: number | null; size?: string | null;
  startingPrice?: number | null; salePrice?: number | null; priceLabel?: string | null; priceDisclaimer?: string | null;
  status: HomeStatus; isActive: boolean; isFeatured: boolean; isOnDisplay: boolean; isCatalogModel: boolean; isNewArrival: boolean; isSpecialOffer: boolean; isComingSoon: boolean;
  shortDescription: string; longDescription?: string; features: string[]; standardFeatures: StandardFeatureGroup[];
  images: string[]; gallery: HomeGalleryItem[]; floorPlanImage?: string | null; brochureUrl?: string | null; videoUrl?: string | null; virtualTourUrl?: string | null; walkthroughVideoUrl?: string | null;
  seoTitle?: string; seoDescription?: string; createdAt: string;
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
const displayFeatures = ["Available through Easy HomeSource", "Pricing guidance available", "Delivery and setup conversation available", "Financing conversation available"];
const catalogFeatures = ["Online floor plan catalog model", "Available to quote or order", "Pricing confirmed by Easy HomeSource", "Delivery, setup, and financing guidance available"];
const desc = (name: string, catalogModel = false, slug?: string) => {
  if (slug === "tulip") return `${name} is the TRU Mini TRT12482PH, offered by Easy HomeSource at the advertised special price. Contact our Brooksville team for current pricing, availability, floor plan details, delivery and setup, financing guidance, and a final quote.`;
  return catalogModel
    ? `${name} is part of the Easy HomeSource online floor plan catalog. Contact our Brooksville team for current availability, order options, pricing, delivery and setup, financing guidance, and a final quote.`
    : `The ${name} is part of the Easy HomeSource display inventory. Contact our Brooksville team for current pricing, availability, floor plan details, delivery and setup, financing guidance, and a final quote.`;
};
const galleryFor = (slug: string, name: string): HomeGalleryItem[] => [
  { src: `/homes/${slug}/exterior/${slug}-exterior-01.jpg`, alt: `${name} manufactured home exterior at Easy HomeSource`, category: "exterior", isPrimary: true },
  { src: `/homes/${slug}/interior/${slug}-living-01.jpg`, alt: `${name} living room interior`, category: "interior" },
  { src: `/homes/${slug}/kitchen/${slug}-kitchen-01.jpg`, alt: `${name} kitchen`, category: "kitchen" },
  { src: `/homes/${slug}/bathroom/${slug}-bathroom-01.jpg`, alt: `${name} bathroom`, category: "bathroom" },
  { src: `/homes/${slug}/bedroom/${slug}-bedroom-01.jpg`, alt: `${name} bedroom`, category: "bedroom" },
  { src: `/homes/${slug}/floorplan/${slug}-floorplan.jpg`, alt: `${name} floor plan`, category: "floorplan" }
];

type Seed = Pick<Home, "name"|"displayName"|"alternateName"|"slug"|"manufacturer"|"series"|"modelNumber"|"bedrooms"|"bathrooms"|"squareFeet"|"width"|"length"|"size"|"startingPrice"|"priceLabel"|"isFeatured"|"isOnDisplay"|"isCatalogModel"|"isSpecialOffer"|"isNewArrival"|"note">;
const displaySeeds: Seed[] = [
  { name: "Tulip", alternateName: "TRT12482PH", slug: "tulip", manufacturer: "Clayton TRU", series: "TRU Mini", modelNumber: "TRT12482PH", bedrooms: 2, bathrooms: 1, squareFeet: 544, width: 12, length: 48, size: "12' x 48'", startingPrice: 39888, priceLabel: "Special Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: true, isNewArrival: false, note: "Verified against the official TRU manufacturer page and sales sheet for model TRT12482PH. Keep the approved Easy HomeSource special price at $39,888 unless management changes it. Manufacturer photography and floor plan are representative; colors, finishes, options, and availability may vary." },
  { name: "Dogwood", slug: "dogwood", manufacturer: "Clayton TRU", series: "TRU Origin", modelNumber: "Dogwood", bedrooms: 2, bathrooms: 2, squareFeet: 790, width: 14, length: 60, size: "14' x 60'", startingPrice: 59946.77, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Born to Run", slug: "born-to-run", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "Born to Run", bedrooms: 2, bathrooms: 2, squareFeet: 900, width: 16, length: 60, size: "16' x 60'", startingPrice: 80777.73, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Classic C-1672-32C", slug: "classic-c-1672-32c", manufacturer: "Legacy", series: "Classic", modelNumber: "C-1672-32C", bedrooms: 3, bathrooms: 2, squareFeet: 1068, width: 16, length: 72, size: "16' x 72'", startingPrice: 83447.31, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Move on Up", slug: "move-on-up", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "Move on Up", bedrooms: 3, bathrooms: 2, squareFeet: 1080, width: 16, length: 72, size: "16' x 72'", startingPrice: 90136.67, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Paxton", displayName: "Paxton 28523A", slug: "paxton", manufacturer: "Cavco Plant City", series: "Elite", modelNumber: "Paxton 28523A", bedrooms: 3, bathrooms: 2, squareFeet: 1394, width: 26.67, length: 52, size: "26' 8\" x 52'", startingPrice: 143185, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false, note: "The uploaded PDF had conflicting Paxton data. The public Trove catalog and current business correction should control this website record. Use $143,185 unless management changes it." },
  { name: "Oak", slug: "oak", manufacturer: "Clayton TRU", series: "TRU Origin", modelNumber: "Oak", bedrooms: 4, bathrooms: 2, squareFeet: 1475, width: 28, length: 56, size: "28' x 56'", startingPrice: 84608.94, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Atmos 28603N", slug: "atmos-28603n", manufacturer: "Cavco Plant City", series: "Alpha", modelNumber: "Atmos 28603N", bedrooms: 3, bathrooms: 2, squareFeet: 1600, width: 26.67, length: 60, size: "26' 8\" x 60'", startingPrice: 159324.27, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Craft Select 28603A", slug: "craft-select-28603a", manufacturer: "Cavco Plant City", series: "Craft Select", modelNumber: "Craft Select 28603A", bedrooms: 3, bathrooms: 2, squareFeet: 1680, width: 26.67, length: 60, size: "26' 8\" x 60'", startingPrice: 125540, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false, note: "Verified against the current Easy HomeSource product page for Craft Select 28603A. Use $125,540 unless management changes it. The page currently provides the official floor plan and brochure but no model-specific photo gallery." },
  { name: "Hey Jude", slug: "hey-jude", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "Hey Jude", bedrooms: 5, bathrooms: 2, squareFeet: 1896, width: 28, length: 72, size: "28' x 72'", startingPrice: 128101.34, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false },
  { name: "Boujee XL 2", slug: "boujee-xl-2", manufacturer: "Clayton Addison", series: "Boujee Series", modelNumber: "Boujee XL 2", bedrooms: 4, bathrooms: 3, squareFeet: 1980, width: 28, length: 72, size: "28' x 72'", startingPrice: 147374.32, priceLabel: "Starting Price", isFeatured: true, isOnDisplay: true, isCatalogModel: false, isSpecialOffer: false, isNewArrival: false }
];
const catalogSeeds: Seed[] = catalogHomeSeeds.map((home) => ({ ...home, startingPrice: home.startingPrice, priceLabel: "Starting Price", isFeatured: false, isOnDisplay: false, isCatalogModel: true, isSpecialOffer: false, isNewArrival: true, note: "Online catalog model. Website price is sourced from the EHS Price calculation in QS Master Quote ERP Template V05. Confirm availability, options, freight, setup, and order timing before quoting." }));
const seeds: Seed[] = [...displaySeeds, ...catalogSeeds];
const protectedSeedPriceSlugs = new Set(["tulip", "paxton", "craft-select-28603a", ...catalogHomeSeeds.map((home) => home.slug)]);

export const homes: Home[] = seeds.map((home, index) => {
  const importedMedia = getImportedHomeMedia(home.slug);
  const scraped = scrapedHomeDetails[home.slug];
  const fallbackGallery = galleryFor(home.slug, home.displayName ?? home.name);
  const importedGallery = importedMedia?.gallery.filter((item) => item.category !== "brochure" && item.category !== "video") as HomeGalleryItem[] | undefined;
  const gallery = importedGallery?.length ? importedGallery : fallbackGallery;
  const startingPrice = protectedSeedPriceSlugs.has(home.slug)
    ? home.startingPrice ?? scraped?.startingPrice ?? null
    : scraped?.startingPrice ?? home.startingPrice ?? null;
  const description = desc(home.displayName ?? home.name, home.isCatalogModel, home.slug);
  return ({
  id: home.slug, slug: home.slug, name: home.name, displayName: home.displayName ?? null, alternateName: home.alternateName ?? null, modelNumber: home.modelNumber ?? null, manufacturer: home.manufacturer ?? null, series: home.series ?? null, note: home.note ?? null, homeType: "Manufactured Home",
  bedrooms: home.bedrooms, bathrooms: home.bathrooms, squareFeet: home.squareFeet, width: home.width, length: home.length, size: home.size,
  startingPrice, salePrice: null, priceLabel: protectedSeedPriceSlugs.has(home.slug) ? home.priceLabel : scraped?.priceLabel ?? home.priceLabel ?? (startingPrice ? "Starting Price" : "Call for current pricing"), priceDisclaimer: catalogPriceDisclaimer,
  status: "Available", isActive: true, isFeatured: home.isFeatured, isOnDisplay: home.isOnDisplay, isCatalogModel: home.isCatalogModel, isNewArrival: home.isNewArrival, isSpecialOffer: home.isSpecialOffer, isComingSoon: false,
  shortDescription: description, longDescription: description, features: home.isCatalogModel ? catalogFeatures : displayFeatures, standardFeatures, images: gallery.map((item) => item.src), gallery,
  floorPlanImage: importedMedia?.floorPlanImage ?? `/homes/${home.slug}/floorplan/${home.slug}-floorplan.jpg`, brochureUrl: importedMedia?.brochureUrl ?? null, videoUrl: importedMedia?.videoUrl ?? null, virtualTourUrl: importedMedia?.virtualTourUrl ?? null, walkthroughVideoUrl: null,
  seoTitle: `${home.displayName ?? home.name} Manufactured Home | Easy HomeSource`, seoDescription: `Explore ${home.displayName ?? home.name} specs, price guidance, photos, floor plans, videos, and brochure media from Easy HomeSource.`, createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`
  });
});

export function formatHomePrice(home: Home): string {
  const amount = home.salePrice ?? home.startingPrice;
  return amount ? `$${Math.round(amount).toLocaleString()}` : "Call for current pricing";
}
export function getFeaturedHomes() { return homes.filter((home) => home.isFeatured && home.isActive); }
export function getHomeBySlug(slug: string) { return homes.find((home) => home.slug === slug && home.isActive); }
export const getHomeById = getHomeBySlug;
