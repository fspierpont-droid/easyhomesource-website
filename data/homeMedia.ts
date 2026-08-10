import { catalogHomeMedia } from "@/data/catalogHomeMedia.generated";
import { scrapedHomeDetails } from "@/data/scrapedHomeDetails.generated";
import { tulipManufacturerMedia } from "@/data/tulipManufacturerMedia";
import { craftSelectManufacturerMedia } from "@/data/craftSelectManufacturerMedia";
import manualMap from "@/scripts/trove-media-manual-map.generated.json";

export type ImportedMediaCategory =
  | "exterior"
  | "interior"
  | "kitchen"
  | "bathroom"
  | "bedroom"
  | "floorplan"
  | "brochure"
  | "video"
  | "other";

export type ImportedGalleryItem = {
  src: string;
  alt: string;
  category: ImportedMediaCategory;
  isPrimary?: boolean;
  sourceUrl?: string;
};

export type HomeMediaEntry = {
  slug: string;
  gallery: ImportedGalleryItem[];
  floorPlanImage: string | null;
  brochureUrl: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  sourcePage: string | null;
};

export type HomeMediaManifest = Record<string, HomeMediaEntry>;

function cleanScrapedMedia(entry: HomeMediaEntry): HomeMediaEntry | null {
  if (!entry?.gallery || !Array.isArray(entry.gallery) || entry.gallery.length === 0) {
    return null;
  }

  const gallery: ImportedGalleryItem[] = entry.gallery.map((item, idx) => {
    let cleanAlt = (item.alt || "").replace(/view similar homes\s*/gi, "").replace(/raw media link\s*/gi, "").trim();
    if (!cleanAlt) cleanAlt = `${entry.slug} photo ${idx + 1}`;

    return {
      ...item,
      alt: cleanAlt,
      isPrimary: item.isPrimary ?? idx === 0
    };
  });

  const hasPrimary = gallery.some((item) => item.isPrimary);
  if (!hasPrimary && gallery.length > 0) {
    gallery[0].isPrimary = true;
  }

  return {
    ...entry,
    gallery,
    floorPlanImage: entry.floorPlanImage || gallery.find((item) => item.category === "floorplan")?.src || null
  };
}

// 1. Process verified scraped home details
const scrapedMedia: HomeMediaManifest = {};
for (const slug in scrapedHomeDetails) {
  const detail = scrapedHomeDetails[slug];
  if (!detail?.media?.gallery?.length) continue;
  const cleaned = cleanScrapedMedia(detail.media);
  if (cleaned) scrapedMedia[slug] = cleaned;
}

// 2. Process manual browser captures
const manualMedia: HomeMediaManifest = {};
if (Array.isArray(manualMap)) {
  for (const item of manualMap) {
    if (!item.slug || !Array.isArray(item.media) || item.media.length === 0) continue;
    const gallery: ImportedGalleryItem[] = item.media.map((m: any, idx: number) => ({
      src: m.url,
      alt: m.alt || `${item.slug} home image ${idx + 1}`,
      category: (m.category as ImportedMediaCategory) || (idx === 0 ? "exterior" : "interior"),
      isPrimary: idx === 0,
      sourceUrl: item.sourcePage
    }));

    manualMedia[item.slug] = {
      slug: item.slug,
      gallery,
      floorPlanImage: gallery.find((g) => g.category === "floorplan")?.src ?? null,
      brochureUrl: null,
      videoUrl: null,
      virtualTourUrl: null,
      sourcePage: item.sourcePage || null
    };
  }
}

// 3. Combined master media manifest (ONLY VERIFIED HOMES)
const rawMasterMedia: HomeMediaManifest = {
  ...catalogHomeMedia,
  ...scrapedMedia,
  ...manualMedia,
  ...tulipManufacturerMedia,
  ...craftSelectManufacturerMedia
};

// 4. Exact Slugs / Aliases Map (Only exact 1-to-1 model pairings)
const SLUG_ALIASES: Record<string, string> = {
  "tulip": "tulip",
  "clayton-tru-mini-tulip": "tulip",
  "trt12482ph": "tulip",
  "the-tulip": "tulip",
  "dogwood": "dogwood",
  "tru-homes-tru-origin-dogwood": "dogwood",
  "born-to-run": "born-to-run",
  "clayton-addison-tempo-series-born-to-run": "born-to-run",
  "classic-c-1672-32c": "classic-c-1672-32c",
  "legacy-housing-classic-collection-c-1672-32c": "classic-c-1672-32c",
  "move-on-up": "move-on-up",
  "clayton-addison-tempo-series-move-on-up": "move-on-up",
  "paxton": "paxton",
  "palm-harbor-plant-city-elite-paxton-28523a": "paxton",
  "paxton-28523a": "paxton",
  "oak": "oak",
  "tru-homes-tru-origin-spruce-oak": "oak",
  "spruce-oak": "oak",
  "atmos-28603n": "atmos-28603n",
  "palm-harbor-plant-city-alpha-atmos-28603n": "atmos-28603n",
  "craft-select-28603a": "craft-select-28603a",
  "palm-harbor-plant-city-craft-select-28603a": "craft-select-28603a",
  "hey-jude": "hey-jude",
  "clayton-addison-tempo-series-hey-jude": "hey-jude",
  "boujee-xl-2": "boujee-xl-2",
  "clayton-addison-boujee-series-boujee-xl-2": "boujee-xl-2",
  "boujee-2": "boujee-2",
  "clayton-addison-boujee-series-boujee-2": "boujee-2",
  "the-boujee-2": "boujee-2",
  "delilah": "delilah",
  "the-delilah": "delilah",
  "timber-creek-creekside-series-the-delilah": "delilah",
  "white-oak": "white-oak",
  "the-white-oak": "white-oak",
  "timber-creek-creekside-series-the-white-oak": "white-oak",
  "maple": "maple",
  "tru-homes-tru-origin-maple": "maple",
  "craft-select-15663a": "craft-select-15663a",
  "palm-harbor-plant-city-craft-select-15663a": "craft-select-15663a",
  "imagine": "imagine",
  "clayton-addison-tempo-series-imagine": "imagine",
  "elm": "elm",
  "tru-homes-tru-origin-elm": "elm",
  "waverly-15471a": "waverly-15471a",
  "palm-harbor-plant-city-lifestyle-waverly-15471a": "waverly-15471a"
};

/**
 * Strict resolver: Only returns media when explicitly verified for that exact home model.
 * Never manufactures or assigns generic fallback photos across unverified homes.
 */
export function getImportedHomeMedia(slug: string): HomeMediaEntry | undefined {
  if (!slug) return undefined;

  // 1. Direct match
  if (rawMasterMedia[slug]?.gallery?.length) {
    return rawMasterMedia[slug];
  }

  // 2. Alias exact match
  const aliasKey = SLUG_ALIASES[slug] || SLUG_ALIASES[slug.toLowerCase()];
  if (aliasKey && rawMasterMedia[aliasKey]?.gallery?.length) {
    return {
      ...rawMasterMedia[aliasKey],
      slug
    };
  }

  // No unverified fallback: returns undefined so clean placeholder renders
  return undefined;
}
