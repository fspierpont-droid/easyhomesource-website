# Public Home Catalog Audit

## Overview

This document tracks the state of the public home catalog for Easy HomeSource. It is used to coordinate media assignments, pricing verification, and spec completion across the public website.

## Catalog Tracker

| Home Name | Photos | Floor Plan | Specs | Price | Sq Ft | Dimensions | Manufacturer | Model # | Video | Virtual Tour | Status | Notes |
|-----------|--------|------------|-------|-------|-------|------------|--------------|---------|-------|--------------|--------|-------|
| Maple | Known | Known | Known | Known | Known | Known | Known | Known | Known | Known | On display | Media approved |
| White Oak | Known | Known | Known | Known | Known | Known | Known | Known | Known | Known | On display | Media approved |
| Delilah | Known | Known | Known | Known | Known | Known | Known | Known | Known | Known | On display | Media approved |
| Craft Select 28603A | Known | Known | Known | Known | Known | Known | Known | Known | Known | Missing | On display | Media approved |
| Select S-1272-32A | Missing | Known | Known | Known | Known | Known | Known | Known | Missing | Missing | Catalog/orderable | Pending EHS approval |
| Boujee 2 | Known | Known | Known | Known | Known | Known | Known | Known | Missing | Missing | Catalog/orderable | Media assigned in Round 2 |
| Timberland | Missing | Missing | Known | Known | Known | Known | Known | Known | Missing | Missing | Catalog/orderable | Pending EHS approval |
| Craft Select 15663A | Missing | Known | Known | Known | Known | Known | Known | Known | Missing | Missing | Catalog/orderable | Floorplan assigned in Round 2 |
| Creekside Series | Missing | Missing | Known | Known | Known | Known | Known | Known | Missing | Missing | Catalog/orderable | Pending EHS approval |

## Media Assignment Round 1

- Assigned manufacturer media for Tulip and Craft Select models via `tulipManufacturerMedia.ts` and `craftSelectManufacturerMedia.ts`.
- Scraped and assigned media for Maple, White Oak, and Delilah via `scrapedHomeDetails.generated.ts`.

## Media Assignment Round 2

### Media assigned in this PR

- **Boujee 2** — Assigned 1 floor plan and 16 interior photos from existing local assets in `public/homes/boujee-2/floorplan/`. The assets were previously imported from the manufacturer page for model `44BOU28603BH` but were unassigned because the generated manual map miscategorized all items as `floorplan`. The new `boujee2ManufacturerMedia.ts` manifest corrects categorization and makes the media available to the public catalog and detail page.
- **Craft Select 15663A** — Assigned 1 floor plan from existing local asset `public/homes/craft-select-15663a/floorplan/craft-select-15663a-floorplan-01.jpg`. The filename and path clearly match the model; no other model-specific media exists for this record.

### Homes already verified with media (no change needed)

- **Craft Select 28603A** — Already has assigned exterior, kitchen, and floorplan media via `craftSelectManufacturerMedia.ts`. The prior audit incorrectly listed this as missing photos.
- **Delilah** — Already has full gallery (exterior, interior, kitchen, bedroom, bathroom, utility, floorplan) plus Matterport virtual tour via `scrapedHomeDetails.generated.ts`.
- **Maple** — Already has full gallery plus floorplan via `scrapedHomeDetails.generated.ts`.
- **White Oak** — Already has full gallery plus floorplan and Matterport virtual tour via `scrapedHomeDetails.generated.ts`.

### Homes still missing photos

- Select S-1272-32A (floorplan available via catalog manifest; no model photos found)
- Craft Select 15663A (floorplan now assigned; no model photos found)
- Timberland (no local assets or verified manifests)
- Creekside Series (no local assets or verified manifests)

### Homes still missing floorplans

- Timberland
- Creekside Series

### Homes still missing videos

- All 28 public homes currently use the safe **Video walkthrough coming soon** state.

### Ambiguous media requiring Scott/EHS review

- **Boujee 2 interior photo categories are unverified.** The 16 photos assigned as `interior` were sourced from a manufacturer floorplan directory and their exact room content (kitchen, bedroom, bathroom, etc.) has not been visually confirmed. Re-categorization is welcome once reviewed.
- **Boujee 2 video/Matterport tour not assigned.** The manual map contains a Matterport thumb and embed URL for Boujee 2. These were not assigned because the embed URL requires verification that it is the approved public tour for this model.
- **Craft Select 15663A manual map entry is for 15763A, not 15663A.** The generated manual map points to `https://.../cavco-select/15763a/` with a 15763A floorplan. This entry was rejected as ambiguous. The floorplan assigned in this PR comes from a separate local file with the correct `15663a` naming.
- **No filename, folder, manifest entry, or reviewed slug/model mapping was found for Timberland or Creekside Series.** Media for those records needs model-specific assets and EHS approval before assignment.
