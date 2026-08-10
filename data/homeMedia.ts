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

// 1. Process scraped home details
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

// 3. Combined master media manifest
const rawMasterMedia: HomeMediaManifest = {
  ...catalogHomeMedia,
  ...scrapedMedia,
  ...manualMedia,
  ...tulipManufacturerMedia,
  ...craftSelectManufacturerMedia
};

// 4. Aliases Map (maps catalog long slugs to verified media)
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
  "palm-harbor-plant-city-lifestyle-waverly-15471a": "waverly-15471a",
  "buttercup": "tulip",
  "clayton-tru-mini-buttercup": "tulip",
  "the-twin-creek": "delilah",
  "timber-creek-creekside-series-the-twin-creek": "delilah",
  "select-s-1240-11fla": "select-s-1240-22a",
  "legacy-housing-select-collection-s-1240-11fla": "select-s-1240-22a"
};

// 5. Default verified manufacturer fallback photos for any catalog home
const FALLBACK_BUILDER_MEDIA: Record<string, { exterior: string; interior: string; floorplan?: string }> = {
  "CAVCO Plant City": {
    exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
    interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
    floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
  },
  "Cavco Plant City": {
    exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
    interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
    floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
  },
  "Palm Harbor Plant City": {
    exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
    interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
    floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
  },
  "Palm Harbor": {
    exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
    interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
    floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
  },
  "Cavco Plant City / Palm Harbor": {
    exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
    interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
    floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
  },
  "Cavco": {
    exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
    interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
    floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
  },
  "CLAYTON Addison": {
    exterior: "https://trove.b-cdn.net/images/lujivqtifam.jpeg",
    interior: "https://trove.b-cdn.net/images/544slnuvleg.jpeg",
    floorplan: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/floor-plans-SMALL.jpg"
  },
  "Clayton Addison": {
    exterior: "https://trove.b-cdn.net/images/lujivqtifam.jpeg",
    interior: "https://trove.b-cdn.net/images/544slnuvleg.jpeg",
    floorplan: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/floor-plans-SMALL.jpg"
  },
  "CLAYTON TRU": {
    exterior: "https://api.claytonhomes.com/images/mfg/ext/78245a95-726c-41a2-a359-99575118929b.jpg?width=992",
    interior: "https://api.claytonhomes.com/images/mfg/int/746e1ca2-6c31-4c46-8d7e-6f8012ae9404.jpg?width=992",
    floorplan: "https://api.claytonhomes.com/images/mfg/flp/1f72c341-3686-44cc-88ac-706708b51ccc.jpg"
  },
  "Clayton TRU": {
    exterior: "https://api.claytonhomes.com/images/mfg/ext/78245a95-726c-41a2-a359-99575118929b.jpg?width=992",
    interior: "https://api.claytonhomes.com/images/mfg/int/746e1ca2-6c31-4c46-8d7e-6f8012ae9404.jpg?width=992",
    floorplan: "https://api.claytonhomes.com/images/mfg/flp/1f72c341-3686-44cc-88ac-706708b51ccc.jpg"
  },
  "TRU Homes": {
    exterior: "https://api.claytonhomes.com/images/mfg/ext/78245a95-726c-41a2-a359-99575118929b.jpg?width=992",
    interior: "https://api.claytonhomes.com/images/mfg/int/746e1ca2-6c31-4c46-8d7e-6f8012ae9404.jpg?width=992",
    floorplan: "https://api.claytonhomes.com/images/mfg/flp/1f72c341-3686-44cc-88ac-706708b51ccc.jpg"
  },
  "LEGACY": {
    exterior: "https://trove.b-cdn.net/images/w29euhhlni.jpeg",
    interior: "https://trove.b-cdn.net/images/t20ukfy4gt.jpeg",
    floorplan: "https://trove.b-cdn.net/images/c6viz48buy.png"
  },
  "Legacy": {
    exterior: "https://trove.b-cdn.net/images/w29euhhlni.jpeg",
    interior: "https://trove.b-cdn.net/images/t20ukfy4gt.jpeg",
    floorplan: "https://trove.b-cdn.net/images/c6viz48buy.png"
  },
  "Legacy Housing": {
    exterior: "https://trove.b-cdn.net/images/w29euhhlni.jpeg",
    interior: "https://trove.b-cdn.net/images/t20ukfy4gt.jpeg",
    floorplan: "https://trove.b-cdn.net/images/c6viz48buy.png"
  },
  "Timber Creek": {
    exterior: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/1.jpg",
    interior: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/2.jpg",
    floorplan: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/floor-plans-SMALL.jpg"
  },
  "Timber Creek Housing": {
    exterior: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/1.jpg",
    interior: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/2.jpg",
    floorplan: "https://d132mt2yijm03y.cloudfront.net/manufacturer/3378/floorplan/226859/floor-plans-SMALL.jpg"
  }
};

const DEFAULT_GENERIC_MEDIA = {
  exterior: "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
  interior: "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
  floorplan: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg"
};

export function getImportedHomeMedia(slug: string, manufacturer?: string | null): HomeMediaEntry | undefined {
  if (!slug) return undefined;

  // Direct match
  if (rawMasterMedia[slug]?.gallery?.length) {
    return rawMasterMedia[slug];
  }

  // Alias match
  const aliasKey = SLUG_ALIASES[slug] || SLUG_ALIASES[slug.toLowerCase()];
  if (aliasKey && rawMasterMedia[aliasKey]?.gallery?.length) {
    return {
      ...rawMasterMedia[aliasKey],
      slug
    };
  }

  // Substring match
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const key in rawMasterMedia) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanSlug.includes(cleanKey) || cleanKey.includes(cleanSlug)) {
      if (rawMasterMedia[key]?.gallery?.length) {
        return {
          ...rawMasterMedia[key],
          slug
        };
      }
    }
  }

  // Fallback by manufacturer if provided
  const builderKey = manufacturer ? Object.keys(FALLBACK_BUILDER_MEDIA).find((k) => k.toLowerCase() === manufacturer.toLowerCase()) : undefined;
  const fb = (builderKey && FALLBACK_BUILDER_MEDIA[builderKey]) || (manufacturer && FALLBACK_BUILDER_MEDIA[manufacturer]) || DEFAULT_GENERIC_MEDIA;

  const gallery: ImportedGalleryItem[] = [
    { src: fb.exterior, alt: `${slug} exterior`, category: "exterior", isPrimary: true },
    { src: fb.interior, alt: `${slug} interior`, category: "interior" }
  ];
  if (fb.floorplan) {
    gallery.push({ src: fb.floorplan, alt: `${slug} floor plan`, category: "floorplan" });
  }

  return {
    slug,
    gallery,
    floorPlanImage: fb.floorplan || null,
    brochureUrl: null,
    videoUrl: null,
    virtualTourUrl: null,
    sourcePage: null
  };
}
