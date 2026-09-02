import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { catalogHomeSeeds } from "../data/catalogHomeSeeds.ts";
import { timberCreekCatalog } from "../data/timberCreekCatalog.ts";

const ROOT = process.cwd();
const GENERATED_PATH = path.join(ROOT, "data/manufacturerMedia.generated.ts");
const REPORT_DIR = path.join(ROOT, "reports");
const ONLY = argValue("--only");
const LIMIT = Number(argValue("--limit") || 0);
const DELAY_MS = Number(argValue("--delay") || 350);
const MAX_IMAGES = Number(argValue("--max-images") || 40);

type Category = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "video" | "other";
type Target = {
  name: string;
  slug: string;
  manufacturer: string;
  series?: string | null;
  modelNumber?: string | null;
  sourcePage?: string | null;
};
type MediaItem = { src: string; alt: string; category: Category; isPrimary?: boolean; sourceUrl?: string };
type MediaEntry = {
  slug: string;
  gallery: MediaItem[];
  floorPlanImage: string | null;
  brochureUrl: string | null;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  sourcePage: string | null;
};
type ReportRow = {
  slug: string;
  name: string;
  manufacturer: string;
  sourcePage: string | null;
  status: "enriched" | "floorplan-only" | "no-match" | "error";
  images: number;
  exteriors: number;
  interiors: number;
  floorplans: number;
  brochure: boolean;
  virtualTour: boolean;
  video: boolean;
  error?: string;
};

type Candidate = { url: string; alt: string; category: Category; order: number; score: number };

const curatedTargets: Target[] = [
  { name: "Tulip", slug: "tulip", manufacturer: "Clayton TRU", series: "TRU Mini", modelNumber: "tulip" },
  { name: "Dogwood", slug: "dogwood", manufacturer: "Clayton TRU", series: "TRU Origin", modelNumber: "dogwood" },
  { name: "Born to Run", slug: "born-to-run", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "born-to-run" },
  { name: "Classic C-1672-32C", slug: "classic-c-1672-32c", manufacturer: "Legacy Housing", series: "Classic Collection", modelNumber: "c-1672-32c" },
  { name: "Move on Up", slug: "move-on-up", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "move-on-up" },
  { name: "Paxton", slug: "paxton", manufacturer: "Palm Harbor Plant City", series: "Elite", modelNumber: "paxton-28523a" },
  { name: "Oak", slug: "oak", manufacturer: "TRU Homes", series: "TRU Origin", modelNumber: "spruce-oak" },
  { name: "Atmos 28603N", slug: "atmos-28603n", manufacturer: "Palm Harbor Plant City", series: "Alpha", modelNumber: "atmos-28603n" },
  { name: "Craft Select 28603A", slug: "craft-select-28603a", manufacturer: "Palm Harbor Plant City", series: "Craft Select", modelNumber: "craft-select-28603a" },
  { name: "Hey Jude", slug: "hey-jude", manufacturer: "Clayton Addison", series: "Tempo Series", modelNumber: "hey-jude" },
  { name: "Boujee XL 2", slug: "boujee-xl-2", manufacturer: "Clayton Addison", series: "Boujee Series", modelNumber: "boujee-xl-2" },
  { name: "Maple", slug: "maple", manufacturer: "TRU Homes", series: "TRU Origin", modelNumber: "maple" },
  { name: "White Oak", slug: "white-oak", manufacturer: "Timber Creek", series: "Creekside Series", modelNumber: "CS-3221" },
  { name: "Boujee 2", slug: "boujee-2", manufacturer: "Clayton Addison", series: "Boujee Series", modelNumber: "boujee-2" },
  { name: "Delilah", slug: "delilah", manufacturer: "Timber Creek", series: "Creekside Series", modelNumber: "CSFL-3301" },
];

function argValue(name: string) {
  const direct = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function normalize(value: string | null | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function htmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function uniq<T>(values: T[]) {
  return [...new Set(values)];
}

function uniqueTargets() {
  const timberTargets: Target[] = timberCreekCatalog.map((home) => ({
    name: home.displayName,
    slug: home.slug,
    manufacturer: "Timber Creek",
    series: "Creekside Series",
    modelNumber: home.modelNumber,
    sourcePage: home.sourcePage,
  }));
  const seedTargets: Target[] = catalogHomeSeeds.map((home) => ({
    name: home.name,
    slug: home.slug,
    manufacturer: home.manufacturer,
    series: home.series,
    modelNumber: home.modelNumber,
  }));

  const bySlug = new Map<string, Target>();
  for (const target of [...seedTargets, ...timberTargets, ...curatedTargets]) bySlug.set(target.slug, target);
  let targets = [...bySlug.values()];
  if (ONLY) targets = targets.filter((target) => target.slug === ONLY);
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);
  return targets;
}

function manufacturerFamily(target: Target): "clayton" | "cavco" | "legacy" | "timber" | "unknown" {
  const value = `${target.manufacturer} ${target.series}`.toLowerCase();
  if (/clayton|tru homes|tru mini|addison/.test(value)) return "clayton";
  if (/palm harbor|cavco/.test(value)) return "cavco";
  if (/legacy/.test(value)) return "legacy";
  if (/timber creek/.test(value)) return "timber";
  return "unknown";
}

function cleanModelSlug(target: Target) {
  const model = normalize(target.modelNumber);
  if (model) return model;
  return normalize(target.name);
}

function sourceCandidates(target: Target) {
  if (target.sourcePage) return [target.sourcePage];
  const family = manufacturerFamily(target);
  const model = cleanModelSlug(target);
  const name = normalize(target.name);
  const stripped = target.slug
    .replace(/^clayton-addison-(?:tempo-series|boujee-series)-/, "")
    .replace(/^clayton-tru-(?:mini|origin)-/, "")
    .replace(/^tru-homes-tru-origin-/, "")
    .replace(/^palm-harbor-plant-city-(?:elite|alpha|craft-select|anthem|lifestyle)-/, "");

  if (family === "legacy") {
    const legacySlug = target.slug.startsWith("legacy-housing-") ? target.slug : `legacy-housing-${normalize(target.series)}-${model}`;
    return [`https://trove.legacyhousing.com/homes/${legacySlug}`];
  }
  if (family === "clayton") {
    return uniq([model, stripped, name].filter(Boolean)).map(
      (slug) => `https://www.claytonhomes.com/homes-for-sale/manufactured-homes/${slug}`,
    );
  }
  if (family === "cavco") {
    const slugs = uniq([model, stripped, name].filter(Boolean));
    return slugs.flatMap((slug) => [
      `https://www.palmharbor.com/our-homes/us/34-${slug}`,
      `https://www.cavcohomes.com/our-homes/palmharbor/standard/us/34-${slug}`,
    ]);
  }
  return [];
}

async function fetchPage(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; EasyHomeSourceCatalog/1.0; +https://easyhomesource.com)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) return null;
  const html = await response.text();
  if (html.length < 1500 || /<title>[^<]*(?:404|not found|page not found)/i.test(html)) return null;
  return { html, finalUrl: response.url || url };
}

function modelTokens(target: Target) {
  return uniq([
    normalize(target.modelNumber),
    normalize(target.name),
    normalize(target.slug).split("-").slice(-3).join("-"),
  ]).filter((value) => value.length >= 4);
}

function pageMatchesTarget(html: string, finalUrl: string, target: Target) {
  if (manufacturerFamily(target) === "timber" || manufacturerFamily(target) === "legacy") return true;
  const haystack = normalize(`${finalUrl} ${html.slice(0, 250000)}`);
  return modelTokens(target).some((token) => haystack.includes(token));
}

async function resolveSource(target: Target) {
  for (const url of sourceCandidates(target)) {
    try {
      const page = await fetchPage(url);
      if (page && pageMatchesTarget(page.html, page.finalUrl, target)) return page;
    } catch {
      // Try the next manufacturer URL candidate.
    }
  }
  return null;
}

function attr(attrs: string, name: string) {
  const quoted = attrs.match(new RegExp(`${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  if (quoted) return htmlDecode(quoted[2]);
  const bare = attrs.match(new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, "i"));
  return bare ? htmlDecode(bare[1]) : "";
}

function absolute(raw: string, pageUrl: string) {
  const value = htmlDecode(raw.trim().replace(/\\u0026/g, "&").replace(/\\\//g, "/"));
  if (!value || value === "#" || /^data:/i.test(value)) return "";
  try {
    const url = new URL(value, pageUrl);
    if (url.pathname.includes("/_next/image")) {
      const nested = url.searchParams.get("url");
      if (nested) return absolute(decodeURIComponent(nested), pageUrl);
    }
    return url.toString();
  } catch {
    return "";
  }
}

function urlsFromValue(raw: string, pageUrl: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .map((value) => absolute(value, pageUrl))
    .filter(Boolean);
}

function classify(value: string): Category {
  const text = value.toLowerCase();
  if (/floor\s*plan|floorplan|line[-_ ]?drawing|blueprint|\bplan\b/.test(text)) return "floorplan";
  if (/exterior|elevation|facade|façade|front[-_ ]?view|[-_/]ext[-_/.]|\bext\b/.test(text)) return "exterior";
  if (/kitchen|[-_/]kit[-_/.]/.test(text)) return "kitchen";
  if (/bathroom|\bbath\b|[-_/]bath[-_/.]/.test(text)) return "bathroom";
  if (/bedroom|\bbed\b|[-_/]bed[-_/.]/.test(text)) return "bedroom";
  if (/living|dining|great[-_ ]?room|interior|[-_/]int[-_/.]/.test(text)) return "interior";
  return "other";
}

function unwanted(url: string, context: string) {
  const text = `${url} ${context}`.toLowerCase();
  return /logo|favicon|sprite|icon-|placeholder|avatar|social|facebook|instagram|youtube-icon|loading|spinner|payment|badge|arrow|chevron|hamburger/.test(text);
}

function imageScore(url: string, context: string, category: Category, target: Target, order: number) {
  let score = Math.max(0, 25 - Math.floor(order / 3));
  if (category === "exterior") score += 70;
  else if (category === "floorplan") score += 55;
  else if (["interior", "kitchen", "bathroom", "bedroom"].includes(category)) score += 45;
  else score += 12;
  const normalizedContext = normalize(`${context} ${url}`);
  if (modelTokens(target).some((token) => normalizedContext.includes(token))) score += 45;
  if (/hero|primary|main|gallery|carousel|slide/.test(context.toLowerCase())) score += 15;
  if (/thumb|thumbnail/.test(url.toLowerCase())) score -= 4;
  return score;
}

function imageCandidates(html: string, pageUrl: string, target: Target) {
  const candidates: Candidate[] = [];
  let order = 0;
  const add = (raw: string, context: string) => {
    for (const url of urlsFromValue(raw, pageUrl)) {
      if (!/^https?:/i.test(url) || unwanted(url, context)) continue;
      if (!/\.(?:jpe?g|png|webp|avif)(?:\?|$)/i.test(url) && !/(image|photo|gallery|cdn|media)/i.test(`${url} ${context}`)) continue;
      const category = classify(`${context} ${url}`);
      candidates.push({ url, alt: context.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), category, order, score: imageScore(url, context, category, target, order++) });
    }
  };

  for (const match of html.matchAll(/<img\b([^>]+)>/gi)) {
    const attrs = match[1];
    const context = `${attr(attrs, "alt")} ${attr(attrs, "title")} ${attrs}`;
    for (const key of ["src", "data-src", "data-lazy-src", "srcset", "data-srcset"]) add(attr(attrs, key), context);
  }
  for (const match of html.matchAll(/<source\b([^>]+)>/gi)) {
    const attrs = match[1];
    for (const key of ["src", "srcset", "data-src", "data-srcset"]) add(attr(attrs, key), attrs);
  }
  for (const match of html.matchAll(/<meta\b([^>]+)>/gi)) {
    if (/og:image|twitter:image/i.test(match[1])) add(attr(match[1], "content"), `hero ${match[1]}`);
  }
  for (const match of html.matchAll(/https?:[^"'<>\\\s]+\.(?:jpe?g|png|webp|avif)(?:\?[^"'<>\\\s]*)?/gi)) add(match[0], "embedded image");

  const deduped = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const key = candidate.url.replace(/[?&](?:w|width|h|height|q|quality)=\d+/gi, "").replace(/[?&]+$/, "");
    const existing = deduped.get(key);
    if (!existing || candidate.score > existing.score) deduped.set(key, candidate);
  }
  return [...deduped.values()]
    .filter((item) => item.score >= 18)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, MAX_IMAGES);
}

function linkMedia(html: string, pageUrl: string) {
  let brochureUrl: string | null = null;
  let videoUrl: string | null = null;
  let virtualTourUrl: string | null = null;

  const consider = (raw: string, context: string) => {
    const url = absolute(raw, pageUrl);
    if (!url) return;
    const text = `${url} ${context}`.toLowerCase();
    if (!virtualTourUrl && /matterport|kuula|3d[-_ ]?tour|virtual[-_ ]?tour|tour3d|my\.matterport/.test(text) && !/javascript:/.test(url)) virtualTourUrl = url;
    if (!brochureUrl && (/\.pdf(?:\?|$)/i.test(url) || /brochure|download floor plan|download brochure/.test(text))) brochureUrl = url;
    if (!videoUrl && /youtube\.com|youtu\.be|vimeo\.com/.test(url)) videoUrl = url;
  };

  for (const match of html.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a>/gi)) consider(attr(match[1], "href"), `${match[2]} ${match[1]}`);
  for (const match of html.matchAll(/<(?:iframe|video|source)\b([^>]+)>/gi)) consider(attr(match[1], "src"), match[1]);
  for (const match of html.matchAll(/https?:[^"'<>\\\s]+/gi)) {
    const url = match[0].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
    if (/matterport|kuula|youtube|youtu\.be|vimeo|\.pdf/i.test(url)) consider(url, "embedded media");
  }
  return { brochureUrl, videoUrl, virtualTourUrl };
}

function friendlyAlt(target: Target, item: Candidate, index: number) {
  const label = item.category === "other" ? "home photo" : item.category === "floorplan" ? "floor plan" : `${item.category} photo`;
  return `${target.name} ${label}${index > 0 ? ` ${index + 1}` : ""}`;
}

function buildEntry(target: Target, html: string, sourcePage: string): MediaEntry {
  const candidates = imageCandidates(html, sourcePage, target);
  const gallery: MediaItem[] = candidates.map((item, index) => ({
    src: item.url,
    alt: friendlyAlt(target, item, index),
    category: item.category,
    sourceUrl: sourcePage,
  }));
  const exterior = gallery.find((item) => item.category === "exterior");
  const floorplan = gallery.find((item) => item.category === "floorplan");
  const primary = exterior ?? floorplan ?? gallery[0];
  if (primary) primary.isPrimary = true;
  const links = linkMedia(html, sourcePage);
  return {
    slug: target.slug,
    gallery,
    floorPlanImage: floorplan?.src ?? null,
    ...links,
    sourcePage,
  };
}

function tsString(value: unknown) {
  return JSON.stringify(value, null, 2)
    .replace(/"category": "(exterior|interior|kitchen|bathroom|bedroom|floorplan|video|other)"/g, '"category": "$1" as const');
}

async function writeGenerated(manifest: Record<string, MediaEntry>) {
  const content = `import type { HomeMediaManifest } from "@/data/homeMedia";\n\n/**\n * GENERATED FILE — scripts/import-manufacturer-media.ts\n * Manufacturer-owned media is intentionally lower-precedence than curated EHS overrides.\n */\nexport const manufacturerMedia: HomeMediaManifest = ${tsString(manifest)};\n`;
  await writeFile(GENERATED_PATH, content, "utf8");
}

function reportMarkdown(rows: ReportRow[]) {
  const enriched = rows.filter((row) => row.status === "enriched").length;
  const noMatch = rows.filter((row) => row.status === "no-match" || row.status === "error").length;
  const withTour = rows.filter((row) => row.virtualTour).length;
  const withExterior = rows.filter((row) => row.exteriors > 0).length;
  const byManufacturer = new Map<string, ReportRow[]>();
  for (const row of rows) byManufacturer.set(row.manufacturer, [...(byManufacturer.get(row.manufacturer) ?? []), row]);
  const manufacturerLines = [...byManufacturer.entries()].map(([name, items]) => {
    const good = items.filter((row) => row.status === "enriched").length;
    const ext = items.filter((row) => row.exteriors > 0).length;
    const tours = items.filter((row) => row.virtualTour).length;
    return `- **${name}:** ${good}/${items.length} enriched · ${ext} exterior-covered · ${tours} virtual tours`;
  });
  return `# Manufacturer media enrichment report\n\n- Targets: **${rows.length}**\n- Enriched: **${enriched}**\n- Exterior/elevation coverage: **${withExterior}**\n- Virtual tours found: **${withTour}**\n- Unmatched/errors: **${noMatch}**\n\n## By manufacturer\n${manufacturerLines.join("\n")}\n\n## Needs review\n${rows.filter((row) => row.status !== "enriched").map((row) => `- ${row.manufacturer} · ${row.name} · ${row.slug} · ${row.status}${row.error ? ` · ${row.error}` : ""}`).join("\n") || "None"}\n`;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const targets = uniqueTargets();
  const manifest: Record<string, MediaEntry> = {};
  const reports: ReportRow[] = [];

  console.log(`Enriching ${targets.length} catalog media targets...`);
  for (const [index, target] of targets.entries()) {
    try {
      const page = await resolveSource(target);
      if (!page) {
        reports.push({ slug: target.slug, name: target.name, manufacturer: target.manufacturer, sourcePage: null, status: "no-match", images: 0, exteriors: 0, interiors: 0, floorplans: 0, brochure: false, virtualTour: false, video: false });
        console.log(`[${index + 1}/${targets.length}] NO MATCH ${target.manufacturer} · ${target.name}`);
      } else {
        const entry = buildEntry(target, page.html, page.finalUrl);
        if (entry.gallery.length || entry.brochureUrl || entry.virtualTourUrl || entry.videoUrl) manifest[target.slug] = entry;
        const exteriors = entry.gallery.filter((item) => item.category === "exterior").length;
        const interiors = entry.gallery.filter((item) => ["interior", "kitchen", "bathroom", "bedroom"].includes(item.category)).length;
        const floorplans = entry.gallery.filter((item) => item.category === "floorplan").length;
        const status: ReportRow["status"] = exteriors || interiors ? "enriched" : floorplans ? "floorplan-only" : "no-match";
        reports.push({
          slug: target.slug,
          name: target.name,
          manufacturer: target.manufacturer,
          sourcePage: page.finalUrl,
          status,
          images: entry.gallery.length,
          exteriors,
          interiors,
          floorplans,
          brochure: Boolean(entry.brochureUrl),
          virtualTour: Boolean(entry.virtualTourUrl),
          video: Boolean(entry.videoUrl),
        });
        console.log(`[${index + 1}/${targets.length}] ${status.toUpperCase()} ${target.manufacturer} · ${target.name} · ${entry.gallery.length} images${entry.virtualTourUrl ? " · 3D" : ""}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      reports.push({ slug: target.slug, name: target.name, manufacturer: target.manufacturer, sourcePage: null, status: "error", images: 0, exteriors: 0, interiors: 0, floorplans: 0, brochure: false, virtualTour: false, video: false, error: message });
      console.log(`[${index + 1}/${targets.length}] ERROR ${target.manufacturer} · ${target.name} · ${message}`);
    }
    if (index < targets.length - 1 && DELAY_MS > 0) await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  await writeGenerated(manifest);
  await writeFile(path.join(REPORT_DIR, "manufacturer-media-report.json"), JSON.stringify(reports, null, 2), "utf8");
  await writeFile(path.join(REPORT_DIR, "manufacturer-media-report.md"), reportMarkdown(reports), "utf8");
  console.log(reportMarkdown(reports));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
