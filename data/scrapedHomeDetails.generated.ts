import type { HomeMediaManifest } from "@/data/homeMedia";

export type ScrapedHomeDetail = {
  slug: string;
  sourcePage: string | null;
  startingPrice: number | null;
  priceLabel: string | null;
  media: HomeMediaManifest[string] | null;
};

export const scrapedHomeDetails: Record<string, ScrapedHomeDetail> = {
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
          "alt": "alt=\"Move on up elevation, exterior, and hero home features\" draggable=\"false\" width=\"992\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fdzq33mtzd38.jpeg&w=3840",
          "alt": "alt=\"Move on up elevation and exterior home features\" draggable=\"false\" width=\"992\" height",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqfl45outyb.jpeg&w=3840",
          "alt": "alt=\"Move on up elevation and exterior home features\" draggable=\"false\" width=\"992\" height",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fjd5hpm6i8d.jpeg&w=3840",
          "alt": "alt=\"Move on up elevation and exterior home features\" draggable=\"false\" width=\"992\" height",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F8xjofa94iyr.jpeg&w=3840",
          "alt": "alt=\"Move on up interior home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fk88ebokol2.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Baby Boujee bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F7mub8yumxbc.jpeg&w=3840",
          "alt": "alt=\"Move on up bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fpselhkujr9k.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Baby Boujee bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffnha8oj7hlc.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Baby Boujee bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fanlp8lbb4sf.png&w=3840",
          "alt": "alt=\"Move on up bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ff7yftji5qik.png&w=3840",
          "alt": "alt=\"Move on up bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F31o6qzqttij.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Baby Boujee kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F8xlcqimrtbt.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Baby Boujee kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F68mbqldby6.jpeg&w=3840",
          "alt": "alt=\"Move on up interior home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqarjcw20gi.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Baby Boujee floor plan",
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
