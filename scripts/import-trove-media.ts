import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const START_URL = "https://easyhomesource.com/homes";
const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports");
const NO_MEDIA_MESSAGE = "No media downloaded for this home. Possible causes: Trove lazy-loads images client-side, images are protected behind scripts, selector mismatch, or detail URL not found.";
const DEBUG = process.argv.includes("--debug");
const MANUAL = process.argv.includes("--manual");

type Category = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "brochure" | "video" | "other";
type Allow = { name: string; slug: string; troveName: string; troveDetailUrl?: string; aliases: string[] };
type Candidate = { url: string; kind: "image" | "brochure" | "video"; alt: string; category: Category; sourceUrl: string; score: number };
type ManualMapItem = { slug: string; media: { url: string; category?: Category; alt?: string }[] };
type AcceptedCandidate = Candidate & { accepted: true };
type RejectedCandidate = Candidate & { accepted: false; reason: string };
type HomeReport = {
  homeName: string;
  slug: string;
  matchedTroveDetailUrl: string | null;
  detailPageFound: boolean;
  imgTagCount: number;
  srcsetUrlCount: number;
  pdfBrochureLinkCount: number;
  iframeVideoLinkCount: number;
  mediaCandidatesFound: number;
  mediaCandidatesAccepted: number;
  mediaCandidatesRejected: number;
  rejectionReasons: Record<string, number>;
  finalDownloadedFiles: string[];
  generatedGalleryPaths: string[];
  errors: string[];
  note?: string;
};
type ExtractedCandidates = { candidates: Candidate[]; counts: Pick<HomeReport, "imgTagCount" | "srcsetUrlCount" | "pdfBrochureLinkCount" | "iframeVideoLinkCount"> };

const categories: Category[] = ["exterior", "interior", "kitchen", "bathroom", "bedroom", "floorplan", "brochure", "video", "other"];
const skipped = { duplicate: 0, unrelatedHomes: 0, logosIcons: 0, tiny: 0, failed: 0 };
const seenHashes = new Map<string, string>();

async function main() {
  const allowlist = JSON.parse(await readFile(path.join(ROOT, "scripts/trove-media-allowlist.json"), "utf8")) as Allow[];
  const manualMap = await readManualMap();
  const manifest: Record<string, unknown> = {};
  const reports: HomeReport[] = [];
  await mkdir(REPORT_DIR, { recursive: true });
  for (const home of allowlist) {
    for (const category of categories) await mkdir(path.join(ROOT, "public/homes", home.slug, category), { recursive: true });
    manifest[home.slug] = emptyEntry(home.slug, null);
  }
  let listingHtml = "";
  if (!MANUAL) {
    try {
      debug(`Fetching Trove listing page: ${START_URL}`);
      listingHtml = await fetchText(START_URL);
    } catch (error) {
      console.warn(`Could not fetch ${START_URL}; wrote empty approved-home manifest.`, error);
    }
  } else {
    debug("Manual mode enabled: using troveDetailUrl values from scripts/trove-media-allowlist.json.");
  }

  for (const home of allowlist) {
    const report = createHomeReport(home);
    reports.push(report);
    try {
      const detailUrl = MANUAL ? explicitManualDetailUrl(home) : home.troveDetailUrl || findDetailUrl(listingHtml, home);
      report.matchedTroveDetailUrl = detailUrl;
      debug(`${home.name} (${home.slug}) matched Trove URL: ${detailUrl || "none"}`);
      let extracted: ExtractedCandidates = { candidates: [], counts: { imgTagCount: 0, srcsetUrlCount: 0, pdfBrochureLinkCount: 0, iframeVideoLinkCount: 0 } };
      if (!detailUrl) {
        skipped.unrelatedHomes++;
        report.errors.push("Detail URL not found.");
      } else {
        debug(`Fetching Trove detail page for ${home.name}: ${detailUrl}`);
        const html = await fetchText(detailUrl);
        report.detailPageFound = true;
        extracted = extractCandidates(html, detailUrl);
        Object.assign(report, extracted.counts);
      }
      const manualCandidates = manualCandidatesFor(home, manualMap);
      const allCandidates = [...extracted.candidates, ...manualCandidates];
      report.mediaCandidatesFound = allCandidates.length;
      debug(`All image/media candidate URLs before filtering for ${home.name}:\n${allCandidates.map((c) => `  - [${c.kind}/${c.category}] ${c.url}`).join("\n") || "  (none)"}`);
      const assessed = assessCandidates(dedupeByUrl(allCandidates));
      const candidates = assessed.filter((candidate): candidate is AcceptedCandidate => candidate.accepted);
      for (const rejected of assessed.filter((candidate): candidate is RejectedCandidate => !candidate.accepted)) addRejection(report, rejected.reason);
      report.mediaCandidatesAccepted = candidates.length;
      report.mediaCandidatesRejected = assessed.length - candidates.length;
      const downloaded: { src: string; alt: string; category: Category; isPrimary?: boolean; sourceUrl?: string }[] = [];
      const links = { brochureUrl: null as string | null, videoUrl: null as string | null, virtualTourUrl: null as string | null };
      const counts: Record<Category, number> = Object.fromEntries(categories.map((category) => [category, 0])) as Record<Category, number>;
      for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
        if (candidate.kind === "video") { links.videoUrl ||= candidate.url; continue; }
        if (candidate.kind === "brochure") { links.brochureUrl ||= candidate.url; }
        const category = candidate.category as Category;
        debug(`Downloading accepted candidate for ${home.name} to public/homes/${home.slug}/${category}/: ${candidate.url}`);
        const saved = await downloadCandidate(home, candidate, ++counts[category], report);
        if (saved) downloaded.push(saved);
      }
      const firstPhoto = downloaded.find((item) => !["floorplan", "brochure", "video"].includes(item.category));
      if (firstPhoto) firstPhoto.isPrimary = true;
      const floorPlanImage = downloaded.find((item) => item.category === "floorplan")?.src ?? null;
      manifest[home.slug] = { slug: home.slug, gallery: downloaded, floorPlanImage, ...links, sourcePage: detailUrl };
      report.generatedGalleryPaths = downloaded.map((item) => item.src);
      if (!downloaded.length) report.note = NO_MEDIA_MESSAGE;
      console.log(`- ${home.name}: ${downloaded.filter((x) => x.category !== "brochure").length} images, ${downloaded.filter((x) => x.category === "floorplan").length} floor plan, ${links.videoUrl ? 1 : 0} videos`);
    } catch (error) {
      report.errors.push(error instanceof Error ? error.message : String(error));
      report.note = NO_MEDIA_MESSAGE;
      manifest[home.slug] = emptyEntry(home.slug, report.matchedTroveDetailUrl);
    }
  }
  await writeManifest(manifest);
  await writeReports(reports);
  printSkipped();
  console.log(`Reports written to reports/trove-media-import-report.json and reports/trove-media-import-report.md`);
}

async function readManualMap(): Promise<ManualMapItem[]> {
  const file = path.join(ROOT, "scripts/trove-media-manual-map.json");
  if (!existsSync(file)) return [];
  const parsed = JSON.parse(await readFile(file, "utf8")) as ManualMapItem[];
  debug(`Loaded manual media map: scripts/trove-media-manual-map.json (${parsed.length} homes)`);
  return parsed;
}

function manualCandidatesFor(home: Allow, manualMap: ManualMapItem[]): Candidate[] {
  const entry = manualMap.find((item) => item.slug === home.slug);
  if (!entry) return [];
  debug(`Manual media map matched ${home.name} (${home.slug}) with ${entry.media.length} URLs.`);
  return entry.media.map((item) => {
    const category = categories.includes(item.category as Category) ? (item.category as Category) : "other";
    const kind: Candidate["kind"] = category === "brochure" || /\.pdf(\?|$)/i.test(item.url) ? "brochure" : category === "video" || /youtube|youtu\.be|vimeo|matterport|tour/i.test(item.url) ? "video" : "image";
    return { url: item.url, kind, alt: item.alt || `${home.name} ${category}`, category, sourceUrl: "scripts/trove-media-manual-map.json", score: score(item.url, item.alt || category, category) + 100 };
  });
}

function createHomeReport(home: Allow): HomeReport { return { homeName: home.name, slug: home.slug, matchedTroveDetailUrl: null, detailPageFound: false, imgTagCount: 0, srcsetUrlCount: 0, pdfBrochureLinkCount: 0, iframeVideoLinkCount: 0, mediaCandidatesFound: 0, mediaCandidatesAccepted: 0, mediaCandidatesRejected: 0, rejectionReasons: {}, finalDownloadedFiles: [], generatedGalleryPaths: [], errors: [] }; }
function addRejection(report: HomeReport, reason: string) { report.rejectionReasons[reason] = (report.rejectionReasons[reason] || 0) + 1; }
function debug(message: string) { if (DEBUG) console.log(`[trove-media:debug] ${message}`); }
function printSkipped() { console.log("\nImported media summary complete."); console.log("Skipped:"); console.log(`- ${skipped.duplicate} duplicate images`); console.log(`- ${skipped.unrelatedHomes} unrelated/missing approved matches`); console.log(`- ${skipped.logosIcons} logos/icons/UI assets`); console.log(`- ${skipped.tiny} tiny thumbnails`); console.log(`- ${skipped.failed} failed downloads`); }

function explicitManualDetailUrl(home: Allow): string | null { return home.troveDetailUrl || null; }

function findDetailUrl(html: string, home: Allow): string | null { const aliases = [home.troveName, home.name, ...home.aliases].map(norm); const anchors = Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)); for (const match of anchors) { const href = absolute(match[1], START_URL); const text = strip(match[2]); const surrounding = strip(html.slice(Math.max(0, (match.index ?? 0) - 1200), (match.index ?? 0) + 1200)); const haystack = norm(`${text} ${surrounding} ${href}`); if (aliases.some((alias) => haystack.includes(alias)) && /home|detail|inventory|model/i.test(href)) return href; } return null; }

function extractCandidates(html: string, pageUrl: string): ExtractedCandidates {
  const out: Candidate[] = [];
  const counts = { imgTagCount: 0, srcsetUrlCount: 0, pdfBrochureLinkCount: 0, iframeVideoLinkCount: 0 };
  const add = (url: string, context: string, kind: Candidate["kind"] = "image") => {
    for (const finalUrl of urlsFromValue(url, pageUrl)) {
      const text = strip(context + " " + finalUrl);
      const category = kind === "brochure" ? "brochure" : kind === "video" ? "video" : classify(text);
      out.push({ url: finalUrl, kind, alt: makeAlt(text, category), category, sourceUrl: pageUrl, score: score(finalUrl, text, category) });
    }
  };
  for (const m of Array.from(html.matchAll(/<img\b([^>]+)>/gi))) {
    const attrs = m[1];
    counts.imgTagCount++;
    counts.srcsetUrlCount += srcsetUrlCount(attr(attrs, "srcset")) + srcsetUrlCount(attr(attrs, "data-srcset"));
    add(attr(attrs, "src"), attr(attrs, "alt") + " " + attrs);
    add(attr(attrs, "data-src"), attr(attrs, "alt") + " " + attrs);
    add(attr(attrs, "srcset"), attr(attrs, "alt") + " " + attrs);
    add(attr(attrs, "data-srcset"), attr(attrs, "alt") + " " + attrs);
  }
  for (const m of Array.from(html.matchAll(/<source\b([^>]+)>/gi))) {
    const attrs = m[1];
    counts.srcsetUrlCount += srcsetUrlCount(attr(attrs, "srcset")) + srcsetUrlCount(attr(attrs, "data-srcset"));
    add(attr(attrs, "src"), attrs);
    add(attr(attrs, "data-src"), attrs);
    add(attr(attrs, "srcset"), attrs);
    add(attr(attrs, "data-srcset"), attrs);
  }
  for (const m of Array.from(html.matchAll(/<meta\b([^>]+)>/gi))) if (/og:image|twitter:image/i.test(m[1])) add(attr(m[1], "content"), m[1]);
  for (const m of Array.from(html.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a>/gi))) {
    const href = attr(m[1], "href");
    if (/\.pdf(\?|$)/i.test(href)) { counts.pdfBrochureLinkCount++; add(href, m[2] + m[1], "brochure"); }
    if (/youtube|youtu\.be|facebook|instagram|tiktok|twitter\.com|x\.com|matterport|tour|vimeo/i.test(href)) { counts.iframeVideoLinkCount++; add(href, m[2] + m[1], "video"); }
  }
  for (const m of Array.from(html.matchAll(/<(iframe|video|source)\b([^>]+)>/gi))) {
    const src = attr(m[2], "src");
    if (src) { counts.iframeVideoLinkCount++; add(src, m[2], /youtube|vimeo|matterport|tour/i.test(src) ? "video" : "image"); }
  }
  for (const script of Array.from(html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))) {
    for (const imageUrl of jsonLdImages(script[1], pageUrl)) add(imageUrl, "json-ld image");
  }
  for (const m of Array.from(html.matchAll(/"image"\s*:\s*("(?:\\"|[^"])+"|\[[^\]]+\])/gi))) {
    for (const u of Array.from(m[1].matchAll(/https?:[^"\]]+/g))) add(u[0].replace(/\\\//g, "/"), "json image");
  }
  return { candidates: out, counts };
}

function urlsFromValue(value: string, base: string) {
  if (!value) return [];
  return value.split(",").map((part) => part.trim().split(/\s+/)[0]).map((url) => absolute(url, base)).filter(Boolean);
}

function jsonLdImages(raw: string, base: string): string[] {
  try {
    const parsed = JSON.parse(raw.replace(/&quot;/g, '"'));
    const urls: string[] = [];
    const visit = (value: unknown) => {
      if (!value) return;
      if (typeof value === "string") { if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(value) || /^https?:/i.test(value)) urls.push(absolute(value, base)); return; }
      if (Array.isArray(value)) { for (const item of value) visit(item); return; }
      if (typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (record.image) visit(record.image);
        if (record.url && (record["@type"] === "ImageObject" || record.contentUrl)) visit(record.url);
        if (record.contentUrl) visit(record.contentUrl);
        for (const key of ["thumbnailUrl", "associatedMedia"]) if (record[key]) visit(record[key]);
      }
    };
    visit(parsed);
    return urls.filter(Boolean);
  } catch { return []; }
}
function assessCandidates(items: Candidate[]): Array<AcceptedCandidate | RejectedCandidate> { return items.map((c) => { const reason = rejectionReason(c); debug(`${reason ? "REJECT" : "ACCEPT"} ${c.url}${reason ? ` — ${reason}` : ""}`); return reason ? { ...c, accepted: false, reason } : { ...c, accepted: true }; }); }
function rejectionReason(c: Candidate): string | null { const u = c.url.toLowerCase(); if (c.kind === "video" || c.kind === "brochure") return null; if (/logo|favicon|icon|sprite|badge|buildtrove|pixel|avatar|social|facebook|instagram|youtube/.test(u)) { skipped.logosIcons++; return "logos/icons/UI assets"; } if (/(^|[?&])(w|width)=([1-9][0-9]?|1[0-9]{2})\b|(?:-|_)([1-9][0-9]?|1[0-9]{2})x/.test(u)) { skipped.tiny++; return "tiny thumbnails"; } if (!/\.(jpe?g|png|webp|avif)(\?|$)/i.test(u)) return "unsupported image file type"; return null; }
function classify(text: string): Category { const t = norm(text); if (/floor\s?plan|layout|blueprint/.test(t)) return "floorplan"; if (/kitchen/.test(t)) return "kitchen"; if (/bath|shower|toilet/.test(t)) return "bathroom"; if (/bedroom|bed\s/.test(t)) return "bedroom"; if (/hero|exterior|elevation|front|porch/.test(t)) return "exterior"; if (/living|interior|dining|utility|laundry/.test(t)) return "interior"; return "other"; }
function srcsetUrlCount(value: string) { return value ? value.split(",").filter(Boolean).length : 0; }
function dedupeByUrl(items: Candidate[]) { const map = new Map<string, Candidate>(); for (const item of items) { const key = item.url.replace(/([?&])(w|width|h|height|fit|crop|auto|format|quality|q)=[^&]+/gi, "$1").replace(/[?&]+$/, ""); const old = map.get(key); if (!old || item.score > old.score) map.set(key, item); else skipped.duplicate++; } return Array.from(map.values()); }
async function downloadCandidate(home: Allow, c: Candidate, number: number, report: HomeReport) { try { debug(`Fetching media file: ${c.url}`); const res = await fetch(c.url); if (!res.ok) throw new Error(String(res.status)); const buf = Buffer.from(await res.arrayBuffer()); const hash = createHash("sha256").update(buf).digest("hex"); if (seenHashes.has(hash)) { skipped.duplicate++; addRejection(report, "duplicate downloaded file hash"); report.mediaCandidatesRejected++; return null; } seenHashes.set(hash, c.url); const ext = c.kind === "brochure" ? ".pdf" : extname(c.url); const fileName = `${home.slug}-${c.category}-${String(number).padStart(2, "0")}${ext}`; const disk = path.join(ROOT, "public/homes", home.slug, c.category, fileName); await writeFile(disk, buf); debug(`Final download destination: ${path.relative(ROOT, disk)}`); report.finalDownloadedFiles.push(path.relative(ROOT, disk)); return { src: `/homes/${home.slug}/${c.category}/${fileName}`, alt: c.alt || `${home.name} ${c.category}`, category: c.category, sourceUrl: c.sourceUrl }; } catch (error) { skipped.failed++; const message = `Failed to download ${c.url}: ${error instanceof Error ? error.message : String(error)}`; report.errors.push(message); addRejection(report, "failed download"); return null; } }
function extname(url: string) { const ext = path.extname(new URL(url).pathname).toLowerCase(); return [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext) ? ext : ".jpg"; }
async function fetchText(url: string) {
  debug(`Fetched Trove page: ${url}`);
  try {
    const res = await fetch(url, { headers: { "user-agent": "EasyHomeSource media importer (+approved catalog media only)" } });
    if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
    return res.text();
  } catch (error) {
    const cause = error instanceof Error && error.cause instanceof Error ? ` (${error.cause.message})` : "";
    throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}${cause}`);
  }
}
async function writeManifest(manifest: Record<string, unknown>) { await writeFile(path.join(ROOT, "data/homeMedia.generated.ts"), `import type { HomeMediaManifest } from "@/data/homeMedia";\n\nexport const homeMedia: HomeMediaManifest = ${JSON.stringify(manifest, null, 2)};\n`); }
async function writeReports(reports: HomeReport[]) { await writeFile(path.join(REPORT_DIR, "trove-media-import-report.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), startUrl: START_URL, manualMode: MANUAL, debugMode: DEBUG, homes: reports }, null, 2)}\n`); await writeFile(path.join(REPORT_DIR, "trove-media-import-report.md"), renderMarkdownReport(reports)); }
function renderMarkdownReport(reports: HomeReport[]) { const lines = ["# Trove Media Import Report", "", `Generated: ${new Date().toISOString()}`, `Manual mode: ${MANUAL ? "yes" : "no"}`, ""]; for (const r of reports) { lines.push(`## ${r.homeName}`, "", `- Slug: ${r.slug}`, `- Matched Trove detail URL: ${r.matchedTroveDetailUrl || "Not found"}`, `- Detail page found: ${r.detailPageFound ? "yes" : "no"}`, `- IMG tags found: ${r.imgTagCount}`, `- Srcset URLs found: ${r.srcsetUrlCount}`, `- PDF/brochure links found: ${r.pdfBrochureLinkCount}`, `- Iframe/video links found: ${r.iframeVideoLinkCount}`, `- Media candidates found: ${r.mediaCandidatesFound}`, `- Media candidates accepted: ${r.mediaCandidatesAccepted}`, `- Media candidates rejected: ${r.mediaCandidatesRejected}`, `- Rejection reasons: ${Object.entries(r.rejectionReasons).map(([k, v]) => `${k} (${v})`).join(", ") || "None"}`, `- Final downloaded files: ${r.finalDownloadedFiles.join(", ") || "None"}`, `- Generated gallery paths: ${r.generatedGalleryPaths.join(", ") || "None"}`, `- Errors: ${r.errors.join("; ") || "None"}`); if (r.note) lines.push(`- Note: ${r.note}`); lines.push(""); } return `${lines.join("\n")}\n`; }
function emptyEntry(slug: string, sourcePage: string | null) { return { slug, gallery: [], floorPlanImage: null, brochureUrl: null, videoUrl: null, virtualTourUrl: null, sourcePage }; }
function attr(tag: string, name: string) { return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || ""; }
function absolute(url: string, base: string) { try { return new URL(url, base).toString(); } catch { return ""; } }
function strip(html: string) { return html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim(); }
function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function score(url: string, text: string, category: Category) { return (category === "floorplan" ? 20 : category === "other" ? 1 : 10) + (/(1600|2048|large|original)/i.test(url) ? 5 : 0) + Math.min(text.length / 100, 3); }
function makeAlt(text: string, category: Category) { return text.slice(0, 120) || `Manufactured home ${category}`; }

main().catch((error) => { console.error(error); process.exit(1); });
