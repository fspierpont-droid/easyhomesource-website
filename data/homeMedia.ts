import { catalogHomeMedia } from "@/data/catalogHomeMedia.generated";
import { homeMedia as displayHomeMedia } from "@/data/homeMedia.generated";
import { scrapedHomeDetails } from "@/data/scrapedHomeDetails.generated";

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

const scrapedMedia: HomeMediaManifest = {};
for (const slug in scrapedHomeDetails) {
  const detail = scrapedHomeDetails[slug];
  if (detail?.media?.gallery?.length) scrapedMedia[slug] = detail.media;
}

const homeMedia: HomeMediaManifest = { ...displayHomeMedia, ...catalogHomeMedia, ...scrapedMedia };

export function getImportedHomeMedia(slug: string): HomeMediaEntry | undefined {
  return homeMedia[slug];
}
