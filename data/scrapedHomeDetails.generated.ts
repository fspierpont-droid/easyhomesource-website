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
    "sourcePage": "https://owntru.com/models/trt28564ah/",
    "startingPrice": null,
    "priceLabel": "Call/Text for starting price",
    "media": {
      "slug": "oak",
      "gallery": [
            {
                  "src": "https://api.claytonhomes.com/images/mfg/flp/b39166d9-b876-4d71-8cab-9edd5737b085.jpg",
                  "alt": "TRU Oak floorplan 0",
                  "category": "floorplan",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/flp/567a9f12-84da-4806-a690-2bb89c84b847.jpg",
                  "alt": "TRU Oak floorplan 1",
                  "category": "floorplan",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/ext/3dc342ec-d51d-48af-b046-2a3d005befff.jpg",
                  "alt": "TRU Oak exterior 2",
                  "category": "exterior",
                  "isPrimary": true,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/872a2045-3aae-4307-a1c2-dafe8c7dc647.jpg",
                  "alt": "TRU Oak interior 3",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/5fd281b1-6238-4cf6-85c5-8d18018b4882.jpg",
                  "alt": "TRU Oak interior 4",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/7e552794-7b6f-4207-b8d5-8cc48d4b7f32.jpg",
                  "alt": "TRU Oak interior 5",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/df1ba59e-3196-4aeb-95fa-24d54f9772ae.jpg",
                  "alt": "TRU Oak interior 6",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/40233ba5-e41c-4ee1-a3fc-f2a1e1e3e481.jpg",
                  "alt": "TRU Oak interior 7",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/a1268c5c-ee8d-4353-9624-0e2ebc2a4620.jpg",
                  "alt": "TRU Oak interior 8",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/81f23c49-2436-4507-83c7-97de468b9035.jpg",
                  "alt": "TRU Oak interior 9",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/4584528f-6b1c-4e2d-920d-41fac2edea13.jpg",
                  "alt": "TRU Oak interior 10",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/55de80c7-e22b-4575-85b4-22bd5e0f6de3.jpg",
                  "alt": "TRU Oak interior 11",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/19ed1fa6-2efa-46d3-9fb8-011d6c853e4c.jpg",
                  "alt": "TRU Oak interior 12",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/cd907f0b-fcbf-4d8c-aa71-912cc3e94271.jpg",
                  "alt": "TRU Oak interior 13",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            },
            {
                  "src": "https://api.claytonhomes.com/images/mfg/int/eb9a36b9-f0d4-4b55-afa2-507ce6b15470.jpg",
                  "alt": "TRU Oak interior 14",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://owntru.com/models/trt28564ah/"
            }
      ],
      "floorPlanImage": "https://api.claytonhomes.com/images/mfg/flp/b39166d9-b876-4d71-8cab-9edd5737b085.jpg",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://owntru.com/models/trt28564ah/"
}
  }
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
    "sourcePage": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2",
    "startingPrice": null,
    "priceLabel": "Call/Text for starting price",
    "media": {
      "slug": "boujee-xl-2",
      "gallery": [
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/SnM9U1aPYHnyDtPzeYS9.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 floorplan 0",
                  "category": "floorplan",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/c4uBzkscLqGBpgiJmQtW.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 exterior 1",
                  "category": "exterior",
                  "isPrimary": true,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/ShyGaUnm81S5xFSD7TNs.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 2",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/uBWfTFenmz5o6gxQ6gPg.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 3",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/LUJQ47VYnuoyfj6EbVqR.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 4",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/xeAqR2irXrzKzFhWgcPC.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 5",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/5ezdwvGH2RZXqmQSiXSk.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 6",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/wg2y1stNyU6YzvUi7B37.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 7",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/FtwBvC2ZdqNYb4byy7fu.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 8",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/utFXgmgTLYTt4ncWBDds.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 9",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/JUqhQz1r8gHyp1iaPSoW.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 10",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/DFY1RbeCacbUYFXaq442.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 11",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/cwkusPWTesw4UM2e7HUk.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 12",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/ua8kXitCnRZFbnCtCLKj.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 13",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/ZKBCdH8dxzvAUasc79Xh.png?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 14",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/wP2dbb646wCh1KYQraNQ.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 15",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/7oBkM7ZvhKqPSPitFfFV.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 16",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/4v9pHspcYKGMtEXMXaLX.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 17",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/3MdFgsT1s3P5MUyAsjfy.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 18",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/tvBdoNjDeCHGTrKUTDFV.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 19",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/avXN1cTnNSRNaTJMCCZn.png?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 20",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/gVDAS1rt7Wsp4PzuiycB.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 21",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/ETn6w5yBejNwJFVpUQym.png?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 22",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/7dJ8VdNQYDnmvenczTQy.png?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 23",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/yctg5wGa4c4Ya92gAZix.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 24",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            },
            {
                  "src": "https://media.ffycdn.net/us/clayton-homes/g7yC2pctWTcY6DTMaRaF.jpg?cid=client-tvbsssmtbhwqgn8r",
                  "alt": "Boujee XL 2 interior 25",
                  "category": "interior",
                  "isPrimary": false,
                  "sourceUrl": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
            }
      ],
      "floorPlanImage": "https://media.ffycdn.net/us/clayton-homes/SnM9U1aPYHnyDtPzeYS9.jpg?cid=client-tvbsssmtbhwqgn8r",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/boujee-xl-2"
}
  }
  }
  },
  "paxton": {
    "slug": "paxton",
    "sourcePage": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a",
    "startingPrice": 149900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "paxton",
      "gallery": [
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4kzbpen1xjw.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a hero, elevation, and exterior home features\" draggable=\"false\" width=\"1",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a",
          "isPrimary": true
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fs85iiu4uen.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fbku08r0u4tr.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fn8b43tia5fm.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fm8eenejg0uq.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Ffyto3f8hr3.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Frq8461jvs8e.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F32kqrb0tes.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F005wei13og6hc.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fij9zamqg978.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fx4qy5m62k5.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fvmsubowqbib.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fpcbs4gwyl29.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4u6m3o74903.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F2bmuctswqc.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F3umg9gbvhyn.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F52zcb1pyp6v.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F1zujglzq6fh.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F6slqrjl6w5q.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fekm6iladdy5.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fj3h4gr5d7mq.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2Fck88zb8py4.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F8zelpgqhxgn.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://easyhomesource.com/_next/image?q=75&url=https%3A%2F%2Ftrove.b-cdn.net%2Fimages%2F4ne1j93f3kh.jpeg&w=3840",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        }
      ],
      "floorPlanImage": null,
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
    }
  },
  "craft-select-28603a": {
    "slug": "craft-select-28603a",
    "sourcePage": "https://www.cavcohomes.com/our-retailers/us/fl/east-palatka/hercules-homes/display-homes/cav340fl25-24304a-craft-select",
    "startingPrice": null,
    "priceLabel": "Call/Text for starting price",
    "media": {
      "slug": "craft-select-28603a",
      "gallery": [
            {
                  "src": "https://cdn2.cavco.com/public/phhweb/gallery/file/2783646A855A42C1BF25FB43B13BAE22/340cs28603a_craft_select_web_ready_041525_1762809382071_768_10.jpg",
                  "alt": "Craft Select 28603A exterior 0",
                  "category": "exterior",
                  "isPrimary": true,
                  "sourceUrl": "https://www.cavcohomes.com/our-retailers/us/fl/east-palatka/hercules-homes/display-homes/cav340fl25-24304a-craft-select"
            },
            {
                  "src": "https://cdn2.cavco.com/public/phhweb/gallery/file/2783646A855A42C1BF25FB43B13BAE22/340cs28603a_bf0_629_10.gif",
                  "alt": "Craft Select 28603A brochure 1",
                  "category": "brochure",
                  "isPrimary": false,
                  "sourceUrl": "https://www.cavcohomes.com/our-retailers/us/fl/east-palatka/hercules-homes/display-homes/cav340fl25-24304a-craft-select"
            },
            {
                  "src": "https://cdn2.cavco.com/public/phhweb/gallery/file/2783646A855A42C1BF25FB43B13BAE22/340cs28603a_rf0_621_10.jpg",
                  "alt": "Craft Select 28603A floorplan 2",
                  "category": "floorplan",
                  "isPrimary": false,
                  "sourceUrl": "https://www.cavcohomes.com/our-retailers/us/fl/east-palatka/hercules-homes/display-homes/cav340fl25-24304a-craft-select"
            }
      ],
      "floorPlanImage": "https://cdn2.cavco.com/public/phhweb/gallery/file/2783646A855A42C1BF25FB43B13BAE22/340cs28603a_rf0_621_10.jpg",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://www.cavcohomes.com/our-retailers/us/fl/east-palatka/hercules-homes/display-homes/cav340fl25-24304a-craft-select"
}
  }
  }
};
