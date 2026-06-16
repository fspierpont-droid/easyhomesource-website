import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const START_URL = "https://easyhomesource.com/homes";
const ROOT = process.cwd();
type Category = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "brochure" | "video" | "other";
type Allow = { name: string; slug: string; troveName: string; troveDetailUrl?: string; aliases: string[] };
type Candidate = { url: string; kind: "image" | "brochure" | "video"; alt: string; category: Category; sourceUrl: string; score: number };
const categories: Category[] = ["exterior", "interior", "kitchen", "bathroom", "bedroom", "floorplan", "brochure", "video", "other"];
const skipped = { duplicate: 0, unrelatedHomes: 0, logosIcons: 0, tiny: 0, failed: 0 };
const seenHashes = new Map<string, string>();

async function main() {
  const allowlist = JSON.parse(await readFile(path.join(ROOT, "scripts/trove-media-allowlist.json"), "utf8")) as Allow[];
  const manifest: Record<string, unknown> = {};
  for (const home of allowlist) {
    for (const category of categories) await mkdir(path.join(ROOT, "public/homes", home.slug, category), { recursive: true });
    manifest[home.slug] = emptyEntry(home.slug, null);
  }
  let listingHtml = "";
  try {
    listingHtml = await fetchText(START_URL);
  } catch (error) {
    console.warn(`Could not fetch ${START_URL}; wrote empty approved-home manifest.`, error);
    await writeManifest(manifest);
    printSkipped();
    return;
  }
  for (const home of allowlist) {
    const detailUrl = home.troveDetailUrl || findDetailUrl(listingHtml, home);
    if (!detailUrl) {
      skipped.unrelatedHomes++;
      manifest[home.slug] = emptyEntry(home.slug, null);
      continue;
    }
    const html = await fetchText(detailUrl);
    const candidates = dedupeByUrl(extractCandidates(html, detailUrl)).filter((candidate) => isUseful(candidate));
    const downloaded: { src: string; alt: string; category: Category; isPrimary?: boolean; sourceUrl?: string }[] = [];
    const links = { brochureUrl: null as string | null, videoUrl: null as string | null, virtualTourUrl: null as string | null };
    const counts: Record<Category, number> = Object.fromEntries(categories.map((category) => [category, 0])) as Record<Category, number>;
    for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
      if (candidate.kind === "video") { links.videoUrl ||= candidate.url; continue; }
      if (candidate.kind === "brochure") { links.brochureUrl ||= candidate.url; }
      const category = candidate.category as Category;
      const saved = await downloadCandidate(home, candidate, ++counts[category]);
      if (saved) downloaded.push(saved);
    }
    const firstPhoto = downloaded.find((item) => !["floorplan", "brochure", "video"].includes(item.category));
    if (firstPhoto) firstPhoto.isPrimary = true;
    const floorPlanImage = downloaded.find((item) => item.category === "floorplan")?.src ?? null;
    manifest[home.slug] = { slug: home.slug, gallery: downloaded, floorPlanImage, ...links, sourcePage: detailUrl };
    console.log(`- ${home.name}: ${downloaded.filter((x) => x.category !== "brochure").length} images, ${downloaded.filter((x) => x.category === "floorplan").length} floor plan, ${links.videoUrl ? 1 : 0} videos`);
  }
  await writeManifest(manifest);
  printSkipped();
}

function printSkipped() {
  console.log("\nImported media summary complete.");
  console.log("Skipped:");
  console.log(`- ${skipped.duplicate} duplicate images`);
  console.log(`- ${skipped.unrelatedHomes} unrelated/missing approved matches`);
  console.log(`- ${skipped.logosIcons} logos/icons/UI assets`);
  console.log(`- ${skipped.tiny} tiny thumbnails`);
  console.log(`- ${skipped.failed} failed downloads`);
}

function findDetailUrl(html: string, home: Allow): string | null {
  const aliases = [home.troveName, home.name, ...home.aliases].map(norm);
  const anchors = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  for (const match of anchors) {
    const href = absolute(match[1], START_URL);
    const text = strip(match[2]);
    const surrounding = strip(html.slice(Math.max(0, (match.index ?? 0) - 1200), (match.index ?? 0) + 1200));
    const haystack = norm(`${text} ${surrounding} ${href}`);
    if (aliases.some((alias) => haystack.includes(alias)) && /home|detail|inventory|model/i.test(href)) return href;
  }
  return null;
}

function extractCandidates(html: string, pageUrl: string): Candidate[] {
  const out: Candidate[] = [];
  const add = (url: string, context: string, kind: Candidate["kind"] = "image") => {
    const finalUrl = bestFromSrcset(url, pageUrl);
    if (!finalUrl) return;
    const text = strip(context + " " + finalUrl);
    const category = kind === "brochure" ? "brochure" : kind === "video" ? "video" : classify(text);
    out.push({ url: finalUrl, kind, alt: makeAlt(text, category), category, sourceUrl: finalUrl, score: score(finalUrl, text, category) });
  };
  for (const m of Array.from(html.matchAll(/<img\b([^>]+)>/gi))) add(attr(m[1], "srcset") || attr(m[1], "src") || "", attr(m[1], "alt") + " " + m[1]);
  for (const m of Array.from(html.matchAll(/<source\b([^>]+)>/gi))) add(attr(m[1], "srcset") || attr(m[1], "src") || "", m[1]);
  for (const m of Array.from(html.matchAll(/<meta\b([^>]+)>/gi))) if (/og:image|twitter:image/i.test(m[1])) add(attr(m[1], "content"), m[1]);
  for (const m of Array.from(html.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a>/gi))) {
    const href = attr(m[1], "href"); if (/\.pdf(\?|$)/i.test(href)) add(href, m[2] + m[1], "brochure");
    if (/youtube|youtu\.be|facebook|instagram|tiktok|twitter\.com|x\.com|matterport|tour/i.test(href)) add(href, m[2] + m[1], "video");
  }
  for (const m of Array.from(html.matchAll(/<(iframe|video|source)\b([^>]+)>/gi))) { const src = attr(m[2], "src"); if (src) add(src, m[2], /youtube|vimeo|matterport|tour/i.test(src) ? "video" : "image"); }
  for (const m of Array.from(html.matchAll(/"image"\s*:\s*("[^"]+"|\[[^\]]+\])/gi))) for (const u of Array.from(m[1].matchAll(/https?:[^"\]]+/g))) add(u[0], "json-ld image");
  return out;
}
function classify(text: string): Category { const t = norm(text); if (/floor\s?plan|layout|blueprint/.test(t)) return "floorplan"; if (/kitchen/.test(t)) return "kitchen"; if (/bath|shower|toilet/.test(t)) return "bathroom"; if (/bedroom|bed\s/.test(t)) return "bedroom"; if (/hero|exterior|elevation|front|porch/.test(t)) return "exterior"; if (/living|interior|dining|utility|laundry/.test(t)) return "interior"; return "other"; }
function isUseful(c: Candidate) { const u = c.url.toLowerCase(); if (c.kind === "video" || c.kind === "brochure") return true; if (/logo|favicon|icon|sprite|badge|buildtrove|pixel|avatar|social|facebook|instagram|youtube/.test(u)) { skipped.logosIcons++; return false; } if (/(^|[?&])(w|width)=([1-9][0-9]?|1[0-9]{2})\b|(?:-|_)([1-9][0-9]?|1[0-9]{2})x/.test(u)) { skipped.tiny++; return false; } return /\.(jpe?g|png|webp|avif)(\?|$)/i.test(u); }
function bestFromSrcset(value: string, base: string) { if (!value) return ""; const choices = value.split(",").map((part) => { const [url, size] = part.trim().split(/\s+/); return { url: absolute(url, base), size: Number((size || "").replace(/\D/g, "")) || 0 }; }); return choices.sort((a, b) => b.size - a.size)[0]?.url || absolute(value, base); }
function dedupeByUrl(items: Candidate[]) { const map = new Map<string, Candidate>(); for (const item of items) { const key = item.url.replace(/([?&])(w|width|h|height|fit|crop|auto|format|quality|q)=[^&]+/gi, "$1").replace(/[?&]+$/, ""); const old = map.get(key); if (!old || item.score > old.score) map.set(key, item); else skipped.duplicate++; } return Array.from(map.values()); }
async function downloadCandidate(home: Allow, c: Candidate, number: number) { try { const res = await fetch(c.url); if (!res.ok) throw new Error(String(res.status)); const buf = Buffer.from(await res.arrayBuffer()); const hash = createHash("sha256").update(buf).digest("hex"); if (seenHashes.has(hash)) { skipped.duplicate++; return null; } seenHashes.set(hash, c.url); const ext = c.kind === "brochure" ? ".pdf" : extname(c.url); const fileName = `${home.slug}-${c.category}-${String(number).padStart(2, "0")}${ext}`; const disk = path.join(ROOT, "public/homes", home.slug, c.category, fileName); await writeFile(disk, buf); return { src: `/homes/${home.slug}/${c.category}/${fileName}`, alt: c.alt || `${home.name} ${c.category}`, category: c.category, sourceUrl: c.sourceUrl }; } catch { skipped.failed++; return null; } }
function extname(url: string) { const ext = path.extname(new URL(url).pathname).toLowerCase(); return [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext) ? ext : ".jpg"; }
async function fetchText(url: string) { const res = await fetch(url, { headers: { "user-agent": "EasyHomeSource media importer (+approved catalog media only)" } }); if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`); return res.text(); }
async function writeManifest(manifest: Record<string, unknown>) { await writeFile(path.join(ROOT, "data/homeMedia.generated.ts"), `import type { HomeMediaManifest } from "@/data/homeMedia";\n\nexport const homeMedia: HomeMediaManifest = ${JSON.stringify(manifest, null, 2)};\n`); }
function emptyEntry(slug: string, sourcePage: string | null) { return { slug, gallery: [], floorPlanImage: null, brochureUrl: null, videoUrl: null, virtualTourUrl: null, sourcePage }; }
function attr(tag: string, name: string) { return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || ""; }
function absolute(url: string, base: string) { try { return new URL(url, base).toString(); } catch { return ""; } }
function strip(html: string) { return html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim(); }
function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function score(url: string, text: string, category: Category) { return (category === "floorplan" ? 20 : category === "other" ? 1 : 10) + (/(1600|2048|large|original)/i.test(url) ? 5 : 0) + Math.min(text.length / 100, 3); }
function makeAlt(text: string, category: Category) { return text.slice(0, 120) || `Manufactured home ${category}`; }

main().catch((error) => { console.error(error); process.exit(1); });
