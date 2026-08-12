import type { HomeMediaManifest } from "@/data/homeMedia";

const sourcePage = "https://www.cavcohomes.com/our-retailers/us/fl/east-palatka/hercules-homes/display-homes/cav340fl25-24304a-craft-select";

export const craftSelectManufacturerMedia: HomeMediaManifest = {
  "craft-select-28603a": {
    slug: "craft-select-28603a",
    gallery: [
      {
        src: "/homes/craft-select-28603a/exterior/craft-select-28603a-exterior-01.jpg",
        alt: "Craft Select 28603A exterior 3D rendering front elevation",
        category: "exterior",
        isPrimary: true,
        sourceUrl: sourcePage
      },
      {
        src: "/homes/craft-select-28603a/exterior/craft-select-28603a-elevation-01.gif",
        alt: "Craft Select 28603A architectural blueprint elevation profile",
        category: "exterior",
        isPrimary: false,
        sourceUrl: sourcePage
      },
      {
        src: "/homes/craft-select-28603a/floorplan/craft-select-28603a-floorplan-01.jpg",
        alt: "Craft Select 28603A floor plan schematic layout (26' 8\" x 60')",
        category: "floorplan",
        isPrimary: false,
        sourceUrl: sourcePage
      },
      {
        src: "/homes/craft-select-28603a/kitchen/craft-select-28603a-kitchen-01.jpg",
        alt: "Craft Select 28603A kitchen island and cabinetry",
        category: "kitchen",
        isPrimary: false,
        sourceUrl: sourcePage
      },
      {
        src: "/homes/craft-select-28603a/kitchen/craft-select-28603a-kitchen-02.jpg",
        alt: "Craft Select 28603A kitchen dining area and finishes",
        category: "kitchen",
        isPrimary: false,
        sourceUrl: sourcePage
      }
    ],
    floorPlanImage: "/homes/craft-select-28603a/floorplan/craft-select-28603a-floorplan-01.jpg",
    brochureUrl: null,
    videoUrl: null,
    virtualTourUrl: null,
    sourcePage
  }
};
