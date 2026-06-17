# Browser-Assisted Trove Media Capture Guide

This workflow avoids Playwright and avoids sharing Trove admin credentials. You log into Trove normally in Chrome or Safari, capture only safe public media URLs/page metadata from the page, and then import those URLs from Termux or another shell.

## Security rules

- Never save cookies.
- Never save auth tokens.
- Never save request headers.
- Never save customer data.
- Never commit admin session files.
- Only save public media URLs and safe page metadata.
- Strip query parameters if they contain tokens or suspicious auth values.
- Review generated files before committing. Commit `public/homes/`, `data/homeMedia.generated.ts`, and `scripts/trove-media-manual-map.generated.json` only if they contain safe public media URLs and no credentials/tokens.

## Step 1: Log into Trove normally

Open Chrome or Safari and log into Trove as usual. Do not share credentials in code, chat, screenshots, captures, or commits.

## Step 2: Open a home page

Open one of these pages in the browser:

- A Trove admin catalog/home detail page.
- A public Trove home detail page.

If a home has a gallery/carousel, open or scroll through it first so lazy-loaded media has a chance to appear on the page.

## Step 3: Create and run the EHS Media Capture bookmarklet

1. Open `tools/trove-media-bookmarklet.min.txt` in the repo.
2. Copy the entire one-line text. It starts with `javascript:(()=>{`.
3. Create a new browser bookmark named `EHS Media Capture`.
4. Paste the copied one-line text into the bookmark URL/address field.
5. While viewing the Trove page, click the `EHS Media Capture` bookmark.

The script will try to copy JSON to your clipboard and will also open a new browser tab/window containing the JSON text so you can copy it manually if clipboard access fails.

## Step 4: Copy the JSON output

In the new `EHS Media Capture JSON` tab, select and copy the full JSON object from the textarea.

## Step 5: Save the capture JSON file

Save the copied JSON into:

```txt
imports/browser-captures/[home-slug].json
```

Examples:

```txt
imports/browser-captures/paxton.json
imports/browser-captures/dogwood.json
imports/browser-captures/tulip.json
```

Use the catalog slug as the filename when possible. The capture importer can also use a `slug` field in the JSON or page title/name matching, but the filename convention is the safest workflow.

## Step 6: Generate the manual media map

From Termux or your repo shell, run:

```sh
npm run capture:browser-media
```

This reads all JSON files in `imports/browser-captures/`, filters UI/logo/tracking assets, categorizes media, deduplicates URLs, and writes:

- `scripts/trove-media-manual-map.generated.json`
- `reports/browser-capture-media-report.md`
- `reports/browser-capture-media-report.json`

## Step 7: Review the capture report

Open and review:

```txt
reports/browser-capture-media-report.md
```

Confirm that each capture mapped to the correct home slug and that accepted media URLs are public media assets, not admin/session/customer URLs.

## Step 8: Import selected media into the website

Run:

```sh
npm run import:manual-media
```

This reads both manual maps when present:

- `scripts/trove-media-manual-map.json`
- `scripts/trove-media-manual-map.generated.json`

It downloads media into:

```txt
public/homes/[slug]/exterior/
public/homes/[slug]/interior/
public/homes/[slug]/kitchen/
public/homes/[slug]/bathroom/
public/homes/[slug]/bedroom/
public/homes/[slug]/floorplan/
public/homes/[slug]/brochure/
public/homes/[slug]/video/
public/homes/[slug]/other/
```

Then it updates:

```txt
data/homeMedia.generated.ts
```

## Step 9: Validate catalog media and protected data

Run:

```sh
npm run validate:catalog-media
```

Validation expectations:

- Paxton price remains `143185`.
- Tulip price remains `39888`.
- No unapproved home data changes.
- No CRM, quote system, GoHighLevel, design studio, customer portal, employee portal, property map, or quote/customer features are added.

## Step 10: Commit only safe media changes

Only commit these generated/media paths after review and only if they contain safe public media URLs and no credentials/tokens:

```txt
public/homes/
data/homeMedia.generated.ts
scripts/trove-media-manual-map.generated.json
```

Do not commit browser profiles, cookies, local storage exports, request headers, screenshots containing admin data, customer data, or admin session files.
