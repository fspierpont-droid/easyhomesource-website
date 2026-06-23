import type { HomeMediaManifest } from "@/data/homeMedia";

const sourcePage = "https://easyhomesource.com/homes/palm-harbor-plant-city-craft-select-28603a";

export const craftSelectManufacturerMedia: HomeMediaManifest = {
  "craft-select-28603a": {
    slug: "craft-select-28603a",
    gallery: [
      {
        src: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg",
        alt: "Craft Select 28603A floor plan",
        category: "floorplan",
        isPrimary: true,
        sourceUrl: sourcePage
      }
    ],
    floorPlanImage: "https://trove.b-cdn.net/images/chsd69aabrr.jpeg",
    brochureUrl: `${sourcePage}/pdf`,
    videoUrl: null,
    virtualTourUrl: null,
    sourcePage
  }
};
