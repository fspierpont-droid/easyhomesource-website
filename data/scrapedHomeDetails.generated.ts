import type { HomeMediaManifest } from "@/data/homeMedia";

export type ScrapedHomeDetail = {
  slug: string;
  sourcePage: string | null;
  startingPrice: number | null;
  priceLabel: string | null;
  media: HomeMediaManifest[string] | null;
};

export const scrapedHomeDetails: Record<string, ScrapedHomeDetail> = {
  "dogwood": {
    "slug": "dogwood",
    "sourcePage": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood",
    "startingPrice": 61900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "dogwood",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fpz3trw21p3f.jpeg&w=3840",
          "alt": "Dogwood exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fhlhud009m4m.jpeg&w=3840",
          "alt": "Dogwood floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood"
        }
      ],
      "floorPlanImage": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fhlhud009m4m.jpeg&w=3840",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood"
    }
  },
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
          "alt": "Oak exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fed21y2hdjl.jpeg&w=3840",
          "alt": "Oak floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak"
        }
      ],
      "floorPlanImage": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fed21y2hdjl.jpeg&w=3840",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/tru-homes-tru-origin-spruce-oak"
    }
  }
};
