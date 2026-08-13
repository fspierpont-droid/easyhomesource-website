# Portal CRM and project data-source audit

Audit date: 2026-08-13. Scope: `/portal`, its portal components, and portal API routes.

## Provenance findings

| File (before remediation) | Variable/function | Data type | Where used | Environment | Safe to remove? | Authoritative replacement |
| --- | --- | --- | --- | --- | --- | --- |
| `components/portal/ReadyToQuoteView.tsx` | `DEFAULT_READY_BUYERS` | Four hard-coded realistic buyer records | Initial render and every empty/error API response | Production | Yes; demonstrably static fabricated fallback | GHL opportunity search filtered by the established ready checkbox or ready tags |
| `data/projectStore.ts` | `INITIAL_GHL_PROJECTS` | Eight hard-coded realistic project/customer records, values, stages, milestones, and coordinates | Project browser cache, server in-memory seed, map, Kanban, table, counters and totals | Production | Yes; IDs such as `ghl-opp-801` are synthetic and the records are source literals | GHL Project-Phase opportunities |
| `data/projectStore.ts` | `getStoredProjects` | Browser fallback/seed function | Project Board | Production | Keep only as a last-successful-response cache; never render it as an outage fallback | Successful GHL response only |
| `app/api/portal/projects/route.ts` | `inMemoryProjects`, `POST` defaults | Seeded server array plus fabricated webhook defaults | Legacy project API/webhook-like ingestion | Production | Disable; it accepts unauthenticated arbitrary input and manufactures missing identity, people, values, stages and coordinates | Authenticated GHL API reconciliation; a verified webhook receiver remains future work |
| `app/api/portal/projects/ghl-sync/route.ts` | `KNOWN_COORDINATES`, `CITY_COORDINATES`, mapper defaults | Address coordinate lookup plus fabricated CRM/project field defaults | GHL Project Board projection and map | Production | Yes | Exact fields returned by GHL; absent map coordinates produce no pin |
| `app/api/portal/ready-to-quote/ghl-sync/route.ts` | mapper defaults | Fabricated name, phone, email, budget, model and land-status fallbacks | Ready to Quote cards | Production | Yes | Exact GHL opportunity/contact/custom-field values |
| `app/api/portal/projects/ghl-sync/route.ts`, `app/api/portal/projects/update-stage/route.ts`, `app/api/portal/ready-to-quote/ghl-sync/route.ts` | token/location constants | Hard-coded credential and location fallbacks | Direct GHL API calls | Production | Yes, and required for secret hygiene | `GHL_API_KEY` and `GHL_LOCATION_ID` environment variables |
| `app/settings/page.tsx` | `handleSyncGhlLeads` timeout/result | UI-only simulated “14 leads imported” status | Portal settings import tab | Production | Yes, but outside the requested active Ready to Quote/Project views and not modified in this smallest safe patch | Real integration-status endpoint (future follow-up) |

Input placeholders in quote forms (for example “e.g.” field hints) are form affordances, not displayed CRM records. Quote route fallback data and quote PDFs are local quote-system concerns and were intentionally not deleted under the quote-preservation constraint. Home/property/catalog seeds are also outside CRM authority and were not modified.

## Ready to Quote

Before remediation, the four visible records were all `DEFAULT_READY_BUYERS`; none had stable GHL identity. A successful non-empty response replaced them with GHL data, but an empty or failed response restored all four demo records.

The established qualification rule is preserved: opportunity custom field `gHIjeANqYjpMcAKF6eIB` (“Lead ready for quote? / Send Lead To Quote System”) is checked **or** the contact has `quote_ready`, `send_to_quote_system`, or `ready_to_quote`. Results now retain contact, opportunity, pipeline, and stage IDs. Empty GHL results render an empty state; failures render a connection state.

## Project Board

Before remediation, all eight initial Board/Map/Kanban/Table records came from `INITIAL_GHL_PROJECTS`, not from verified GHL responses. A successful GHL fetch replaced them, but an empty/failure path and local storage could restore the seed. Project counters and financial totals consequently included fabricated records and values.

The intentional Project-Phase pipeline ID `W8RI4f1c9G72Fzn1LVlS` and its existing stage mapping are preserved. The live response count now controls every Board view and total. Missing fields are not fabricated, and opportunities without genuine coordinates are omitted from the map rather than assigned Central Florida coordinates.

## Existing integration architecture

The portal had three independent route-local direct GHL clients, each duplicating a personal integration token fallback and headers. The project reconciliation route searches opportunities in the Project-Phase pipeline and fetches users. Ready to Quote searches up to 100 opportunities and applies its checkbox/tag qualification rule. Stage update sends `PUT /opportunities/{id}`.

This patch centralizes credentials, request/error handling, opportunity search, and configuration in `lib/ghl/client.ts`. It intentionally preserves the direct LeadConnector API architecture rather than introducing a second backend.

## Inbound and outbound synchronization audit

Inbound synchronization was polling/reconciliation on page load and manual refresh. The legacy `POST /api/portal/projects` resembled a webhook receiver but had no webhook authentication, no canonical fetch, no persistent projection, no deduplication, and invented defaults; it was not a safe inbound sync mechanism and is disabled.

Outbound capability existed only for project stage changes. The UI optimistically wrote local storage before checking GHL, did not inspect non-2xx responses, and could leave false local state. Stage updates now require GHL success and then reconcile from GHL; failures retain the prior UI value and provide a retryable error.

## Remaining gaps to true two-way sync

1. There is no authenticated GHL webhook endpoint, signature verification, event subscription, or durable projection database.
2. There is no persistent idempotency/event ledger; reconciliation is idempotent by GHL opportunity ID and a canonical hash is supplied in projections, but hashes are not durably stored server-side.
3. Pagination beyond the current 100-opportunity GHL search response is not implemented.
4. Portal editing for contact name/phone/email/address, opportunity value, and assignee is not exposed, so only stage has an outbound path.
5. Contact details may require a canonical contact-by-ID request when opportunity search returns only a partial embedded contact.
6. Custom-field IDs other than the established fields remain only partially mapped.
7. The simulated GHL controls in portal Settings are not wired to connection state.

These gaps require authenticated webhook secrets and a durable datastore/schema that are not present in this repository. They should not be simulated with process memory or browser storage.

## Files modified in the safe implementation

- `lib/ghl/client.ts`
- `app/api/portal/projects/ghl-sync/route.ts`
- `app/api/portal/ready-to-quote/ghl-sync/route.ts`
- `app/api/portal/projects/update-stage/route.ts`
- `app/api/portal/projects/route.ts`
- `components/portal/ReadyToQuoteView.tsx`
- `components/portal/ProjectBoardView.tsx`
- `components/portal/ProjectMap.tsx`
- `data/projectStore.ts`
- `types/project.ts`
