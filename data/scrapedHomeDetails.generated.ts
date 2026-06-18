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
  },
  "atmos-28603n": {
    "slug": "atmos-28603n",
    "sourcePage": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n",
    "startingPrice": 157900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "atmos-28603n",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffz9zshsmurd.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n hero, elevation, and exterior home features\" draggable=\"false\" width=\"13",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffv7t1304qsw.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n exterior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fxzsd8iy606.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1twuy4tcfd3.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ftnrhemf8rv.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fmnwdisu0ed.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F6o15qfmf3um.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fgnd0p4d5hwb.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1rjxyr8omkp.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fmjffuxvoyh.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fz7t5nt9uupp.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1iywew4zq5r.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fzqd04ebs2t.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fuvfunsfatap.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Furi02alj58.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F0n4o0hwuv4b.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fsk44uab7g9q.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F8fp5bd95n4x.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1u5ywxp1xjx.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fnc3yxeog0d.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fmat1xf7kcr.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fiov43efg9e.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fejur13625j.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fitb7xbnntjf.jpeg&w=3840",
          "alt": "alt=\"Atmos 28603n bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        }
      ],
      "floorPlanImage": null,
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
    }
  },
  "hey-jude": {
    "slug": "hey-jude",
    "sourcePage": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude",
    "startingPrice": 118900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "hey-jude",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F0h5o716vepmq.jpeg&w=3840",
          "alt": "alt=\"Hey jude hero, elevation, and exterior home features\" draggable=\"false\" width=\"992\" h",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fbqi90s5mzjo.jpeg&w=3840",
          "alt": "alt=\"Hey jude elevation and exterior home features\" draggable=\"false\" width=\"992\" height=\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1lhf3hvu8u5h.jpeg&w=3840",
          "alt": "alt=\"Hey jude elevation and exterior home features\" draggable=\"false\" width=\"992\" height=\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fxonzbyavkt.jpeg&w=3840",
          "alt": "alt=\"Hey jude elevation and exterior home features\" draggable=\"false\" width=\"992\" height=\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Frbary39ljqd.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fo2gsudzhif.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fxjqbvpzj6mi.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fg7hhxvniinc.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4hqab27l7pr.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqw4vbdo2y.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fphk7uciz8ag.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fv4vizfjwocq.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4ka1dy3efql.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fjjqcyh3d6zp.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Flycc3y32wro.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F6epjvphz4i8.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fs9r00wwifs.jpeg&w=3840",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        }
      ],
      "floorPlanImage": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fs9r00wwifs.jpeg&w=3840",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
    }
  },
  "boujee-xl-2": {
    "slug": "boujee-xl-2",
    "sourcePage": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2",
    "startingPrice": 159900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "boujee-xl-2",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffdfd6y96cy5.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 elevation and exterior home features\" draggable=\"false\" width=\"1400\" heig",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Frkm3xkavtdl.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 hero, elevation, and exterior home features\" draggable=\"false\" width=\"140",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Frgmy02raz4h.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 elevation and exterior home features\" draggable=\"false\" width=\"1400\" heig",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Favsgjrzkjad.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 elevation and exterior home features\" draggable=\"false\" width=\"1400\" heig",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F2wri99mqybs.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 bathroom home features\" draggable=\"false\" width=\"1400\" height=\"788\" decod",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ft8j6mufumom.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 bathroom home features\" draggable=\"false\" width=\"1400\" height=\"788\" decod",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ft65buhoyx1k.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 bedroom home features\" draggable=\"false\" width=\"1400\" height=\"788\" decodi",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fd4yblp7lsqf.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 interior home features\" draggable=\"false\" width=\"1400\" height=\"788\" decod",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fx65306wwuio.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 kitchen home features\" draggable=\"false\" width=\"1400\" height=\"788\" decodi",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fkcmcq0la7hh.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 kitchen home features\" draggable=\"false\" width=\"1400\" height=\"788\" decodi",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fbjvq4yngdje.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 interior home features\" draggable=\"false\" width=\"1400\" height=\"788\" decod",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fuyyg6rvhnx.jpeg&w=3840",
          "alt": "alt=\"Boujee xl 2 interior home features\" draggable=\"false\" width=\"1400\" height=\"788\" decod",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F0h5o716vepmq.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fbqi90s5mzjo.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1lhf3hvu8u5h.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fxonzbyavkt.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Frbary39ljqd.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fo2gsudzhif.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fxjqbvpzj6mi.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fg7hhxvniinc.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4hqab27l7pr.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fqw4vbdo2y.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fphk7uciz8ag.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fv4vizfjwocq.jpeg&w=3840",
          "alt": "raw media link",
          "category": "other",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
        }
      ],
      "floorPlanImage": null,
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/clayton-addison-boujee-series-boujee-xl-2"
    }
  }
};
