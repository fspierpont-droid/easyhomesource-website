# Public home catalog audit

## Scope and result

- **Public data source:** `data/homes.ts` combines display-home records with the seeded online models in `data/catalogHomeSeeds.ts`. Media is resolved through `data/homeMedia.ts` from the reviewed generated manifests.
- **Public homes before this PR:** 23.
- **Public homes after this PR:** 28.
- `/homes` renders every active record and `app/homes/[slug]/page.tsx` statically generates a detail route for every public slug.
- This audit is limited to the public website. No quote portal, backend quote, authentication, pricing-engine, PDF, GHL import, inventory, or admin data is in scope.

## Homes added

- Boujee 2 (`boujee-2`)
- Timberland (`timberland`)
- Delilah (`delilah`)
- Craft Select 15663A (`craft-select-15663a`)
- Creekside Series (`creekside-series`)

These records intentionally expose only the lineup facts currently known to the public-site project. Unknown values use customer-facing placeholders rather than inferred prices, specifications, or media.

## Launch data gaps

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

## Scott / EHS approval needed before launch

- Confirm starting prices for all five newly added lineup records.
- Confirm beds, baths, square footage, dimensions, and model numbers for the five incomplete records.
- Confirm the manufacturer for Timberland, Delilah, and Creekside Series.
- Confirm that Creekside Series should remain a single catalog entry, or provide the individual Creekside model names and facts.
- Approve and assign model-specific photography for the seven entries listed above; do not substitute stock photography.
- Approve and assign the five missing floor plans and any model-specific walkthrough videos.
- Confirm on-display versus orderable-catalog status for all newly added records.
- Complete a final price and availability review immediately before Trove replacement/domain cutover.

## Developer verification checklist

- [ ] `/homes` shows 28 homes and filters by beds, baths, price, manufacturer, and display/catalog status.
- [ ] Every added slug loads its public detail page.
- [ ] Every card and detail page uses **Starting at $X** or **Call/Text for starting price**.
- [ ] Every missing photo and floor plan uses the approved coming-soon placeholder.
- [ ] Every public card quote CTA targets `/get-quote?home=[slug]`.
- [ ] No broken or unassigned image path is emitted.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
