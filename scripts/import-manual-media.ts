import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import allowlist from "./trove-media-allowlist.json" with { type: "json" };

type Category = "exterior" | "interior" | "kitchen" | "bathroom" | "bedroom" | "floorplan" | "brochure" | "video" | "other";
type ManualMapItem = { slug: string; sourcePage?: string | null; media: { url: string; category?: Category; alt?: string }[] };
type GalleryItem = { src: string; alt: string; category: Category; isPrimary?: boolean; sourceUrl?: string };

const ROOT = process.cwd();
const categories: Category[] = ["exterior", "interior", "kitchen", "bathroom", "bedroom", "floorplan", "brochure", "video", "other"];
const mapFiles = ["scripts/trove-media-manual-map.json", "scripts/trove-media-manual-map.generated.json"];
const seenHashes = new Set<string>();

async function main() {
  const maps = await readMaps();
  const manifest: Record<string, unknown> = {};
  for (const home of allowlist as { slug: string; name: string; troveDetailUrl?: string }[]) {
    for (const category of categories) await mkdir(path.join(ROOT, "public/homes", home.slug, category), { recursive: true });
    const entry = maps.find((item) => item.slug === home.slug);
    const gallery: GalleryItem[] = [];
    const links = { brochureUrl: null as string | null, videoUrl: null as string | null, virtualTourUrl: null as string | null };
    const counts = Object.fromEntries(categories.map((category) => [category, 0])) as Record<Category, number>;
    const seenUrls = new Set<string>();

    for (const media of entry?.media || []) {
      const url = media.url;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);
      const category = categories.includes(media.category as Category) ? media.category as Category : classify(url + " " + (media.alt || ""));
      if (category === "video") { links.videoUrl ||= url; continue; }
      if (category === "brochure") links.brochureUrl ||= url;
      const saved = await download(home.slug, home.name, url, category, ++counts[category], media.alt || `${home.name} ${category}`);
      if (saved) gallery.push(saved);
    }
    const primary = gallery.find((item) => !["floorplan", "brochure", "video"].includes(item.category));
    if (primary) primary.isPrimary = true;
    manifest[home.slug] = { slug: home.slug, gallery, floorPlanImage: gallery.find((item) => item.category === "floorplan")?.src || null, ...links, sourcePage: entry?.sourcePage || home.troveDetailUrl || null };
    console.log(`- ${home.slug}: ${gallery.length} downloaded, video=${links.videoUrl ? "yes" : "no"}, brochure=${links.brochureUrl ? "yes" : "no"}`);
  }
  await writeFile(path.join(ROOT, "data/homeMedia.generated.ts"), `import type { HomeMediaManifest } from "@/data/homeMedia";\n\nexport const homeMedia: HomeMediaManifest = ${JSON.stringify(manifest, null, 2)};\n`);
}

async function readMaps() { const merged = new Map<string, ManualMapItem>(); for (const relative of mapFiles) { const file = path.join(ROOT, relative); if (!existsSync(file)) continue; for (const item of JSON.parse(await readFile(file, "utf8")) as ManualMapItem[]) { const old = merged.get(item.slug); merged.set(item.slug, { slug: item.slug, sourcePage: item.sourcePage || old?.sourcePage || null, media: [...(old?.media || []), ...(item.media || [])] }); } } return Array.from(merged.values()); }
async function download(slug: string, homeName: string, url: string, category: Category, number: number, alt: string): Promise<GalleryItem | null> { try { const res = await fetch(url, { headers: { "user-agent": "EasyHomeSource manual media importer (+public media URLs only)" } }); if (!res.ok) throw new Error(`${res.status} ${res.statusText}`); const buffer = Buffer.from(await res.arrayBuffer()); const hash = createHash("sha256").update(buffer).digest("hex"); if (seenHashes.has(hash)) return null; seenHashes.add(hash); const extension = extname(url, category); const fileName = `${slug}-${category}-${String(number).padStart(2, "0")}${extension}`; const disk = path.join(ROOT, "public/homes", slug, category, fileName); await writeFile(disk, buffer); return { src: `/homes/${slug}/${category}/${fileName}`, alt: alt || `${homeName} ${category}`, category, sourceUrl: url }; } catch (error) { console.warn(`Failed to download ${url}: ${error instanceof Error ? error.message : String(error)}`); return null; } }
function extname(url: string, category: Category) { if (category === "brochure") return ".pdf"; const ext = path.extname(new URL(url).pathname).toLowerCase(); return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"].includes(ext) ? ext : ".jpg"; }
function classify(text: string): Category { const t = text.toLowerCase(); if (/brochure|\.pdf/.test(t)) return "brochure"; if (/video|youtube|vimeo|matterport|tour|\.mp4|\.mov|\.webm/.test(t)) return "video"; if (/floor\s?plan|layout|blueprint/.test(t)) return "floorplan"; if (/kitchen/.test(t)) return "kitchen"; if (/bath|shower|toilet|vanity/.test(t)) return "bathroom"; if (/bedroom|bed\b|master|primary/.test(t)) return "bedroom"; if (/exterior|front|porch|elevation|hero|outside/.test(t)) return "exterior"; if (/interior|living|dining|utility|laundry|room/.test(t)) return "interior"; return "other"; }

main().catch((error) => { console.error(error); process.exit(1); });
