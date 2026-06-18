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
  },
  "move-on-up": {
    "slug": "move-on-up",
    "sourcePage": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up",
    "startingPrice": 94900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "move-on-up",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F544slnuvleg.jpeg&w=3840",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fdzq33mtzd38.jpeg&w=3840",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqfl45outyb.jpeg&w=3840",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fjd5hpm6i8d.jpeg&w=3840",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F8xjofa94iyr.jpeg&w=3840",
          "alt": "Move on Up interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fk88ebokol2.jpeg&w=3840",
          "alt": "Move on Up bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F7mub8yumxbc.jpeg&w=3840",
          "alt": "Move on Up bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fpselhkujr9k.jpeg&w=3840",
          "alt": "Move on Up bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffnha8oj7hlc.jpeg&w=3840",
          "alt": "Move on Up bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fanlp8lbb4sf.png&w=3840",
          "alt": "Move on Up bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ff7yftji5qik.png&w=3840",
          "alt": "Move on Up bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F31o6qzqttij.jpeg&w=3840",
          "alt": "Move on Up kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F8xlcqimrtbt.jpeg&w=3840",
          "alt": "Move on Up kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F68mbqldby6.jpeg&w=3840",
          "alt": "Move on Up interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqarjcw20gi.jpeg&w=3840",
          "alt": "Move on Up floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        }
      ],
      "floorPlanImage": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqarjcw20gi.jpeg&w=3840",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
    }
  }
};
