import type { HomeMediaManifest } from "@/data/homeMedia";
import { catalogHomeMedia } from "@/data/catalogHomeMedia";
import { manualMedia } from "@/data/catalogHomeMedia.manual";
import { scrapedMedia } from "@/data/scrapedHomeDetails.generated";
import { tulipManufacturerMedia } from "@/data/tulipManufacturerMedia";
import { craftSelectManufacturerMedia } from "@/data/craftSelectManufacturerMedia";
import { boujee2ManufacturerMedia } from "@/data/boujee2ManufacturerMedia";
import { craftSelect15663aManufacturerMedia } from "@/data/craftSelect15663aManufacturerMedia";

const rawMasterMedia: HomeMediaManifest = {
  ...catalogHomeMedia,
  ...manualMedia,
  ...scrapedMedia,
  ...tulipManufacturerMedia,
  ...craftSelectManufacturerMedia,
  ...boujee2ManufacturerMedia,
  ...craftSelect15663aManufacturerMedia
};

export function getHomeMedia(slug: string) {
  return rawMasterMedia[slug] || null;
}

export function getAllHomeMediaSlugs(): string[] {
  return Object.keys(rawMasterMedia);
}
