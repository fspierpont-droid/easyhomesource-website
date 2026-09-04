import type { Home, HomeGalleryItem } from "@/data/homes";

export type HomeCardMedia = Pick<HomeGalleryItem, "src" | "alt" | "category">;

const FRONT_ELEVATION_PATTERN = /\b(front|frontage|elevation|exterior rendering|exterior view|street view|facade|façade)\b/i;

/**
 * Customer-facing catalog cards should lead with the home itself, not an interior
 * photo that happened to be marked primary by a source site.
 *
 * Priority:
 * 1. verified primary exterior/elevation
 * 2. exterior explicitly described as front/elevation
 * 3. any exterior
 * 4. floor plan
 * 5. best remaining non-video image
 */
export function getHomeCardMedia(home: Home): HomeCardMedia | null {
  const gallery = Array.isArray(home.gallery) ? home.gallery : [];
  const exteriors = gallery.filter((item) => item.category === "exterior" && Boolean(item.src));

  const primaryExterior = exteriors.find((item) => item.isPrimary);
  if (primaryExterior) return primaryExterior;

  const frontExterior = exteriors.find((item) =>
    FRONT_ELEVATION_PATTERN.test(`${item.alt ?? ""} ${item.src ?? ""}`),
  );
  if (frontExterior) return frontExterior;

  if (exteriors[0]) return exteriors[0];

  if (home.floorPlanImage) {
    return {
      src: home.floorPlanImage,
      alt: `${home.displayName ?? home.name} floor plan`,
      category: "floorplan",
    };
  }

  const floorPlan = gallery.find((item) => item.category === "floorplan" && Boolean(item.src));
  if (floorPlan) return floorPlan;

  const primaryPhoto = gallery.find(
    (item) => item.isPrimary && !["video", "floorplan"].includes(item.category) && Boolean(item.src),
  );
  if (primaryPhoto) return primaryPhoto;

  const remainingPhoto = gallery.find(
    (item) => !["video", "floorplan"].includes(item.category) && Boolean(item.src),
  );
  if (remainingPhoto) return remainingPhoto;

  const fallback = home.images?.find(Boolean);
  return fallback
    ? {
        src: fallback,
        alt: `${home.displayName ?? home.name} manufactured home`,
        category: "other",
      }
    : null;
}
