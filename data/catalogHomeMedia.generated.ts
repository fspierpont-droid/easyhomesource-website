import type { HomeMediaManifest } from "@/data/homeMedia";

const troveImage = (path: string) => `https://easyhomesource.com/_next/image?q=75&url=${encodeURIComponent(`https://trove.b-cdn.net/images/${path}`)}&w=3840`;

const entry = (slug: string, sourcePage: string, exteriorPath: string | null, floorPlanPath: string): HomeMediaManifest[string] => {
  const floorPlan = troveImage(floorPlanPath);
  const gallery = exteriorPath ? [
    { src: troveImage(exteriorPath), alt: `${slug} exterior home features`, category: "exterior" as const, isPrimary: true, sourceUrl: sourcePage },
    { src: floorPlan, alt: `${slug} floor plan`, category: "floorplan" as const, sourceUrl: sourcePage }
  ] : [
    { src: floorPlan, alt: `${slug} floor plan`, category: "floorplan" as const, isPrimary: true, sourceUrl: sourcePage }
  ];
  return { slug, gallery, floorPlanImage: floorPlan, brochureUrl: null, videoUrl: null, virtualTourUrl: null, sourcePage };
};

export const catalogHomeMedia: HomeMediaManifest = {
  "select-s-1240-22a": entry("select-s-1240-22a", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1240-22a", "w29euhhlni.jpeg", "c6viz48buy.png?crop=1387%2C405%2C267%2C173"),
  "select-s-1234-32a": entry("select-s-1234-32a", "https://easyhomesource.com/homes/legacy-housing-select-collection-s1234-32a", "t20ukfy4gt.jpeg", "0ymlimddpmf.png?crop=1612%2C434%2C169%2C167"),
  "select-s-1234-31a": entry("select-s-1234-31a", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1234-31a", "jtpsfvtosb.jpeg", "ccsax7r4mpn.png?crop=1435%2C381%2C243%2C272"),
  "select-s-1236-11fla": entry("select-s-1236-11fla", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1236-11fla", "qrolay3ocw.jpeg", "ci49a4hxesr.png?crop=1533%2C441%2C291%2C295"),
  "select-s-1444-11ofp": entry("select-s-1444-11ofp", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1444-11ofp", "dt6u2aac36h.jpeg", "hhfjgkt3vl6.png?crop=1720%2C592%2C102%2C155"),
  "imagine": entry("imagine", "https://easyhomesource.com/homes/clayton-addison-tempo-series-imagine", "tsdf8oglzdj.jpeg", "087qu5aa66b.jpeg"),
  "select-s-1256-21a": entry("select-s-1256-21a", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1256-21a", "3pzkoktqar6.jpeg", "27ohoisbm5b.png?crop=1740%2C391%2C90%2C117"),
  "waverly-15471a": entry("waverly-15471a", "https://easyhomesource.com/homes/palm-harbor-plant-city-lifestyle-waverly-15471a", "cnm5uc4a3k7.jpeg", "e6jn11amlln.png?crop=873%2C353%2C82%2C217"),
  "workforce-o-1644-22aof": entry("workforce-o-1644-22aof", "https://easyhomesource.com/homes/legacy-housing-workforce-housing-o-1644-22aof", "mpf49ng9bna.jpeg", "db40t4jqap4.png?crop=1651%2C645%2C142%2C216"),
  "elm": entry("elm", "https://easyhomesource.com/homes/tru-homes-tru-origin-elm", "5s2bv2wbl2.jpeg", "31bjsunjlg6.jpeg"),
  "select-s-1264-22a": entry("select-s-1264-22a", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1264-22a", "l89snfogd6o.jpeg", "fq25803cjbo.png?crop=1713%2C336%2C104%2C116"),
  "select-s-1272-32a": entry("select-s-1272-32a", "https://easyhomesource.com/homes/legacy-housing-select-collection-s-1272-32a", null, "556er4p923h.png?crop=478%2C84%2C16%2C33")
};
