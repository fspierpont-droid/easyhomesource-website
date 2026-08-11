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
          "src": "https://trove.b-cdn.net/images/pz3trw21p3f.jpeg",
          "alt": "Dogwood exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/hlhud009m4m.jpeg",
          "alt": "Dogwood floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/tru-homes-tru-origin-dogwood"
        }
      ],
      "floorPlanImage": "https://trove.b-cdn.net/images/hlhud009m4m.jpeg",
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
          "src": "https://trove.b-cdn.net/images/544slnuvleg.jpeg",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/dzq33mtzd38.jpeg",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/qfl45outyb.jpeg",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/jd5hpm6i8d.jpeg",
          "alt": "Move on Up exterior home features",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/8xjofa94iyr.jpeg",
          "alt": "Move on Up interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/k88ebokol2.jpeg",
          "alt": "Move on Up bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/7mub8yumxbc.jpeg",
          "alt": "Move on Up bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/pselhkujr9k.jpeg",
          "alt": "Move on Up bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/fnha8oj7hlc.jpeg",
          "alt": "Move on Up bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/anlp8lbb4sf.png",
          "alt": "Move on Up bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/f7yftji5qik.png",
          "alt": "Move on Up bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/31o6qzqttij.jpeg",
          "alt": "Move on Up kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/8xlcqimrtbt.jpeg",
          "alt": "Move on Up kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/68mbqldby6.jpeg",
          "alt": "Move on Up interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        },
        {
          "src": "https://trove.b-cdn.net/images/qarjcw20gi.jpeg",
          "alt": "Move on Up floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-move-on-up"
        }
      ],
      "floorPlanImage": "https://trove.b-cdn.net/images/qarjcw20gi.jpeg",
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
          "src": "https://trove.b-cdn.net/images/lujivqtifam.jpeg",
          "alt": "alt=\"Born to run elevation and exterior home features\" draggable=\"false\" width=\"992\" heigh",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/s6p9zj2clo.jpeg",
          "alt": "alt=\"Born to run elevation and exterior home features\" draggable=\"false\" width=\"992\" heigh",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/bpwq47aeiwo.jpeg",
          "alt": "alt=\"Born to run elevation, exterior, and hero home features\" draggable=\"false\" width=\"992",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/gbszljl5gs6.jpeg",
          "alt": "alt=\"Born to run elevation and exterior home features\" draggable=\"false\" width=\"992\" heigh",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/svvl01g9lmm.jpeg",
          "alt": "alt=\"Born to run interior home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/5olqzlul049.jpeg",
          "alt": "alt=\"Born to run bedroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/1nqji82zrgq.jpeg",
          "alt": "alt=\"Born to run bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/wmqm3x3v6ji.jpeg",
          "alt": "alt=\"Born to run bedroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/6d93o02ogz9.jpeg",
          "alt": "alt=\"Born to run kitchen home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/zwadmb9buj.jpeg",
          "alt": "alt=\"Born to run interior home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/5jbgjh0m7f5.jpeg",
          "alt": "alt=\"Born to run bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/040o1k9n1y57.jpeg",
          "alt": "alt=\"Born to run bathroom home features\" draggable=\"false\" width=\"992\" height=\"558\" decodi",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/3mldjhm4rgn.jpeg",
          "alt": "alt=\"Born to run kitchen home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/lwcq26pvxzd.jpeg",
          "alt": "alt=\"Born to run kitchen home features\" draggable=\"false\" width=\"992\" height=\"558\" decodin",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        },
        {
          "src": "https://trove.b-cdn.net/images/ilaeo5y7dje.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brooksville Move on Up floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-born-to-run"
        }
      ],
      "floorPlanImage": "https://trove.b-cdn.net/images/ilaeo5y7dje.jpeg",
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
          "src": "https://trove.b-cdn.net/images/xru152hdf5r.jpeg",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/ssjx6nekt2e.jpeg",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/830c674qerd.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/rjhll5e5tsr.jpeg",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/zqsqjugswp.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/79v1nv0vcty.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/y28urlc3my8.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/hkw4q13a9w6.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/pxnm8sb43ma.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/hz1esxrfc8s.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/4wdqfi49ebe.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/08wuniig06w6.jpeg",
          "alt": "View similar homes Heritage H-1672-32B kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/hl99tph0a6p.jpeg",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/ncqk7tc38dn.jpeg",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/v6pbdn65b.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/o1lfit0uvzq.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/u7836p65s7.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/ipynwbe2t1.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/drh99wbpi8.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/vluqcsu1y7k.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/mtymuv3e62.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/fcufqnnevc.jpeg",
          "alt": "View similar homes Heritage H-1672-32B bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/sccrl34r7ug.jpeg",
          "alt": "View similar homes Heritage H-1672-32B interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/legacy-housing-classic-collection-c-1672-32c"
        },
        {
          "src": "https://trove.b-cdn.net/images/lfidcusmsv.jpeg",
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
          "src": "https://trove.b-cdn.net/images/fz9zshsmurd.jpeg",
          "alt": "alt=\"Atmos 28603n hero, elevation, and exterior home features\" draggable=\"false\" width=\"13",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/fv7t1304qsw.jpeg",
          "alt": "alt=\"Atmos 28603n exterior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/xzsd8iy606.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/1twuy4tcfd3.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/tnrhemf8rv.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/mnwdisu0ed.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/6o15qfmf3um.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/gnd0p4d5hwb.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/1rjxyr8omkp.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/mjffuxvoyh.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/z7t5nt9uupp.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/1iywew4zq5r.jpeg",
          "alt": "alt=\"Atmos 28603n kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" decod",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/zqd04ebs2t.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/uvfunsfatap.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/uri02alj58.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/0n4o0hwuv4b.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/sk44uab7g9q.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/8fp5bd95n4x.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/1u5ywxp1xjx.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/nc3yxeog0d.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/mat1xf7kcr.jpeg",
          "alt": "alt=\"Atmos 28603n interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/iov43efg9e.jpeg",
          "alt": "alt=\"Atmos 28603n bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/ejur13625j.jpeg",
          "alt": "alt=\"Atmos 28603n bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-alpha-atmos-28603n"
        },
        {
          "src": "https://trove.b-cdn.net/images/itb7xbnntjf.jpeg",
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
          "src": "https://trove.b-cdn.net/images/0h5o716vepmq.jpeg",
          "alt": "alt=\"Hey jude hero, elevation, and exterior home features\" draggable=\"false\" width=\"992\" h",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/bqi90s5mzjo.jpeg",
          "alt": "alt=\"Hey jude elevation and exterior home features\" draggable=\"false\" width=\"992\" height=\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/1lhf3hvu8u5h.jpeg",
          "alt": "alt=\"Hey jude elevation and exterior home features\" draggable=\"false\" width=\"992\" height=\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/xonzbyavkt.jpeg",
          "alt": "alt=\"Hey jude elevation and exterior home features\" draggable=\"false\" width=\"992\" height=\"",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/rbary39ljqd.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/o2gsudzhif.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/xjqbvpzj6mi.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/g7hhxvniinc.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bedroom home features",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/4hqab27l7pr.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/qw4vbdo2y.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/phk7uciz8ag.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl bathroom home features",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/v4vizfjwocq.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/4ka1dy3efql.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl kitchen home features",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/jjqcyh3d6zp.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/lycc3y32wro.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/6epjvphz4i8.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl interior home features",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        },
        {
          "src": "https://trove.b-cdn.net/images/s9r00wwifs.jpeg",
          "alt": "door hardware throughout featuring thumb-latch front door Ceiling fan prep in living room Ceiling fan prep in primary bedroom View similar homes Brown Eyed Girl floor plan",
          "category": "floorplan",
          "sourceUrl": "https://easyhomesource.com/homes/clayton-addison-tempo-series-hey-jude"
        }
      ],
      "floorPlanImage": "https://trove.b-cdn.net/images/s9r00wwifs.jpeg",
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
          "src": "https://trove.b-cdn.net/images/4kzbpen1xjw.jpeg",
          "alt": "alt=\"Paxton 28523a hero, elevation, and exterior home features\" draggable=\"false\" width=\"1",
          "category": "exterior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a",
          "isPrimary": true
        },
        {
          "src": "https://trove.b-cdn.net/images/s85iiu4uen.jpeg",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/bku08r0u4tr.jpeg",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/n8b43tia5fm.jpeg",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/m8eenejg0uq.jpeg",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/fyto3f8hr3.jpeg",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/rq8461jvs8e.jpeg",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/32kqrb0tes.jpeg",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/005wei13og6hc.jpeg",
          "alt": "alt=\"Paxton 28523a kitchen home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "kitchen",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/ij9zamqg978.jpeg",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/x4qy5m62k5.jpeg",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/vmsubowqbib.jpeg",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/pcbs4gwyl29.jpeg",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/4u6m3o74903.jpeg",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/2bmuctswqc.jpeg",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/3umg9gbvhyn.jpeg",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/52zcb1pyp6v.jpeg",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/1zujglzq6fh.jpeg",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/6slqrjl6w5q.jpeg",
          "alt": "alt=\"Paxton 28523a bathroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "bathroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/ekm6iladdy5.jpeg",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/j3h4gr5d7mq.jpeg",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/ck88zb8py4.jpeg",
          "alt": "alt=\"Paxton 28523a bedroom home features\" draggable=\"false\" width=\"1322\" height=\"882\" deco",
          "category": "bedroom",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/8zelpgqhxgn.jpeg",
          "alt": "alt=\"Paxton 28523a interior home features\" draggable=\"false\" width=\"1322\" height=\"882\" dec",
          "category": "interior",
          "sourceUrl": "https://easyhomesource.com/homes/palm-harbor-plant-city-elite-paxton-28523a"
        },
        {
          "src": "https://trove.b-cdn.net/images/4ne1j93f3kh.jpeg",
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
  },


  "delilah": {
    "slug": "delilah",
    "sourcePage": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/",
    "startingPrice": 168900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "delilah",
      "gallery": [
        {
          "src": "/homes/delilah/exterior/delilah-exterior-01.jpg",
          "alt": "The Delilah CSFL-3301 exterior front elevation",
          "category": "exterior",
          "isPrimary": true,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/exterior/delilah-exterior-02.jpg",
          "alt": "The Delilah CSFL-3301 exterior side elevation",
          "category": "exterior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/interior/delilah-interior-01.jpg",
          "alt": "The Delilah CSFL-3301 living room",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/interior/delilah-interior-02.jpg",
          "alt": "The Delilah CSFL-3301 open concept living area",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/interior/delilah-interior-03.jpg",
          "alt": "The Delilah CSFL-3301 entertainment center",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/interior/delilah-interior-04.jpg",
          "alt": "The Delilah CSFL-3301 foyer and hallway",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/interior/delilah-interior-05.jpg",
          "alt": "The Delilah CSFL-3301 dining room",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/kitchen/delilah-kitchen-01.jpg",
          "alt": "The Delilah CSFL-3301 kitchen island with farmhouse sink",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/kitchen/delilah-kitchen-02.jpg",
          "alt": "The Delilah CSFL-3301 kitchen cabinetry and appliances",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/kitchen/delilah-kitchen-03.jpg",
          "alt": "The Delilah CSFL-3301 kitchen range and vent hood",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/kitchen/delilah-kitchen-04.jpg",
          "alt": "The Delilah CSFL-3301 pantry storage",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/kitchen/delilah-kitchen-05.jpg",
          "alt": "The Delilah CSFL-3301 breakfast bar",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/kitchen/delilah-kitchen-06.jpg",
          "alt": "The Delilah CSFL-3301 kitchen dining overview",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bedroom/delilah-bedroom-01.jpg",
          "alt": "The Delilah CSFL-3301 primary bedroom suite",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bedroom/delilah-bedroom-02.jpg",
          "alt": "The Delilah CSFL-3301 primary bedroom view 2",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bedroom/delilah-bedroom-03.jpg",
          "alt": "The Delilah CSFL-3301 guest bedroom 1",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bedroom/delilah-bedroom-04.jpg",
          "alt": "The Delilah CSFL-3301 guest bedroom 2",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bedroom/delilah-bedroom-05.jpg",
          "alt": "The Delilah CSFL-3301 bedroom 4",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bedroom/delilah-bedroom-06.jpg",
          "alt": "The Delilah CSFL-3301 walk-in closet",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bathroom/delilah-bathroom-01.jpg",
          "alt": "The Delilah CSFL-3301 master bath vanity",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bathroom/delilah-bathroom-02.jpg",
          "alt": "The Delilah CSFL-3301 master bath soaking tub",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bathroom/delilah-bathroom-03.jpg",
          "alt": "The Delilah CSFL-3301 walk-in tiled shower",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bathroom/delilah-bathroom-04.jpg",
          "alt": "The Delilah CSFL-3301 guest bathroom vanity",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bathroom/delilah-bathroom-05.jpg",
          "alt": "The Delilah CSFL-3301 bathroom fixtures",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/bathroom/delilah-bathroom-06.jpg",
          "alt": "The Delilah CSFL-3301 bathroom linen storage",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/other/delilah-utility-01.jpg",
          "alt": "The Delilah CSFL-3301 utility room with washer/dryer hookups",
          "category": "other",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/other/delilah-utility-02.jpg",
          "alt": "The Delilah CSFL-3301 mudroom utility sink",
          "category": "other",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/other/delilah-utility-03.jpg",
          "alt": "The Delilah CSFL-3301 water heater and electrical access",
          "category": "other",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        },
        {
          "src": "/homes/delilah/floorplan/delilah-floorplan-01.jpg",
          "alt": "The Delilah CSFL-3301 floor plan schematic",
          "category": "floorplan",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
        }
      ],
      "floorPlanImage": "/homes/delilah/floorplan/delilah-floorplan-01.jpg",
      "brochureUrl": null,
      "videoUrl": "https://my.matterport.com/show/?m=nBr5bwTEycr",
      "virtualTourUrl": "https://my.matterport.com/show/?m=nBr5bwTEycr",
      "sourcePage": "https://www.timbercreekhousing.com/floorplan/232817-1673/thomas-outlet-homes/greenville/creekside-series/the-delilah-csfl-3301/"
    }
  },
  "maple": {
    "slug": "maple",
    "sourcePage": "https://owntru.com/models/trt28483mh/",
    "startingPrice": 98000,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "maple",
      "gallery": [
        {
          "src": "/homes/maple/exterior/maple-exterior-01.jpg",
          "alt": "TRT28483MH Maple exterior front elevation",
          "category": "exterior",
          "isPrimary": true,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/interior/maple-interior-01.jpg",
          "alt": "TRT28483MH Maple living room open concept",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/interior/maple-interior-02.jpg",
          "alt": "TRT28483MH Maple living area and dining view",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/kitchen/maple-kitchen-01.jpg",
          "alt": "TRT28483MH Maple kitchen cabinetry and breakfast bar",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/kitchen/maple-kitchen-02.jpg",
          "alt": "TRT28483MH Maple kitchen appliances and pantry",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/interior/maple-interior-03.jpg",
          "alt": "TRT28483MH Maple hallway and entry foyer",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/bedroom/maple-bedroom-01.jpg",
          "alt": "TRT28483MH Maple primary bedroom suite",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/bedroom/maple-bedroom-02.jpg",
          "alt": "TRT28483MH Maple guest bedroom",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/bathroom/maple-bathroom-01.jpg",
          "alt": "TRT28483MH Maple primary bath vanity and shower",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/bathroom/maple-bathroom-02.jpg",
          "alt": "TRT28483MH Maple guest bathroom",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/floorplan/maple-floorplan-01.jpg",
          "alt": "TRT28483MH Maple floor plan layout 1",
          "category": "floorplan",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        },
        {
          "src": "/homes/maple/floorplan/maple-floorplan-02.jpg",
          "alt": "TRT28483MH Maple floor plan layout 2",
          "category": "floorplan",
          "isPrimary": false,
          "sourceUrl": "https://owntru.com/models/trt28483mh/"
        }
      ],
      "floorPlanImage": "/homes/maple/floorplan/maple-floorplan-01.jpg",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://owntru.com/models/trt28483mh/"
    }
  },
  "white-oak": {
    "slug": "white-oak",
    "sourcePage": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/",
    "startingPrice": 189900,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "white-oak",
      "gallery": [
        {
          "src": "/homes/white-oak/exterior/white-oak-exterior-01.jpg",
          "alt": "The White Oak CS-3221 exterior front elevation",
          "category": "exterior",
          "isPrimary": true,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/exterior/white-oak-exterior-02.jpg",
          "alt": "The White Oak CS-3221 exterior angled view",
          "category": "exterior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/exterior/white-oak-exterior-03.jpg",
          "alt": "The White Oak CS-3221 exterior side view",
          "category": "exterior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/exterior/white-oak-exterior-04.jpg",
          "alt": "The White Oak CS-3221 exterior architectural details",
          "category": "exterior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/interior/white-oak-interior-01.jpg",
          "alt": "The White Oak CS-3221 living room open concept",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/interior/white-oak-interior-02.jpg",
          "alt": "The White Oak CS-3221 living room with fireplace and beam ceiling",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/interior/white-oak-interior-03.jpg",
          "alt": "The White Oak CS-3221 dining area",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/interior/white-oak-interior-04.jpg",
          "alt": "The White Oak CS-3221 foyer and hallway",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/kitchen/white-oak-kitchen-01.jpg",
          "alt": "The White Oak CS-3221 gourmet kitchen island with seating",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/kitchen/white-oak-kitchen-02.jpg",
          "alt": "The White Oak CS-3221 custom kitchen cabinetry and range hood",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/kitchen/white-oak-kitchen-03.jpg",
          "alt": "The White Oak CS-3221 farmhouse sink and window view",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/kitchen/white-oak-kitchen-04.jpg",
          "alt": "The White Oak CS-3221 stainless steel appliances",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/kitchen/white-oak-kitchen-05.jpg",
          "alt": "The White Oak CS-3221 walk-in kitchen pantry",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/kitchen/white-oak-kitchen-06.jpg",
          "alt": "The White Oak CS-3221 kitchen breakfast bar overview",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bedroom/white-oak-bedroom-01.jpg",
          "alt": "The White Oak CS-3221 primary bedroom suite",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bedroom/white-oak-bedroom-02.jpg",
          "alt": "The White Oak CS-3221 primary bedroom alternate angle",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bedroom/white-oak-bedroom-03.jpg",
          "alt": "The White Oak CS-3221 guest bedroom 1",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bedroom/white-oak-bedroom-04.jpg",
          "alt": "The White Oak CS-3221 guest bedroom 2",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bathroom/white-oak-bathroom-01.jpg",
          "alt": "The White Oak CS-3221 luxury primary bathroom with dual vanities",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bathroom/white-oak-bathroom-02.jpg",
          "alt": "The White Oak CS-3221 freestanding soaking tub and tiled shower",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bathroom/white-oak-bathroom-03.jpg",
          "alt": "The White Oak CS-3221 guest bathroom vanity",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/bathroom/white-oak-bathroom-04.jpg",
          "alt": "The White Oak CS-3221 bathroom shower and fixtures",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/other/white-oak-utility-01.jpg",
          "alt": "The White Oak CS-3221 utility laundry room",
          "category": "other",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/other/white-oak-utility-02.jpg",
          "alt": "The White Oak CS-3221 mudroom utility sink and bench",
          "category": "other",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/other/white-oak-utility-03.jpg",
          "alt": "The White Oak CS-3221 mechanical and water heater access",
          "category": "other",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        },
        {
          "src": "/homes/white-oak/floorplan/white-oak-floorplan-01.jpg",
          "alt": "The White Oak CS-3221 floor plan layout diagram",
          "category": "floorplan",
          "isPrimary": false,
          "sourceUrl": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
        }
      ],
      "floorPlanImage": "/homes/white-oak/floorplan/white-oak-floorplan-01.jpg",
      "brochureUrl": null,
      "videoUrl": "https://my.matterport.com/show/?m=1QRMAvj9Ac9",
      "virtualTourUrl": "https://my.matterport.com/show/?m=1QRMAvj9Ac9",
      "sourcePage": "https://www.timbercreekhousing.com/floorplan/231618-1673/thomas-outlet-homes/greenville/creekside-series/the-white-oak-cs-3221/"
    }
  },
  "select-s-1234-32a": {
    "slug": "select-s-1234-32a",
    "sourcePage": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a",
    "startingPrice": 54412,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "select-s-1234-32a",
      "gallery": [
        {
          "src": "/homes/select-s-1234-32a/exterior/select-s-1234-32a-exterior-01.jpg",
          "alt": "Select S-1234-32A exterior front elevation",
          "category": "exterior",
          "isPrimary": true,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/interior/select-s-1234-32a-interior-01.jpg",
          "alt": "Select S-1234-32A living room open concept",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/interior/select-s-1234-32a-interior-02.jpg",
          "alt": "Select S-1234-32A living area view 2",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/interior/select-s-1234-32a-interior-03.jpg",
          "alt": "Select S-1234-32A living room windows and natural light",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/interior/select-s-1234-32a-interior-04.jpg",
          "alt": "Select S-1234-32A hallway and foyer",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/kitchen/select-s-1234-32a-kitchen-01.jpg",
          "alt": "Select S-1234-32A kitchen cabinetry and countertop",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/kitchen/select-s-1234-32a-kitchen-02.jpg",
          "alt": "Select S-1234-32A kitchen appliances and sink",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/kitchen/select-s-1234-32a-kitchen-03.jpg",
          "alt": "Select S-1234-32A kitchen dining space",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bedroom/select-s-1234-32a-bedroom-01.jpg",
          "alt": "Select S-1234-32A primary bedroom",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bedroom/select-s-1234-32a-bedroom-02.jpg",
          "alt": "Select S-1234-32A bedroom closet storage",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bedroom/select-s-1234-32a-bedroom-03.jpg",
          "alt": "Select S-1234-32A guest bedroom 1",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bedroom/select-s-1234-32a-bedroom-04.jpg",
          "alt": "Select S-1234-32A guest bedroom 2",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bathroom/select-s-1234-32a-bathroom-01.jpg",
          "alt": "Select S-1234-32A primary bathroom vanity",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bathroom/select-s-1234-32a-bathroom-02.jpg",
          "alt": "Select S-1234-32A shower tub combo",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/bathroom/select-s-1234-32a-bathroom-03.jpg",
          "alt": "Select S-1234-32A guest bathroom",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/interior/select-s-1234-32a-interior-05.jpg",
          "alt": "Select S-1234-32A utility area",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/interior/select-s-1234-32a-interior-06.jpg",
          "alt": "Select S-1234-32A interior detail view",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        },
        {
          "src": "/homes/select-s-1234-32a/floorplan/select-s-1234-32a-floorplan-01.png",
          "alt": "Select S-1234-32A floor plan schematic",
          "category": "floorplan",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
        }
      ],
      "floorPlanImage": "/homes/select-s-1234-32a/floorplan/select-s-1234-32a-floorplan-01.png",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s1234-32a"
    }
  },
  "select-s-1234-31a": {
    "slug": "select-s-1234-31a",
    "sourcePage": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a",
    "startingPrice": 52380,
    "priceLabel": "Starting Price",
    "media": {
      "slug": "select-s-1234-31a",
      "gallery": [
        {
          "src": "/homes/select-s-1234-31a/exterior/select-s-1234-31a-exterior-01.jpg",
          "alt": "Select S-1234-31A exterior front elevation",
          "category": "exterior",
          "isPrimary": true,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/interior/select-s-1234-31a-interior-01.jpg",
          "alt": "Select S-1234-31A living area",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/interior/select-s-1234-31a-interior-02.jpg",
          "alt": "Select S-1234-31A living room seating",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/interior/select-s-1234-31a-interior-03.jpg",
          "alt": "Select S-1234-31A dining and living overview",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/kitchen/select-s-1234-31a-kitchen-01.jpg",
          "alt": "Select S-1234-31A kitchen cabinetry and countertops",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/kitchen/select-s-1234-31a-kitchen-02.jpg",
          "alt": "Select S-1234-31A kitchen breakfast counter",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/kitchen/select-s-1234-31a-kitchen-03.jpg",
          "alt": "Select S-1234-31A kitchen range and appliances",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/kitchen/select-s-1234-31a-kitchen-04.jpg",
          "alt": "Select S-1234-31A sink and faucet",
          "category": "kitchen",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/interior/select-s-1234-31a-interior-04.jpg",
          "alt": "Select S-1234-31A entry and hallway",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bedroom/select-s-1234-31a-bedroom-01.jpg",
          "alt": "Select S-1234-31A primary bedroom",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bedroom/select-s-1234-31a-bedroom-02.jpg",
          "alt": "Select S-1234-31A bedroom closet",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bedroom/select-s-1234-31a-bedroom-03.jpg",
          "alt": "Select S-1234-31A guest bedroom 1",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bedroom/select-s-1234-31a-bedroom-04.jpg",
          "alt": "Select S-1234-31A guest bedroom 2",
          "category": "bedroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bathroom/select-s-1234-31a-bathroom-01.jpg",
          "alt": "Select S-1234-31A bathroom vanity",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bathroom/select-s-1234-31a-bathroom-02.jpg",
          "alt": "Select S-1234-31A bathroom shower tub",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/bathroom/select-s-1234-31a-bathroom-03.jpg",
          "alt": "Select S-1234-31A bathroom linen storage",
          "category": "bathroom",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/interior/select-s-1234-31a-interior-05.jpg",
          "alt": "Select S-1234-31A laundry utility space",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/interior/select-s-1234-31a-interior-06.jpg",
          "alt": "Select S-1234-31A interior layout view",
          "category": "interior",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        },
        {
          "src": "/homes/select-s-1234-31a/floorplan/select-s-1234-31a-floorplan-01.png",
          "alt": "Select S-1234-31A floor plan schematic",
          "category": "floorplan",
          "isPrimary": false,
          "sourceUrl": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
        }
      ],
      "floorPlanImage": "/homes/select-s-1234-31a/floorplan/select-s-1234-31a-floorplan-01.png",
      "brochureUrl": null,
      "videoUrl": null,
      "virtualTourUrl": null,
      "sourcePage": "https://trove.legacyhousing.com/homes/legacy-housing-select-collection-s-1234-31a"
    }
  },
};