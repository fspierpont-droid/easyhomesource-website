import { catalogHomeMedia } from "@/data/catalogHomeMedia.generated";
import { homeMedia as displayHomeMedia } from "@/data/homeMedia.generated";
import { scrapedHomeDetails } from "@/data/scrapedHomeDetails.generated";
import { tulipManufacturerMedia } from "@/data/tulipManufacturerMedia";
import { craftSelectManufacturerMedia } from "@/data/craftSelectManufacturerMedia";

export type ImportedMediaCategory = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "brochure" | "video" | "other";

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

function sanitizeScrapedMedia(entry: HomeMediaEntry): HomeMediaEntry | null {
  const gallery = entry.gallery.filter((item) => {
    const alt = item.alt || "";
    return !/view similar homes|raw media link/i.test(alt);
  });

  if (!gallery.length) return null;

  const hasPrimary = gallery.some((item) => item.isPrimary);
  if (!hasPrimary) gallery[0] = { ...gallery[0], isPrimary: true };

  return {
    ...entry,
    gallery,
    floorPlanImage: gallery.find((item) => item.category === "floorplan")?.src ?? null
  };
}

const scrapedMedia: HomeMediaManifest = {};
for (const slug in scrapedHomeDetails) {
  const detail = scrapedHomeDetails[slug];
  if (!detail?.media?.gallery?.length) continue;
  const sanitized = sanitizeScrapedMedia(detail.media);
  if (sanitized) scrapedMedia[slug] = sanitized;
}

const homeMedia: HomeMediaManifest = {
  ...displayHomeMedia,
  ...catalogHomeMedia,
  ...scrapedMedia,
  ...tulipManufacturerMedia,
  ...craftSelectManufacturerMedia
};

export function getImportedHomeMedia(slug: string): HomeMediaEntry | undefined {
  return homeMedia[slug];
}
