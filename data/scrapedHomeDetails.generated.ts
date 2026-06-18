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
  },
  "born-to-run": {
    "slug": "born-to-run",
    "sourcePage": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run",
    "startingPrice": 89875,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "born-to-run",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Flujivqtifam.jpeg&w=3840",
          "alt": "alt=\"Born to run elevation and exterior home features\" draggable=\"false\" width=\"992\" heigh",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fs6p9zj2clo.jpeg&w=3840",
          "alt": "alt=\"Born to run elevation and exterior home features\" draggable=\"false\" width=\"992\" heigh",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fbpwq47aeiwo.jpeg&w=3840",
          "alt": "alt=\"Born to run elevation, exterior, and hero home features\" draggable=\"false\" width=\"992",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fgbszljl5gs6.jpeg&w=3840",
          "alt": "alt=\"Born to run elevation and exterior home features\" draggable=\"false\" width=\"992\" heigh",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fsvvl01g9lmm.jpeg&w=3840",
          "alt": "alt=\"Born to run interior home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F5olqzlul049.jpeg&w=3840",
          "alt": "alt=\"Born to run bedroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1nqji82zrgq.jpeg&w=3840",
          "alt": "alt=\"Born to run bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fwmqm3x3v6ji.jpeg&w=3840",
          "alt": "alt=\"Born to run bedroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F6d93o02ogz9.jpeg&w=3840",
          "alt": "alt=\"Born to run kitchen home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fzwadmb9buj.jpeg&w=3840",
          "alt": "alt=\"Born to run interior home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F5jbgjh0m7f5.jpeg&w=3840",
          "alt": "alt=\"Born to run bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F040o1k9n1y57.jpeg&w=3840",
          "alt": "alt=\"Born to run bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F3mldjhm4rgn.jpeg&w=3840",
          "alt": "alt=\"Born to run kitchen home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Flwcq26pvxzd.jpeg&w=3840",
          "alt": "alt=\"Born to run kitchen home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Filaeo5y7dje.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brooksville Move on Up floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        }
      ],
      "floorPlanImage": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Filaeo5y7dje.jpeg&w=3840",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
    }
  },
  "classic-c-1672-32c": {
    "slug": "classic-c-1672-32c",
    "sourcePage": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c",
    "startingPrice": 83900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "classic-c-1672-32c",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fxru152hdf5r.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fssjx6nekt2e.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F830c674qerd.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Frjhll5e5tsr.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fzqsqjugswp.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F79v1nv0vcty.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fy28urlc3my8.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fhkw4q13a9w6.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fpxnm8sb43ma.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fhz1esxrfc8s.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4wdqfi49ebe.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F08wuniig06w6.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fhl99tph0a6p.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fncqk7tc38dn.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fv6pbdn65b.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fo1lfit0uvzq.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fu7836p65s7.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fipynwbe2t1.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fdrh99wbpi8.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fvluqcsu1y7k.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fmtymuv3e62.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffcufqnnevc.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fsccrl34r7ug.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Flfidcusmsv.jpeg&w=3840",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        }
      ],
      "floorPlanImage": null,
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
    }
  }
};
