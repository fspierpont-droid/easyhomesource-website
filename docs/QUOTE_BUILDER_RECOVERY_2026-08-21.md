# Quote Builder Recovery — 2026-08-21

## Scope

This recovery corrects three production gaps found during live quote QA without changing the historical quote archive, GHL CRM behavior, or Master Quote 5 core economics.

1. New Quote and Edit Quote now use the same quote builder.
2. Delivery no longer silently returns zero when an address cannot be routed.
3. Dedicated A/C, water/well, sewer/septic, electric-panel and dirt-pad controls are restored.
4. Browser Save-as-PDF printing is compacted for Letter paper while the normal on-screen proposal remains unchanged.

## Delivery

The permanent API exposes `POST /api/delivery-calculator/estimate`.

- If `GOOGLE_MAPS_API_KEY` or `GOOGLE_DISTANCE_MATRIX_API_KEY` is configured on Render, driving distance comes from Google Distance Matrix.
- If Google is unavailable, a confirmed manual-mile value is accepted as a fallback.
- If neither a route nor manual miles is available for dealership-to-customer delivery, the API fails loudly instead of returning `$0`.
- Factory routes preserve the verified Master Quote 5 baseline of $6,000 cost / $6,600 customer price per transported section even when route mileage is unavailable.

## Site systems

The builder uses the existing Master Quote 5 pricing bridge. Opening an existing quote does not automatically reset or reprice matching saved service lines. A line is replaced only when the user intentionally changes the associated system selection.

Larger septic systems are not assigned an invented price. The verified 900-gallon table package may be used automatically; larger recommended systems require a confirmed custom price before saving.

## Print

The existing customer proposal screen remains the screen view. Print CSS removes screen-card minimum page heights and forced page breaks, uses Letter paper margins, preserves print colors, and allows the browser to paginate the proposal naturally.
