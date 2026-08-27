import type { HomeMediaManifest } from "@/data/homeMedia";
import { timberCreekCatalog, timberCreekCatalogBySlug } from "@/data/timberCreekCatalog";

const floorplanOnlyMedia: HomeMediaManifest = Object.fromEntries(
  timberCreekCatalog.map((home) => [
    home.slug,
    {
      slug: home.slug,
      gallery: [
        {
          src: home.floorPlanImage,
          alt: `${home.displayName} floor plan`,
          category: "floorplan" as const,
          isPrimary: true,
          sourceUrl: home.sourcePage,
        },
      ],
      floorPlanImage: home.floorPlanImage,
      brochureUrl: home.brochureUrl,
      videoUrl: null,
      virtualTourUrl: null,
      sourcePage: home.sourcePage,
    },
  ]),
);

const lakeWood = timberCreekCatalogBySlug["lake-wood-cs-3254"];
const cedarCreek = timberCreekCatalogBySlug["cedar-creek-cs-3240"];
const lakeWoodBase = "https://d132mt2yijm03y.cloudfront.net/manufacturer/3391/floorplan/235413";
const cedarCreekBase = "https://d132mt2yijm03y.cloudfront.net/manufacturer/3391/floorplan/237172";

const richMediaOverrides: HomeMediaManifest = {
  "lake-wood-cs-3254": {
    slug: "lake-wood-cs-3254",
    gallery: [
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-ext-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 exterior", category: "exterior", isPrimary: true, sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-ext-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 exterior view 2", category: "exterior", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-ext-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 exterior view 3", category: "exterior", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-int-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 interior", category: "interior", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-int-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 living area", category: "interior", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-int-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 interior view 3", category: "interior", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 2", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 3", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-4_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 4", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-5_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 5", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-6_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 6", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-7_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 7", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-8_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 8", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-9_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 9", category: "kitchen", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom", category: "bedroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 2", category: "bedroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 3", category: "bedroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-4_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 4", category: "bedroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-5_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 5", category: "bedroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom", category: "bathroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom view 2", category: "bathroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom view 3", category: "bathroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-4_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom view 4", category: "bathroom", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-uti-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 utility room", category: "other", sourceUrl: lakeWood.sourcePage },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-uti-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 utility room view 2", category: "other", sourceUrl: lakeWood.sourcePage },
      { src: lakeWood.floorPlanImage, alt: "The Lake Wood CS-3254 floor plan", category: "floorplan", sourceUrl: lakeWood.sourcePage },
    ],
    floorPlanImage: lakeWood.floorPlanImage,
    brochureUrl: lakeWood.brochureUrl,
    videoUrl: null,
    virtualTourUrl: "https://my.matterport.com/show/?m=8qr1HTetnD2",
    sourcePage: lakeWood.sourcePage,
  },
  "cedar-creek-cs-3240": {
    slug: "cedar-creek-cs-3240",
    gallery: [
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior", category: "exterior", isPrimary: true, sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior view 2", category: "exterior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior view 3", category: "exterior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior view 4", category: "exterior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/cedar%20creek1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior detail", category: "exterior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior", category: "interior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 living area", category: "interior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 3", category: "interior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 4", category: "interior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-5_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 5", category: "interior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-6_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 6", category: "interior", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 2", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 3", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 4", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-5_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 5", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-6_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 6", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-7_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 7", category: "kitchen", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom", category: "bedroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 2", category: "bedroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 3", category: "bedroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 4", category: "bedroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-5_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 5", category: "bedroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-6_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 6", category: "bedroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bath-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bathroom", category: "bathroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bath-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bathroom view 2", category: "bathroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bath-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bathroom view 3", category: "bathroom", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-uti-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 utility room", category: "other", sourceUrl: cedarCreek.sourcePage },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-uti-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 utility room view 2", category: "other", sourceUrl: cedarCreek.sourcePage },
      { src: cedarCreek.floorPlanImage, alt: "The Cedar Creek CS-3240 floor plan", category: "floorplan", sourceUrl: cedarCreek.sourcePage },
    ],
    floorPlanImage: cedarCreek.floorPlanImage,
    brochureUrl: cedarCreek.brochureUrl,
    videoUrl: null,
    virtualTourUrl: "https://my.matterport.com/show/?m=8E2JJVrweP1",
    sourcePage: cedarCreek.sourcePage,
  },
};

export const timberCreekCatalogMedia: HomeMediaManifest = {
  ...floorplanOnlyMedia,
  ...richMediaOverrides,
};
