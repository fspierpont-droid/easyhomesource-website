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
          "alt": "alt=\"Dogwood hero, elevation, and exterior home features\" draggable=\"false\" width=\"576\" he",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fhlhud009m4m.jpeg&w=3840",
          "alt": "sidewalls Lined cabinets Rolled edge countertops MDF windowsills trim 38x78 front door Glimmer Greige Panels Shower STD with Tub option on multi-sections View similar homes Elm floor plan",
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
  }
};
