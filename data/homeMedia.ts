import { homeMedia } from "@/data/homeMedia.generated";

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

export function getImportedHomeMedia(slug: string): HomeMediaEntry | undefined {
  return homeMedia[slug];
}
