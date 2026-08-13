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
| `components/portal/PropertyPackageManager.tsx` | `RAW_SAVED_QUOTES` / `FULL_SAVED_QUOTES` | Fifteen realistic-looking static quote records and derived totals | Unused dead constants; the active Quote Library reads `getSavedQuotes()` instead | Bundled in production but not rendered | Yes; no references and not part of the genuine quote store | None; genuine local quote-system data remains in `data/quotesStore.ts` |

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

### Production environment contract

The exhaustive source search found these GHL environment variables:

| Variable | Before this PR | Current use | Required in Vercel? |
| --- | --- | --- | --- |
| `GHL_API_KEY` | Read by all three portal GHL routes, with an unsafe source-code token fallback | Central server-only bearer token | **Yes** |
| `GHL_LOCATION_ID` | Read by the two reconciliation routes, with an unsafe source-code location fallback | Central server-only location ID | **Yes** |
| `GHL_PROJECT_PIPELINE_ID` | Not present | Optional override; defaults to the established Project-Phase ID | No, unless the production pipeline changes |
| `GHL_READY_FOR_QUOTE_FIELD_ID` | Not present | Optional override; defaults to the established checkbox field ID | No, unless the production field changes |
| `GHL_COUNTY_FIELD_ID` | Not present | Optional county custom-field mapping; absent values display `Not provided` | No |

No occurrences of `GHL_ACCESS_TOKEN`, `GHL_PRIVATE_INTEGRATION_TOKEN`, or `GHL_TOKEN` exist. The secret **names** required by the portal did not change. The behavior did: `GHL_API_KEY` and `GHL_LOCATION_ID` must now exist instead of silently using committed fallback credentials. Before merge, Vercel must be checked to confirm both established variables are configured in Production and Preview. The removed source token should be considered exposed and rotated in GHL.

### Exact qualification and mapping contracts

Ready to Quote uses no pipeline or stage criterion. An opportunity qualifies only when it has both stable opportunity/contact IDs and either (a) custom field `gHIjeANqYjpMcAKF6eIB` is truthy (`fieldValueBoolean`, boolean `field_value`, string `"true"`, or non-empty `fieldValueArray`) or (b) its embedded contact contains an exact case-insensitive tag `quote_ready`, `send_to_quote_system`, or `ready_to_quote`.

Every Project Board, Kanban, table, counter, total, and map input comes from pipeline `W8RI4f1c9G72Fzn1LVlS` (`Project-Phase`) and one of these established mapped stages:

| GHL stage ID | GHL/portal label | Portal stage |
| --- | --- | --- |
| `472ee180-a203-4c58-80fd-5a4c0e9db793` | Permitting & Engineering | `PERMITTING` |
| `04066448-fc52-4179-8461-a8a29119912a` | Site Prep & Infrastructure | `SITE_PREP` |
| `cf7f467f-dd5f-4d65-afea-bd32491d00e2` | Home Installation | `TRANSPORT_SET` |
| `4b7b4df4-5026-44e0-890a-1b475f21093b` | Inspections | `FINAL_INSPECTION` |
| `6b4b1901-fb78-48aa-a7ea-517bd7b87c81` | CO Issued / Handover | `COMPLETED` |
| `ebed22f5-8c69-4835-bb5e-e528ec2a4618` | Support Stage (Warranty) | `COMPLETED` |
| `3a7764dc-8da5-4f72-bad3-f082ead62bb8` | Support/Warranty Expired | `COMPLETED` |

Opportunities in another pipeline or an unmapped stage are excluded rather than assigned a fabricated portal stage. Monetary value maps only from `opportunity.monetaryValue`; missing values display `—` and contribute zero to the aggregate. Consultant identity maps `opportunity.assignedTo` through the GHL location users response. Contact ID comes from `opportunity.contactId`/embedded contact ID; embedded contact data is used directly and partial contacts are hydrated through `GET /contacts/{id}`. A failed optional user/contact hydration produces `Not provided` for missing fields, never a fabricated person.

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

### Field-level synchronization matrix

`Implemented` means the current portal code actually performs that direction. `Read-only` means GHL → Portal is implemented but this portal exposes no editor. No field is claimed as bidirectional except pipeline stage.

| GHL-owned field | GHL → Portal | Portal → GHL | Current implementation |
| --- | --- | --- | --- |
| First/last/full name | Implemented (full embedded/hydrated contact name) | Missing | Read-only; no CRM name editor |
| Phone | Implemented | Missing | Read-only; no CRM phone editor |
| Email | Implemented | Missing | Read-only; no CRM email editor |
| Address | Implemented | Missing | Read-only; custom project-site address then contact address |
| Assigned consultant | Implemented | Missing | Read-only; `assignedTo` resolved against GHL users |
| Opportunity name | Implemented | Missing | Read-only; used only as a name fallback when contact name is missing |
| Pipeline | Implemented | Missing | Read-only; Project Board filters the Project-Phase ID |
| Pipeline stage | Implemented | Implemented | Only truly bidirectional field; successful PUT is followed by reconciliation |
| Opportunity status | Implemented | Missing | Project projection retains status; no editor |
| Monetary value | Implemented | Missing | Read-only; maps exactly from `monetaryValue` |
| Relevant custom fields | Implemented (selected known fields) | Missing | Read-only; no custom-field editor |

The only GHL-owned editor in these views is the stage selector in the Project Board and Project Map. Search and consultant selectors are filters, and “Generate Master Quote” creates/edits portal-owned quote data; they are not CRM editors. Therefore contact name, phone, email, address, status, value, assignment, and custom-field outbound APIs would be unnecessary UI expansion in this PR.

### Inbound webhook status and loop protection

There is no authenticated GHL webhook endpoint in this repository for contact, opportunity, stage, or assignment events. Page-load/manual reconciliation is **not real-time two-way sync**. The disabled legacy POST route was unauthenticated fabrication-prone ingestion, not reusable webhook support. Current projections use stable IDs and provide `lastGhlSyncAt`, `lastGhlHash`, and `lastSyncSource`; however, without a durable projection/event ledger they cannot provide webhook idempotency. A future authenticated webhook must validate GHL authenticity, identify by stable ID, fetch/reconcile canonical GHL values, compare the canonical hash, and never call outbound GHL update APIs in response to the event. That design prevents a portal write followed by its GHL webhook from looping.

### Major deletion classification

| Deleted area | Classification | Integrity conclusion |
| --- | --- | --- |
| Four `DEFAULT_READY_BUYERS` | Demo/seed data | Correct removal |
| Fifteen unused `RAW_SAVED_QUOTES` / derived `FULL_SAVED_QUOTES` | Dead demo quote literals, not the active quote store | Correct removal; genuine `getSavedQuotes()` data remains intact |
| Eight `INITIAL_GHL_PROJECTS` and cache reseeding/update helper | Demo/seed data and unsafe local CRM mutation | Correct removal |
| Route-local headers/tokens/request boilerplate | Obsolete duplicate GHL client code | Replaced centrally; established IDs/mappings retained |
| Fabricated GHL projection defaults and coordinates | Production placeholder data | Correct removal |
| Legacy `/api/portal/projects` memory store and arbitrary POST defaults | Deprecated unsafe ingestion | Disabled; it was not authenticated or durable |
| Optional `ghlOpportunityId` and non-null coordinate assumptions | Obsolete types | Tightened identity and accurately nullable location data |

No quote data, calculations, saved customer quotes, property packages, home catalog, home inventory, genuine GHL records, established pipeline/stage IDs, or established custom-field IDs were deleted. The change removes source literals only and never calls a destructive GHL endpoint.

### Merge assessment

PR #48 is **not ready to be represented as a fully bidirectional or real-time GHL integration**. It is a production data-integrity correction with GHL reconciliation plus bidirectional stage updates. Before merge, maintainers must verify the two required variables in Vercel, rotate the exposed historical token, and exercise the real GHL paths listed below. Authenticated webhooks, durable idempotency, pagination, and outbound editors for currently read-only fields remain explicit missing capabilities. The UI now says reconciliation rather than “live” so it does not misrepresent polling as webhook sync.

Real-account tests could not be executed from the repository alone because no runtime GHL credentials or Vercel access are available. Required pre-merge checks are: a genuine ready record, a genuine mapped project with hydrated contact/user/value, a successful and rejected stage write, zero qualifying results, and an invalid/absent credential response. The build-level tests verify code paths and absence of demo fallback, not production account contents.

### Project map coordinate safety

The P1 root cause was a Leaflet marker call that used TypeScript non-null assertions on nullable GHL coordinates. The assertion affected types only; at runtime Leaflet could receive `[null, null]` and coerce a missing location toward Null Island. Project coordinates now pass a shared validator before marker construction. Both values must be actual finite numbers within latitude `[-90, 90]` and longitude `[-180, 180]`; null, undefined, strings, NaN, infinities, and out-of-range values are rejected without a fallback.

Any number of GHL project records—including all records in the view—can legitimately exist without coordinates. They remain in Project Board counters, Pipeline/Kanban, and Table views; only the map marker collection excludes them. The map header separately reports total filtered Project Jobs, Mapped jobs, and jobs that Need Location. Marker construction receives only validated numbers, so a missing coordinate can never generate a project pin at `0,0`, Brooksville, dealership headquarters, a county center, or any other fabricated location.

## Files modified in the safe implementation

- `lib/ghl/client.ts`
- `app/api/portal/projects/ghl-sync/route.ts`
- `app/api/portal/ready-to-quote/ghl-sync/route.ts`
- `app/api/portal/projects/update-stage/route.ts`
- `app/api/portal/projects/route.ts`
- `components/portal/ReadyToQuoteView.tsx`
- `components/portal/PropertyPackageManager.tsx`
- `components/portal/ProjectBoardView.tsx`
- `components/portal/ProjectMap.tsx`
- `data/projectStore.ts`
- `types/project.ts`
