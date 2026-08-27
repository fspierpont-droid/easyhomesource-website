import type { HomeMediaManifest } from "@/data/homeMedia";

const LAKE_WOOD_SOURCE = "https://www.timbercreekhousing.com/floorplan/235413/creekside-series/the-lake-wood-cs-3254/";
const CEDAR_CREEK_SOURCE = "https://www.timbercreekhousing.com/floorplan/237172-5774/easy-homesource/hernando/creekside-series/the-cedar-creek-cs-3240/";

const lakeWoodBase = "https://d132mt2yijm03y.cloudfront.net/manufacturer/3391/floorplan/235413";
const cedarCreekBase = "https://d132mt2yijm03y.cloudfront.net/manufacturer/3391/floorplan/237172";

export const timberCreekCatalogMedia: HomeMediaManifest = {
  "lake-wood-cs-3254": {
    slug: "lake-wood-cs-3254",
    gallery: [
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-ext-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 exterior", category: "exterior", isPrimary: true, sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-ext-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 exterior view 2", category: "exterior", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-ext-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 exterior view 3", category: "exterior", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-int-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 interior", category: "interior", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-int-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 living area", category: "interior", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-int-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 interior view", category: "interior", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 2", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 3", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-4_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 4", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-5_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 5", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-6_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 6", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-7_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 7", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-8_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 8", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-kit-9_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 kitchen view 9", category: "kitchen", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom", category: "bedroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 2", category: "bedroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 3", category: "bedroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-4_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 4", category: "bedroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bed-5_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bedroom view 5", category: "bedroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom", category: "bathroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom view 2", category: "bathroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-3_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom view 3", category: "bathroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-bath-4_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 bathroom view 4", category: "bathroom", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-uti-1_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 utility room", category: "other", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/biloxi2025-The%20Lake%20Wood%20CS-3254-uti-2_thumb_xxl.jpg`, alt: "The Lake Wood CS-3254 utility room view 2", category: "other", sourceUrl: LAKE_WOOD_SOURCE },
      { src: `${lakeWoodBase}/3254.jpg`, alt: "The Lake Wood CS-3254 floor plan", category: "floorplan", sourceUrl: LAKE_WOOD_SOURCE }
    ],
    floorPlanImage: `${lakeWoodBase}/3254.jpg`,
    brochureUrl: null,
    videoUrl: null,
    virtualTourUrl: "https://my.matterport.com/show/?m=8qr1HTetnD2",
    sourcePage: LAKE_WOOD_SOURCE
  },
  "cedar-creek-cs-3240": {
    slug: "cedar-creek-cs-3240",
    gallery: [
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior", category: "exterior", isPrimary: true, sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior view 2", category: "exterior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior view 3", category: "exterior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-ext-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior view 4", category: "exterior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/cedar%20creek1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 exterior detail", category: "exterior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior", category: "interior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 living area", category: "interior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 3", category: "interior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 4", category: "interior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-5_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 5", category: "interior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-int-6_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 interior view 6", category: "interior", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 2", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 3", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 4", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-5_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 5", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-6_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 6", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-kit-7_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 kitchen view 7", category: "kitchen", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom", category: "bedroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 2", category: "bedroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 3", category: "bedroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-4_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 4", category: "bedroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-5_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 5", category: "bedroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bed-6_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bedroom view 6", category: "bedroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bath-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bathroom", category: "bathroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bath-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bathroom view 2", category: "bathroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-bath-3_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 bathroom view 3", category: "bathroom", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-uti-1_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 utility room", category: "other", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/The%20Cedar%20Creek%20CS-3240-uti-2_thumb_xxl.jpg`, alt: "The Cedar Creek CS-3240 utility room view 2", category: "other", sourceUrl: CEDAR_CREEK_SOURCE },
      { src: `${cedarCreekBase}/3240.jpg`, alt: "The Cedar Creek CS-3240 floor plan", category: "floorplan", sourceUrl: CEDAR_CREEK_SOURCE }
    ],
    floorPlanImage: `${cedarCreekBase}/3240.jpg`,
    brochureUrl: null,
    videoUrl: null,
    virtualTourUrl: "https://my.matterport.com/show/?m=8E2JJVrweP1",
    sourcePage: CEDAR_CREEK_SOURCE
  }
};
