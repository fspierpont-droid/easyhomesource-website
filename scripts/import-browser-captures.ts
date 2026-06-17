import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import allowlist from "./trove-media-allowlist.json" with { type: "json" };

type Category = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "brochure" | "video" | "other";
type CaptureMedia = { url: string; type?: string; categoryGuess?: string; alt?: string; width?: number; height?: number };
type Capture = { slug?: string; sourcePage?: string; pageTitle?: string; capturedAt?: string; media?: CaptureMedia[] };
type ManualItem = { slug: string; sourcePage?: string | null; media: { url: string; category: Category; alt: string }[] };

const ROOT = process.cwd();
const CAPTURE_DIR = path.join(ROOT, "imports/browser-captures");
const REPORT_DIR = path.join(ROOT, "reports");
const OUT = path.join(ROOT, "scripts/trove-media-manual-map.generated.json");
const catalogHomes = allowlist as { name: string; slug: string; troveName?: string; aliases?: string[] }[];
const categories: Category[] = ["exterior", "interior", "kitchen", "bathroom", "bedroom", "floorplan", "brochure", "video", "other"];
const bad = /(?:favicon|apple-touch-icon|logo|sprite|social|facebook|instagram|twitter|x-icon|linkedin|pinterest|pixel|tracking|analytics|avatar|badge|loader|spinner|placeholder)/i;
const authQuery = /(?:token|auth|session|cookie|signature|signed|jwt|bearer|access[_-]?key|secret|credential|password|expires|policy|x-amz|x-goog|cf-signature)/i;

async function main() {
  await mkdir(CAPTURE_DIR, { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });
  const files = (await readdir(CAPTURE_DIR)).filter((file) => file.endsWith(".json")).sort();
  const generated: ManualItem[] = [];
  const report: unknown[] = [];
  const seenBySlug = new Map<string, Set<string>>();

  for (const file of files) {
    const full = path.join(CAPTURE_DIR, file);
    const capture = JSON.parse(await readFile(full, "utf8")) as Capture;
    const slug = mapSlug(capture, file);
    const item: ManualItem = { slug: slug || path.basename(file, ".json"), sourcePage: capture.sourcePage || null, media: [] };
    const rejections: Record<string, number> = {};
    const seen = seenBySlug.get(item.slug) || new Set<string>();
    seenBySlug.set(item.slug, seen);

    for (const raw of capture.media || []) {
      const url = sanitizeUrl(raw.url);
      const reason = rejectionReason(url, raw);
      if (reason) { rejections[reason] = (rejections[reason] || 0) + 1; continue; }
      if (seen.has(url)) { rejections["duplicate URL"] = (rejections["duplicate URL"] || 0) + 1; continue; }
      seen.add(url);
      const category = classify([url, raw.alt, raw.categoryGuess, raw.type, capture.pageTitle, capture.sourcePage].filter(Boolean).join(" "));
      item.media.push({ url, category, alt: raw.alt || `${item.slug} ${category}` });
    }
    generated.push(item);
    report.push({ file, slug: item.slug, sourcePage: capture.sourcePage || null, pageTitle: capture.pageTitle || null, capturedMedia: capture.media?.length || 0, acceptedMedia: item.media.length, rejections });
  }

  await writeFile(OUT, `${JSON.stringify(generated, null, 2)}\n`);
  await writeFile(path.join(REPORT_DIR, "browser-capture-media-report.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), captures: report }, null, 2)}\n`);
  await writeFile(path.join(REPORT_DIR, "browser-capture-media-report.md"), markdown(report));
  console.log(`Wrote ${path.relative(ROOT, OUT)} from ${files.length} capture file(s).`);
  console.log("Review reports/browser-capture-media-report.md before importing media.");
}

function mapSlug(capture: Capture, file: string) {
  if (capture.slug && catalogHomes.some((h) => h.slug === capture.slug)) return capture.slug;
  const filenameSlug = path.basename(file, ".json").toLowerCase();
  if (catalogHomes.some((h) => h.slug === filenameSlug)) return filenameSlug;
  const haystack = norm([capture.pageTitle, capture.sourcePage].filter(Boolean).join(" "));
  const matched = catalogHomes.find((home) => [home.slug, home.name, home.troveName, ...(home.aliases || [])].filter(Boolean).some((value) => haystack.includes(norm(String(value)))));
  return matched?.slug || "";
}
function sanitizeUrl(value: string) { const parsed = new URL(value); for (const key of Array.from(parsed.searchParams.keys())) if (authQuery.test(key) || authQuery.test(parsed.searchParams.get(key) || "")) parsed.searchParams.delete(key); parsed.hash = ""; return parsed.toString(); }
function rejectionReason(url: string, media: CaptureMedia) { if (!url || /^data:|^blob:|^javascript:/i.test(url)) return "unsafe or empty URL"; if (bad.test(url) || bad.test(media.alt || "")) return "UI/logo/social/tracking asset"; if ((media.width && media.width < 180) || (media.height && media.height < 120)) return "tiny asset"; if (!/\.(jpe?g|png|webp|avif|gif|pdf|mp4|mov|m4v|webm)(?:[?#]|$)|youtube|youtu\.be|vimeo|matterport/i.test(url)) return "unsupported media URL"; return null; }
function classify(text: string): Category { const t = norm(text); if (/brochure|pdf/.test(t)) return "brochure"; if (/video|youtube|vimeo|matterport|tour|mp4|mov|webm/.test(t)) return "video"; if (/floor\s?plan|layout|blueprint/.test(t)) return "floorplan"; if (/kitchen/.test(t)) return "kitchen"; if (/bath|shower|toilet|vanity/.test(t)) return "bathroom"; if (/bedroom|bed\b|master|primary/.test(t)) return "bedroom"; if (/exterior|front|porch|elevation|hero|outside/.test(t)) return "exterior"; if (/interior|living|dining|utility|laundry|room/.test(t)) return "interior"; return "other"; }
function norm(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function markdown(rows: unknown[]) { const lines = ["# Browser Capture Media Report", "", `Generated: ${new Date().toISOString()}`, ""]; for (const r of rows as any[]) lines.push(`## ${r.file}`, "", `- Mapped slug: ${r.slug || "UNMATCHED"}`, `- Page title: ${r.pageTitle || ""}`, `- Source page: ${r.sourcePage || ""}`, `- Captured media: ${r.capturedMedia}`, `- Accepted media: ${r.acceptedMedia}`, `- Rejections: ${Object.entries(r.rejections).map(([k, v]) => `${k} (${v})`).join(", ") || "None"}`, ""); return `${lines.join("\n")}\n`; }

main().catch((error) => { console.error(error); process.exit(1); });
