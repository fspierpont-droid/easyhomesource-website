import type { HomeMediaManifest } from "@/data/homeMedia";

const sourcePage = "https://owntru.com/models/trt28564ah/";

/**
 * OVERRIDE for Oak scraped data.
 * The scraper tagged 12 Clayton CDN photos as generic "interior".
 * These need manual review to determine if they are kitchen, bedroom, bathroom, living room, etc.
 *
 * TO FIX: Open each URL below, identify the room, update the category.
 * Valid categories: "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "other"
 */

export const oakMediaOverride: HomeMediaManifest = {
  "oak": {
    slug: "oak",
    gallery: [
      // Floorplans (2) - verified correct
      { src: "https://api.claytonhomes.com/images/mfg/flp/b39166d9-b876-4d71-8cab-9edd5737b085.jpg", alt: "TRU Oak floor plan 1", category: "floorplan", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/flp/567a9f12-84da-4806-a690-2bb89c84b847.jpg", alt: "TRU Oak floor plan 2", category: "floorplan", isPrimary: false, sourceUrl: sourcePage },

      // Exterior (1) - verified correct
      { src: "https://api.claytonhomes.com/images/mfg/ext/3dc342ec-d51d-48af-b046-2a3d005befff.jpg", alt: "TRU Oak exterior front elevation", category: "exterior", isPrimary: true, sourceUrl: sourcePage },

      // ⚠️ REVIEW NEEDED - all tagged as "interior" by scraper. Open each URL and set correct category.
      { src: "https://api.claytonhomes.com/images/mfg/int/872a2045-3aae-4307-a1c2-dafe8c7dc647.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/5fd281b1-6238-4cf6-85c5-8d18018b4882.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/7e552794-7b6f-4207-b8d5-8cc48d4b7f32.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/df1ba59e-3196-4aeb-95fa-24d54f9772ae.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/40233ba5-e41c-4ee1-a3fc-f2a1e1e3e481.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/a1268c5c-ee8d-4353-9624-0e2ebc2a4620.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/81f23c49-2436-4507-83c7-97de468b9035.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/4584528f-6b1c-4e2d-920d-41fac2edea13.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/55de80c7-e22b-4575-85b4-22bd5e0f6de3.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/19ed1fa6-2efa-46d3-9fb8-011d6c853e4c.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/cd907f0b-fcbf-4d8c-aa71-912cc3e94271.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage },
      { src: "https://api.claytonhomes.com/images/mfg/int/eb9a36b9-f0d4-4b55-afa2-507ce6b15470.jpg", alt: "TRU Oak — REVIEW NEEDED (was interior)", category: "interior", isPrimary: false, sourceUrl: sourcePage }
    ],
    floorPlanImage: "https://api.claytonhomes.com/images/mfg/flp/b39166d9-b876-4d71-8cab-9edd5737b085.jpg",
    brochureUrl: null,
    videoUrl: null,
    virtualTourUrl: null,
    sourcePage
  }
};
