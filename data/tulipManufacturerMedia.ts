import type { HomeMediaManifest } from "@/data/homeMedia";

const sourcePage = "https://owntru.com/models/trt12482ph/";

export const tulipManufacturerMedia: HomeMediaManifest = {
  tulip: {
    slug: "tulip",
    gallery: [
      {
        src: "https://api.claytonhomes.com/images/mfg/ext/78245a95-726c-41a2-a359-99575118929b.jpg?width=992",
        alt: "Tulip manufactured home exterior",
        category: "exterior",
        isPrimary: true,
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/746e1ca2-6c31-4c46-8d7e-6f8012ae9404.jpg?width=992",
        alt: "Tulip foyer and living area",
        category: "interior",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/c623184e-1811-45b3-8138-77c28b513243.jpg?width=992",
        alt: "Tulip kitchen with wood-tone cabinetry",
        category: "kitchen",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/00cf000e-82b6-496d-a824-4f3b488f291e.jpg?width=992",
        alt: "Tulip kitchen with white cabinetry",
        category: "kitchen",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/07446efb-d2c1-4975-af63-9a1b654b8789.jpg?width=992",
        alt: "Tulip utility area",
        category: "other",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/f5fa81ac-9ab1-44dd-91e1-48f6ef904c94.jpg?width=992",
        alt: "Tulip living room",
        category: "interior",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/76a95adb-4cc7-4882-8aa6-61159f2646a4.jpg?width=992",
        alt: "Tulip primary bedroom",
        category: "bedroom",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/b47fb999-1e63-46f1-9960-2724fcecf4dd.jpg?width=992",
        alt: "Tulip bathroom",
        category: "bathroom",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/int/1cec0b56-e22d-450d-9a4f-4096739b349e.jpg?width=992",
        alt: "Tulip guest bedroom",
        category: "bedroom",
        sourceUrl: sourcePage
      },
      {
        src: "https://api.claytonhomes.com/images/mfg/flp/1f72c341-3686-44cc-88ac-706708b51ccc.jpg",
        alt: "Tulip TRT12482PH floor plan",
        category: "floorplan",
        sourceUrl: sourcePage
      }
    ],
    floorPlanImage: "https://api.claytonhomes.com/images/mfg/flp/1f72c341-3686-44cc-88ac-706708b51ccc.jpg",
    brochureUrl: "https://owntru.com/wp-content/uploads/2026/03/TRT12482PH_Tulip_SalesSheet_031826.pdf",
    videoUrl: null,
    virtualTourUrl: "https://momento360.com/e/uc/c610d5b7972c4474a34423a5b60fd7de?utm_campaign=embed&utm_source=other&reset-heading=true&size=large",
    sourcePage
  }
};
