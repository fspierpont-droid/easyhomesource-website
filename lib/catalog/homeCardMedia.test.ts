import test from "node:test";
import assert from "node:assert/strict";
import { getHomeCardMedia } from "./homeCardMedia.ts";
import type { Home } from "../../data/homes.ts";

function home(overrides: Partial<Home>): Home {
  return {
    id: "test-home",
    name: "Test Home",
    slug: "test-home",
    status: "Available",
    isActive: true,
    isFeatured: false,
    isOnDisplay: false,
    isCatalogModel: true,
    isNewArrival: false,
    isSpecialOffer: false,
    isComingSoon: false,
    shortDescription: "Test",
    features: [],
    standardFeatures: [],
    images: [],
    gallery: [],
    createdAt: "2026-09-02",
    ...overrides,
  } as Home;
}

test("prefers an exterior elevation even when an interior is primary", () => {
  const selected = getHomeCardMedia(home({
    gallery: [
      { src: "/kitchen.jpg", alt: "Kitchen", category: "kitchen", isPrimary: true },
      { src: "/front.jpg", alt: "Front exterior elevation", category: "exterior" },
      { src: "/floorplan.jpg", alt: "Floor plan", category: "floorplan" },
    ],
  }));

  assert.equal(selected?.src, "/front.jpg");
  assert.equal(selected?.category, "exterior");
});

test("uses the floor plan when no exterior exists", () => {
  const selected = getHomeCardMedia(home({
    floorPlanImage: "/official-floorplan.jpg",
    gallery: [
      { src: "/kitchen.jpg", alt: "Kitchen", category: "kitchen", isPrimary: true },
    ],
  }));

  assert.equal(selected?.src, "/official-floorplan.jpg");
  assert.equal(selected?.category, "floorplan");
});

test("falls back to a remaining photo only after exterior and floorplan", () => {
  const selected = getHomeCardMedia(home({
    gallery: [
      { src: "/living.jpg", alt: "Living room", category: "interior" },
    ],
  }));

  assert.equal(selected?.src, "/living.jpg");
});
