import type { HomeMediaManifest } from "@/data/homeMedia";

export type ScrapedHomeDetail = {
  slug: string;
  sourcePage: string | null;
  startingPrice: number | null;
  priceLabel: string | null;
  media: HomeMediaManifest[string] | null;
};

export const scrapedHomeDetails: Record<string, ScrapedHomeDetail> = {
  "oak": {
    "slug": "oak",
    "sourcePage": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak",
    "startingPrice": 100900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "oak",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fjt8x77rys.jpeg&w=3840",
          "alt": "alt=\"Oak hero, elevation, and exterior home features\" draggable=\"false\" width=\"992\" height",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fed21y2hdjl.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak"
        }
      ],
      "floorPlanImage": null,
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak"
    }
  }
};
