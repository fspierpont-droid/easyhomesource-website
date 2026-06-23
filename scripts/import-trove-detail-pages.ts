import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Allow = { slug: string; url: string };
type Category = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "other";
type GalleryItem = { src: string; alt: string; category: Category; isPrimary?: boolean; sourceUrl: string };
type ProductJson = {
  "@type"?: string | string[];
  name?: string;
  image?: unknown;
  offers?: unknown;
  [key: string]: unknown;
};
type ScrapedDetail = {
  slug: string;
  sourcePage: string;
  startingPrice: number | null;
  priceLabel: string | null;
  media: {
    slug: string;
    gallery: GalleryItem[];
    floorPlanImage: string | null;
    brochureUrl: string | null;
    videoUrl: string | null;
    virtualTourUrl: string | null;
    sourcePage: string;
  };
};

const ROOT = process.cwd();
const ONLY = argValue("--only");
const LIMIT = Number(argValue("--limit") || 0);
const DELAY_MS = Number(argValue("--delay") || 1500);
const HTML_FILE = argValue("--html-file");
const ALLOWLIST_PATH = path.join(ROOT, "scripts/trove-detail-allowlist.json");
const OUTPUT_PATH = path.join(ROOT, "data/scrapedHomeDetails.generated.ts");
const REPORT_DIR = path.join(ROOT, "reports");

function argValue(name: string) {
  const direct = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function localPath(value: string) {
  if (value.startsWith("~/")) return path.join(process.env.HOME || ROOT, value.slice(2));
  return path.isAbsolute(value) ? value : path.join(ROOT, value);
}

async function main() {
  const allAllowed = JSON.parse(await readFile(ALLOWLIST_PATH, "utf8")) as Allow[];
  let allowed = ONLY ? allAllowed.filter((item) => item.slug === ONLY) : allAllowed;
  if (LIMIT > 0) allowed = allowed.slice(0, LIMIT);
  if (!allowed.length) throw new Error(ONLY ? `No detail page found for --only=${ONLY}` : "No detail pages configured.");
  if (HTML_FILE && allowed.length !== 1) throw new Error("--html-file can only be used with --only=one-slug");

  const details: Record<string, ScrapedDetail> = await readExistingDetails();
  const report: unknown[] = [];
  await mkdir(REPORT_DIR, { recursive: true });

  for (let index = 0; index < allowed.length; index++) {
    const item = allowed[index];
    try {
      console.log(`Scraping ${item.slug}: ${item.url}`);
      const html = HTML_FILE ? await readFile(localPath(HTML_FILE), "utf8") : await fetchText(item.url);
      const detail = scrapeDetail(item, html);
      details[item.slug] = detail;
      report.push({ slug: item.slug, url: item.url, price: detail.startingPrice, images: detail.media.gallery.length, floorPlanImage: detail.media.floorPlanImage, source: HTML_FILE ? "saved-html" : "web" });
    } catch (error) {
      console.error(`Failed ${item.slug}:`, error instanceof Error ? error.message : String(error));
      report.push({ slug: item.slug, url: item.url, error: error instanceof Error ? error.message : String(error) });
    }
    if (index < allowed.length - 1 && DELAY_MS > 0) await delay(DELAY_MS);
  }

  await writeOutput(details);
  await writeFile(path.join(REPORT_DIR, "trove-detail-import-report.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), count: Object.keys(details).length, homes: report }, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

async function readExistingDetails() {
  try {
    const current = await readFile(OUTPUT_PATH, "utf8");
    const marker = "export const scrapedHomeDetails";
    const markerIndex = current.indexOf(marker);
    const assignmentIndex = markerIndex >= 0 ? current.indexOf("=", markerIndex) : -1;
    const jsonStart = assignmentIndex >= 0 ? current.indexOf("{", assignmentIndex) : -1;
    const jsonEnd = current.lastIndexOf("};");
    if (jsonStart >= 0 && jsonEnd > jsonStart) return JSON.parse(current.slice(jsonStart, jsonEnd + 1)) as Record<string, ScrapedDetail>;
  } catch {}
  return {};
}

function scrapeDetail(item: Allow, html: string): ScrapedDetail {
  const product = extractJsonLdProduct(html);
  const text = strip(html);
  const homeName = product?.name?.trim() || extractName(text) || titleFromSlug(item.slug);
  const price = extractProductPrice(product) ?? extractPrice(text, homeName);
  const gallery = extractGallery(item, html, homeName, product);
  const floorPlanImage = gallery.find((image) => image.category === "floorplan")?.src ?? null;
  const firstPhoto = gallery.find((image) => image.category !== "floorplan") ?? gallery[0];
  if (firstPhoto) firstPhoto.isPrimary = true;

  return {
    slug: item.slug,
    sourcePage: item.url,
    startingPrice: price,
    priceLabel: price ? "Starting Price" : null,
    media: {
      slug: item.slug,
      gallery,
      floorPlanImage,
      brochureUrl: extractBrochureUrl(html, item.url),
      videoUrl: null,
      virtualTourUrl: null,
      sourcePage: item.url
    }
  };
}

function extractJsonLdProduct(html: string): ProductJson | null {
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html))) {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      const product = findProductNode(parsed);
      if (product) return product;
    } catch {}
  }
  return null;
}

function findProductNode(value: unknown): ProductJson | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findProductNode(item);
      if (found) return found;
    }
    return null;
  }

  const node = value as ProductJson;
  const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  if (types.some((type) => String(type).toLowerCase() === "product")) return node;

  for (const nested of Object.values(node)) {
    const found = findProductNode(nested);
    if (found) return found;
  }
  return null;
}

function extractProductPrice(product: ProductJson | null) {
  if (!product?.offers) return null;
  const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
  for (const offer of offers) {
    if (!offer || typeof offer !== "object") continue;
    const data = offer as Record<string, unknown>;
    const specification = data.priceSpecification && typeof data.priceSpecification === "object"
      ? data.priceSpecification as Record<string, unknown>
      : null;
    for (const candidate of [data.price, data.lowPrice, specification?.price]) {
      const amount = Number(String(candidate ?? "").replace(/[$,\s]/g, ""));
      if (Number.isFinite(amount) && amount >= 10000) return amount;
    }
  }
  return null;
}

function extractName(text: string) {
  const match = text.match(/#?\s*([A-Za-z0-9][A-Za-z0-9 '\-x×]+)\s+\$[0-9,]+/);
  return match?.[1]?.trim();
}

function extractPrice(text: string, homeName: string) {
  const lowerText = text.toLowerCase();
  const nameIndex = lowerText.indexOf(homeName.toLowerCase());
  const scoped = nameIndex >= 0 ? text.slice(nameIndex, nameIndex + 1200) : text;
  const matches = Array.from(scoped.matchAll(/\$\s*([0-9][0-9,]{3,})/g));
  const prices = matches.map((match) => Number(match[1].replace(/,/g, ""))).filter((value) => Number.isFinite(value) && value >= 10000);
  return prices.length ? prices[0] : null;
}

function extractGallery(item: Allow, html: string, homeName: string, product: ProductJson | null): GalleryItem[] {
  const candidates: GalleryItem[] = [];
  const seen = new Set<string>();

  const add = (rawUrl: string, context: string) => {
    const src = normalizeImageUrl(rawUrl);
    const combined = `${src} ${context}`;
    if (!src || seen.has(src)) return;
    if (/logo|favicon|icon|avatar|map|staticmap|social|youtube|facebook|instagram|tiktok|x\.com|twitter/i.test(combined)) return;
    if (/view similar homes|raw media link/i.test(context)) return;
    if (!contextBelongsToHome(context, homeName)) return;
    if (!/trove\.b-cdn\.net|_next\/image/i.test(src)) return;
    const category = classify(combined);
    const alt = makeAlt(homeName, category, context);
    seen.add(src);
    candidates.push({ src, alt, category, sourceUrl: item.url });
  };

  for (const imageUrl of extractStructuredImages(product)) {
    add(imageUrl, findImageContext(html, imageUrl) || `${homeName} product image`);
  }

  const imageTagRegex = /<img\b([^>]+)>/gi;
  let imageMatch: RegExpExecArray | null;
  while ((imageMatch = imageTagRegex.exec(html))) {
    const attrs = imageMatch[1];
    const context = attr(attrs, "alt") || attr(attrs, "aria-label") || strip(attrs);
    add(attr(attrs, "src"), context);
    add(attr(attrs, "data-src"), context);
    add(attr(attrs, "srcset"), context);
    add(attr(attrs, "data-srcset"), context);
  }

  const sourceTagRegex = /<source\b([^>]+)>/gi;
  let sourceMatch: RegExpExecArray | null;
  while ((sourceMatch = sourceTagRegex.exec(html))) {
    const attrs = sourceMatch[1];
    const context = attr(attrs, "title") || strip(attrs);
    add(attr(attrs, "src"), context);
    add(attr(attrs, "data-src"), context);
    add(attr(attrs, "srcset"), context);
    add(attr(attrs, "data-srcset"), context);
  }

  return candidates.slice(0, 24);
}

function extractStructuredImages(product: ProductJson | null) {
  if (!product?.image) return [] as string[];
  const values = Array.isArray(product.image) ? product.image : [product.image];
  const images: string[] = [];
  for (const value of values) {
    if (typeof value === "string") images.push(value);
    else if (value && typeof value === "object") {
      const image = value as Record<string, unknown>;
      const url = image.url ?? image.contentUrl;
      if (typeof url === "string") images.push(url);
    }
  }
  return images;
}

function findImageContext(html: string, imageUrl: string) {
  let basename = "";
  try { basename = path.posix.basename(new URL(imageUrl).pathname); } catch {}
  if (!basename) return "";
  const imageTagRegex = /<img\b([^>]+)>/gi;
  let match: RegExpExecArray | null;
  while ((match = imageTagRegex.exec(html))) {
    const attrs = match[1];
    if (!attrs.includes(basename)) continue;
    return attr(attrs, "alt") || attr(attrs, "aria-label") || "";
  }
  return "";
}

function contextBelongsToHome(context: string, homeName: string) {
  const readable = strip(context).toLowerCase();
  if (!readable) return true;
  if (!/floor\s?plan|hero|elevation|exterior|home features/.test(readable)) return true;
  const tokens = homeName.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3);
  return tokens.some((token) => readable.includes(token)) || readable === "floor plan" || readable === "product image";
}

function extractBrochureUrl(html: string, sourcePage: string) {
  const hrefRegex = /href=["']([^"']+(?:\/pdf|\.pdf(?:\?[^"']*)?))["']/gi;
  const match = hrefRegex.exec(html);
  if (!match?.[1]) return null;
  try { return new URL(match[1].replace(/&amp;/g, "&"), sourcePage).toString(); } catch { return null; }
}

function normalizeImageUrl(raw: string) {
  if (!raw) return "";
  const first = raw.split(",")[0].trim().split(/\s+/)[0].replace(/&amp;/g, "&");
  if (!first) return "";
  try {
    const parsed = new URL(first, "https://easyhomesource.com");
    if (parsed.pathname === "/_next/image" && parsed.searchParams.get("url")) return proxiedTroveUrl(parsed.searchParams.get("url") || "");
    if (/trove\.b-cdn\.net/i.test(parsed.hostname)) return proxiedTroveUrl(parsed.toString());
    return parsed.toString();
  } catch { return ""; }
}

function proxiedTroveUrl(url: string) {
  try { return `https://easyhomesource.com/_next/image?q=75&url=${encodeURIComponent(new URL(url).toString())}&w=3840`; } catch { return ""; }
}

function classify(text: string): Category {
  const t = text.toLowerCase();
  if (/floor\s?plan|layout|blueprint/.test(t)) return "floorplan";
  if (/kitchen/.test(t)) return "kitchen";
  if (/bath|shower|toilet/.test(t)) return "bathroom";
  if (/bedroom|bed\s/.test(t)) return "bedroom";
  if (/living|interior|dining|utility|laundry/.test(t)) return "interior";
  if (/hero|elevation|exterior|front|porch/.test(t)) return "exterior";
  return "other";
}

function makeAlt(homeName: string, category: Category, context: string) {
  const readable = strip(context).slice(0, 120);
  if (readable && !/srcset|sizes|loading|decoding|class|style|view similar homes/i.test(readable)) return readable;
  if (category === "floorplan") return `${homeName} floor plan`;
  return `${homeName} ${category} home features`;
}

function attr(tag: string, name: string) {
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || "";
}

function strip(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#x27;|&quot;|&amp;/g, " ").replace(/\s+/g, " ").trim();
}

function titleFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function fetchText(url: string) {
  const res = await fetch(url, { headers: pageHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function pageHeaders() {
  return { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9", "Referer": "https://easyhomesource.com/homes" };
}

async function writeOutput(details: Record<string, ScrapedDetail>) {
  const body = `import type { HomeMediaManifest } from "@/data/homeMedia";\n\nexport type ScrapedHomeDetail = {\n  slug: string;\n  sourcePage: string | null;\n  startingPrice: number | null;\n  priceLabel: string | null;\n  media: HomeMediaManifest[string] | null;\n};\n\nexport const scrapedHomeDetails: Record<string, ScrapedHomeDetail> = ${JSON.stringify(details, null, 2)};\n`;
  await writeFile(OUTPUT_PATH, body);
}

function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
main().catch((error) => { console.error(error); process.exit(1); });
