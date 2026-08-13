import { readFileSync } from "node:fs";
import ts from "typescript";

const root = process.cwd();
const failures = [];
const reviews = [];

function readArray(file, variableName) {
  const sourceText = readFileSync(`${root}/${file}`, "utf8");
  const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  let records;

  function value(node) {
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    return undefined;
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === variableName && node.initializer) {
      let initializer = node.initializer;
      if (ts.isAsExpression(initializer)) initializer = initializer.expression;
      if (ts.isArrayLiteralExpression(initializer)) {
        records = initializer.elements.map((element) => {
          const record = { source: file };
          if (ts.isObjectLiteralExpression(element)) {
            for (const property of element.properties) {
              if (ts.isPropertyAssignment(property)) {
                // Assignment is intentional: it models JavaScript's last-property-wins behavior.
                record[property.name.getText(source).replaceAll(/['"]/g, "")] = value(property.initializer);
              }
            }
          }
          return record;
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  if (!records) throw new Error(`Could not read ${variableName} from ${file}`);
  return records;
}

function readAliases() {
  const source = readFileSync(`${root}/data/homes.ts`, "utf8");
  const match = source.match(/export const legacyHomeSlugAliases[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!match) throw new Error("Could not read legacyHomeSlugAliases");
  return Object.fromEntries(Array.from(match[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g), (item) => [item[1], item[2]]));
}

const normalize = (value) => String(value ?? "").toLowerCase().replaceAll(/[^a-z0-9]/g, "");
const display = readArray("data/homes.ts", "displaySeeds");
const lineup = readArray("data/homes.ts", "knownLineupSeeds");
const generated = readArray("data/catalogHomeSeeds.ts", "catalogHomeSeeds");
const aliases = readAliases();
const curated = [...display, ...lineup];
const seenKeys = new Set(curated.flatMap((home) => [home.name, home.displayName, home.slug, home.modelNumber].map(normalize)).filter(Boolean));
const catalog = [];

for (const home of generated) {
  if (aliases[home.slug]) continue;
  const keys = [home.name, home.displayName, home.slug, home.modelNumber].map(normalize).filter(Boolean);
  if (keys.some((key) => seenKeys.has(key))) continue;
  keys.forEach((key) => seenKeys.add(key));
  catalog.push(home);
}

const publicHomes = [...curated, ...catalog].map((home) => ({ ...home, id: home.slug }));

function duplicatesBy(keyFor) {
  const groups = new Map();
  for (const home of publicHomes) {
    const key = keyFor(home);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), home]);
  }
  return [...groups.entries()].filter(([, homes]) => homes.length > 1);
}

for (const field of ["slug", "id"]) {
  for (const [key, homes] of duplicatesBy((home) => normalize(home[field]))) {
    failures.push(`duplicate ${field} ${key}: ${homes.map((home) => home.name).join(", ")}`);
  }
}

for (const [key, homes] of duplicatesBy((home) => {
  const manufacturer = normalize(home.manufacturer);
  const model = normalize(home.modelNumber);
  return manufacturer && model ? `${manufacturer}:${model}` : null;
})) {
  failures.push(`duplicate manufacturer/model identity ${key}: ${homes.map((home) => home.slug).join(", ")}`);
}

for (const home of publicHomes) {
  if (!home.slug || !home.name) failures.push(`missing required name/slug in ${home.source}`);
  if (!home.manufacturer || !home.modelNumber) reviews.push(`${home.slug}: manufacturer/model identity incomplete`);
}

for (const [oldSlug, canonicalSlug] of Object.entries(aliases)) {
  if (!generated.some((home) => home.slug === oldSlug)) failures.push(`alias source is not a generated home: ${oldSlug}`);
  if (!curated.some((home) => home.slug === canonicalSlug)) failures.push(`alias target is not a curated home: ${canonicalSlug}`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`✗ ${failure}`));
  process.exit(1);
}

console.log(`✓ ${publicHomes.length} public homes have unique slugs and IDs`);
console.log("✓ manufacturer/model identities are unique when both fields are available");
console.log(`⚑ ${reviews.length} generated records have incomplete identity and require review (not automatically removed)`);
