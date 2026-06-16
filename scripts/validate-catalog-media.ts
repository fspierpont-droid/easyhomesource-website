import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import allowlist from "./trove-media-allowlist.json" with { type: "json" };

let failures = 0;
const root = process.cwd();
const homesSource = readFileSync(path.join(root, "data/homes.ts"), "utf8");
const manifestSource = readFileSync(path.join(root, "data/homeMedia.generated.ts"), "utf8");
function check(condition: unknown, message: string) { if (condition) console.log(`✓ ${message}`); else { failures++; console.error(`✗ ${message}`); } }
function catalogHas(slug: string) { return new RegExp(`slug:\\s*[\"']${slug}[\"']`).test(homesSource); }
function priceFor(slug: string) { const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const match = homesSource.match(new RegExp(`\\{[^}]*slug:\\s*[\"\']${escaped}[\"\'][^}]*startingPrice:\\s*([0-9.]+)`, "s")); return Number(match?.[1]); }
for (const approved of allowlist as { slug: string }[]) {
  check(catalogHas(approved.slug), `approved home exists in catalog: ${approved.slug}`);
  check(existsSync(path.join(root, "public/homes", approved.slug)), `media folder exists: public/homes/${approved.slug}`);
}
for (const match of Array.from(manifestSource.matchAll(/src":\s*"(\/homes\/[^"]+)"/g))) check(existsSync(path.join(root, "public", match[1])), `manifest gallery file exists: ${match[1]}`);
for (const match of Array.from(manifestSource.matchAll(/(?:floorPlanImage|brochureUrl)":\s*"(\/homes\/[^"]+)"/g))) check(existsSync(path.join(root, "public", match[1])), `manifest media file exists: ${match[1]}`);
check(priceFor("paxton") === 143185, "Paxton price remains 143185");
check(priceFor("tulip") === 39888, "Tulip price remains 39888");
if (failures) { console.error(`${failures} catalog media validation checks failed.`); process.exit(1); }
console.log("Catalog media validation passed.");
