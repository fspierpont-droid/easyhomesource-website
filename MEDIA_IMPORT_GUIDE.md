# Trove Media Import Guide

This project includes a targeted importer for approved Easy HomeSource display homes only. It starts from `https://easyhomesource.com/homes`, finds approved home detail pages from `scripts/trove-media-allowlist.json`, extracts useful home media, and writes a generated media manifest for the catalog.

## Run the import

```bash
npm run import:trove-media
```

The importer creates the standard media folders under `public/homes/[home-slug]/` and writes `data/homeMedia.generated.ts`. It downloads only approved-home media candidates from detail pages matched by the allowlist.

## Add or correct a manual Trove detail URL

If automatic matching cannot find a home, edit `scripts/trove-media-allowlist.json` and add `troveDetailUrl`:

```json
{
  "name": "Paxton",
  "slug": "paxton",
  "troveName": "Paxton 28523A",
  "troveDetailUrl": "https://easyhomesource.com/homes/example-paxton-detail",
  "aliases": ["Paxton", "Paxton 28523A"]
}
```

Then rerun `npm run import:trove-media`.

## Where files are saved

Media is organized by approved home and category:

- `public/homes/[home-slug]/exterior/`
- `public/homes/[home-slug]/interior/`
- `public/homes/[home-slug]/kitchen/`
- `public/homes/[home-slug]/bathroom/`
- `public/homes/[home-slug]/bedroom/`
- `public/homes/[home-slug]/floorplan/`
- `public/homes/[home-slug]/brochure/`
- `public/homes/[home-slug]/video/`
- `public/homes/[home-slug]/other/`

Generated filenames follow the pattern `[home-slug]-[category]-01.[ext]`.

## Replace images with real EHS photos later

Replace the file in the relevant `public/homes/[slug]/[category]/` folder and update `data/homeMedia.generated.ts` only if the filename changes. Prefer keeping the same filename so catalog references remain stable.

## Add video or reel links manually

Add links to the relevant home entry in `data/homeMedia.generated.ts`:

- `videoUrl` for normal videos
- `virtualTourUrl` for Matterport or other tours

If the importer later finds approved Trove video links, it will populate these automatically.

## Add brochure PDFs manually

Place the PDF in `public/homes/[slug]/brochure/` using a clean filename such as `paxton-brochure-01.pdf`, then set the home entry `brochureUrl` in `data/homeMedia.generated.ts` to `/homes/paxton/brochure/paxton-brochure-01.pdf`.

## Validate catalog media

```bash
npm run validate:catalog-media
```

The validator checks that every approved home exists in the catalog, approved media folders exist, generated media paths point to real files, and the protected Paxton and Tulip prices remain unchanged.

## Safety notes

The importer intentionally excludes logos, favicons, social icons, BuildTrove badges, tracking pixels, tiny thumbnail variants, duplicate files, and media from homes that are not on the approved allowlist. If the public Trove site is unavailable, the importer writes an empty approved-home manifest and leaves catalog pages on their existing photo-coming-soon fallbacks.
