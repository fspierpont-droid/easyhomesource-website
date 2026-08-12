import type { HomeMediaManifest } from "@/data/homeMedia";
import { catalogHomeMedia } from "@/data/catalogHomeMedia";
import { manualMedia } from "@/data/catalogHomeMedia.manual";
import { scrapedMedia } from "@/data/scrapedHomeDetails.generated";
import { tulipManufacturerMedia } from "@/data/tulipManufacturerMedia";
import { craftSelectManufacturerMedia } from "@/data/craftSelectManufacturerMedia";
import { boujee2ManufacturerMedia } from "@/data/boujee2ManufacturerMedia";
import { craftSelect15663aManufacturerMedia } from "@/data/craftSelect15663aManufacturerMedia";
import { boujeeXl2MediaOverride } from "@/data/boujeeXl2MediaOverride";
import { oakMediaOverride } from "@/data/oakMediaOverride";

const rawMasterMedia: HomeMediaManifest = {
  ...catalogHomeMedia,
  ...manualMedia,
  ...scrapedMedia,
  ...tulipManufacturerMedia,
  ...craftSelectManufacturerMedia,
  ...boujee2ManufacturerMedia,
  ...craftSelect15663aManufacturerMedia,
  ...boujeeXl2MediaOverride,
  ...oakMediaOverride
};

export function getHomeMedia(slug: string) {
  return rawMasterMedia[slug] || null;
}

/** @deprecated Use getHomeMedia instead. Kept for backward compatibility with homes.ts. */
export const getImportedHomeMedia = getHomeMedia;

export function getAllHomeMediaSlugs(): string[] {
  return Object.keys(rawMasterMedia);
}
