# Master Quote 5 Pricing Source Contract

## Authority

- **Authoritative source:** `Copy of QS Master Quote Template` / Master Quote 5.
- **Historical comparison only:** `Copy of ALEX TEST`.
- Portal prices and formulas must not be averaged across versions. Master Quote 5 wins when values differ.

## Home catalog

Master Quote 5 contains 379 manufacturer/model rows. The portal deliberately excludes:

- Skyline Ocala
- Champion Lake City
- Clayton Russellville

After those exclusions, 225 approved manufacturer/model rows remain. The portal catalog must reconcile to exactly those 225 rows, with no duplicate manufacturer+model identities.

Existing portal IDs, display metadata, and product mappings are retained where the manufacturer+model identity matches; HUD Base Price, Est. Factory Cost, MSRP, EHS HUD Price, and Starting Price are reconciled to Master Quote 5.

## Home pricing constants

- Material surcharge: $2,000
- State/Association dues: $200 per floor/section
- MHI dues: $35 per home
- Sales tax: 3%
- WZ3 upgrade: $2,500
- Modular on-frame fee: $5,000
- Modular off-frame fee: $12,000
- Admin fee: 5% of home gross margin
- EHS loan fee: $1,000 when EHS loan officer is used
- Sales commission: 20% of gross margin after admin and applicable loan fee
- Home take-home floor: $20,000
- MSRP factor: 15%
- Curve multiplier: 0.454
- Pricing multiplier: 85

EHS home-price formula:

`Unit Factory Cost * (MAX(27368 / Unit Factory Cost, 85 * Unit Factory Cost^-0.454) + 1)`

## Site/service rules

- No dirt loads are free or silently included.
- Dirt Pad is an explicit paid 1-20 load selection using the Master Quote 5 tier table.
- Block/Tie-Down is calculated from home section class and length.
- Trim is calculated by section class.
- Basic Valor skirting uses actual perimeter linear feet at $8 cost / $10 customer price per foot.
- Delivery uses actual route inputs. No fake/default 32-mile route is allowed.
- Dealer-to-customer delivery: $800 base per transported section + $250 per escort; miles over 50 add $8.50 per truck-mile plus $2 per escort-mile.
- Factory route baseline: $6,000 cost / $6,600 price per transported section.
- Electric pole/panel and hookup work must be selected as the actual Master Quote 5 component(s), not a sample combined total.
- Well drilling, hookups, and electric are separate components.
- Septic base verified in source: 900-gallon tank + 375 sq ft drain field = $6,500 cost / $7,150 price. Drops and demolition are separate add-ons.
- Master Quote 5 provides minimum septic sizing logic but does not provide a verified incremental base price for 1,050- or 1,200-gallon systems. Those larger-system prices must be verified/custom-priced rather than invented.
- Driveway, deck, porch, landscaping, and other source-marked bid items stay bid/custom-price items.

## Fail-closed validation

The portal build fails if:

- the approved catalog is not exactly 225 rows;
- a manufacturer+model duplicate exists;
- an excluded manufacturer appears;
- an allowed Master Quote 5 model fails to reconcile;
- known Master Quote 5 pricing examples drift (dirt tiers, block/tie, skirting, trim, or the sample home-profit calculation).
