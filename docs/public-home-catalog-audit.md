# Public home catalog audit

## Scope and result

- **Public data source:** `data/homes.ts` combines display-home records with the seeded online models in `data/catalogHomeSeeds.ts`. Media is resolved through `data/homeMedia.ts` from the reviewed generated manifests.
- **Public homes before this PR:** 23.
- **Public homes after this PR:** 28.
- `/homes` renders every active record and `app/homes/[slug]/page.tsx` statically generates a detail route for every public slug.
- This audit is limited to the public website. No quote portal, backend quote, authentication, pricing-engine, PDF, GHL import, inventory, or admin data is in scope.

## Homes added

- Boujee 2 (`boujee-2`)
~~- Timberland (`timberland`)~~ (Removed, custom build)
- Delilah (`delilah`)
- Craft Select 15663A (`craft-select-15663a`)
- Creekside Series (`creekside-series`)

These records intentionally expose only the lineup facts currently known to the public-site project. Unknown values use customer-facing placeholders rather than inferred prices, specifications, or media.

## Media Assignment Round 1

### Media assigned in this PR

- **None.** The repository audit did not find model-specific, approved media that can be safely assigned to any of the seven prioritized records. Existing assignments for the other public homes are unchanged.
- Craft Select 28603A and Select S-1272-32A retain their already-reviewed floor plans. Neither record has a clearly matched model photo in the current manifests or public asset folders.
- The five incomplete lineup records retain the **Photos coming soon**, **Floor plan coming soon**, and **Video walkthrough coming soon** states rather than receiving inferred media.

### Ambiguous media requiring Scott/EHS review

- **Boujee XL 2 assets must not be reused for Boujee 2.** `data/homeMedia.generated.ts` contains an exterior and floor plan explicitly mapped to `boujee-xl-2`; the similar name alone is not enough to approve either asset for `boujee-2`.
- **Atmos 28603N photography must not be reused for Craft Select 28603A.** The existing exterior is explicitly mapped to the Alpha Atmos 28603N source page, while Craft Select 28603A currently has only its model-specific floor plan and brochure mapping.
- **Craft Select 28603A has two references to the same floor-plan asset, but no photo candidate.** The display-home generated manifest and manufacturer manifest both identify `chsd69aabrr.jpeg` as a floor plan, not an exterior.
- **Select S-1272-32A has only a floor-plan candidate.** Its catalog manifest deliberately has no exterior path, so the floor plan must not be promoted as a model photo.
- **No filename, folder, manifest entry, or reviewed slug/model mapping was found for Timberland, Delilah, Craft Select 15663A, or Creekside Series.** Media for those records needs a model-specific asset and EHS approval before assignment.
- **The general Easy HomeSource promotional video is not a model walkthrough.** It remains site content and is not assigned to any home record.

Round 1 reviewed `data/homeMedia.ts`, `data/homes.ts`, `data/catalogHomeSeeds.ts`, the generated media manifests, manufacturer media manifests, import maps/reports, and `public/`. The `public/homes/` model folders contain placeholders only; no unassigned home photography or floor plans are stored there.

## Catalog completion gaps

### Missing verified starting prices

- Boujee 2
- Timberland
- Delilah
- Craft Select 15663A
- Creekside Series

### Missing complete specifications

- Boujee 2
- Timberland
- Delilah
- Craft Select 15663A
- Creekside Series

### Missing assigned model photos

- Craft Select 28603A (floor plan is available)
- Select S-1272-32A (floor plan is available)
- Boujee 2
- Timberland
- Delilah
- Craft Select 15663A
- Creekside Series

### Missing floor plans

- Boujee 2
- Timberland
- Delilah
- Craft Select 15663A
- Creekside Series

### Missing videos

- All 28 public homes currently use the safe **Video walkthrough coming soon** state.

## Catalog completion tracker

Use **Missing** only when no verified value or approved model-specific media is assigned. **Known** means the public record currently contains a value; it does not replace the final approval step. Keep customer-facing fields in their safe placeholder state until EHS marks the applicable item approved.

| Home | Starting price | Beds | Baths | Sq. ft. | Dimensions | Manufacturer | Model number | Photos | Floorplan | Video | Display / catalog status | Approval status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Boujee 2 | Missing | Missing | Missing | Missing | Missing | Known: Clayton Addison | Known: Boujee 2 | Missing | Missing | Missing | Catalog/orderable; confirm | Pending EHS approval |
| Timberland | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Catalog/orderable; confirm | Pending EHS approval |
| Delilah | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Catalog/orderable; confirm | Pending EHS approval |
| Craft Select 15663A | Missing | Missing | Missing | Missing | Missing | Known: Cavco Plant City | Known: 15663A | Missing | Missing | Missing | Catalog/orderable; confirm | Pending EHS approval |
| Creekside Series | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Missing | Catalog/orderable; confirm | Pending EHS approval |
| Craft Select 28603A | Known | Known | Known | Known | Known | Known | Known | Missing | Known | Missing | On display | Media approval pending |
| Select S-1272-32A | Known | Known | Known | Known | Known | Known | Known | Missing | Known | Missing | Catalog/orderable | Media approval pending |

## EHS approval needed

- Confirm starting prices for all five newly added lineup records.
- Confirm beds, baths, square footage, dimensions, and model numbers for the five incomplete records.
- Confirm the manufacturer for Timberland, Delilah, and Creekside Series.
- Confirm that Creekside Series should remain a single catalog entry, or provide the individual Creekside model names and facts.
- Approve and assign model-specific photography for the seven entries listed above; do not substitute stock photography.
- Approve and assign the five missing floor plans and any model-specific walkthrough videos.
- Confirm on-display versus orderable-catalog status for all newly added records.

## Developer verification checklist

- [ ] `/homes` shows 28 homes and filters by beds, baths, price, manufacturer, and display/catalog status.
- [ ] Every added slug loads its public detail page.
- [ ] Every card and detail page uses **Starting at $X** or **Call/Text for starting price**.
- [ ] Every missing photo and floor plan uses the approved coming-soon placeholder.
- [ ] Every public card quote CTA targets `/get-quote?home=[slug]`.
- [ ] No broken or unassigned image path is emitted.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
