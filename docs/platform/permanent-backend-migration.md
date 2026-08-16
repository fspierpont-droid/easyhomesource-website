# Easy HomeSource Permanent Platform Migration

## Objective

`easyhomesource-website` becomes the permanent Easy HomeSource public website and employee portal. The current `EHS` repository, `ehs-staging` frontend, existing backend deployment, and existing database remain operational during migration and are treated as the source system until cutover is explicitly approved.

This is a **copy-and-verify migration**, not a move-in-place migration.

## Non-negotiable safety rules

1. Do not delete, rename, overwrite, or repurpose the current EHS database during migration.
2. Do not point the new permanent backend at the current EHS database as its long-term datastore.
3. Do not reset employee passwords. Copy the existing bcrypt `password_hash` values unchanged.
4. Do not seed default employee passwords into the permanent database.
5. Do not expose MongoDB URIs, JWT secrets, GHL credentials, API keys, or employee credentials in Git, logs, screenshots, PR text, or chat.
6. Do not retire the old portal or Trove until the new platform has passed the cutover gates in this document.
7. Never claim that a UI action persisted or synchronized data unless the corresponding server operation completed successfully.

## UX preservation contract

The **current `easyhomesource-website` portal experience is the permanent frontend standard**.

The migration must preserve its current visual language, navigation model, responsive behavior, workflow structure, interaction patterns, spacing, page composition, and overall operating feel unless a specific UI change is separately approved.

The old `EHS` frontend is a functional reference only. It must **not** replace or visually overwrite the new portal.

When old EHS functionality is migrated:

- reuse the proven business logic, data model, security controls, and backend behavior;
- adapt that capability to the existing new-portal component and interaction system;
- do not copy legacy pages merely because they already exist;
- do not reintroduce old dashboards, navigation, forms, styling, or workflow friction;
- do not change a working new-portal screen just to make backend migration easier;
- treat visual or workflow regressions as migration defects.

The default implementation principle is therefore **new frontend + proven backend**, not old frontend + new hosting.

## Target architecture

```text
Public traffic / employees
          |
          v
 easyhomesource-website
     Next.js / Vercel
          |
          v
   easyhomesource-api
      Python / Render
          |
          v
 easyhomesource_production
        MongoDB

CRM-owned records <----> GoHighLevel
```

The old EHS system remains separate and operational until final retirement.

## System ownership

### Permanent EHS backend owns

- employee identity and individual password hashes;
- employee roles and access control;
- quote persistence and EHS quote/pricing logic;
- home catalog and on-lot home inventory;
- properties / land-home package inventory;
- secure operational files and metadata;
- EHS-specific settings, audit records, and operational workflow that is not CRM-owned.

### GoHighLevel owns

- CRM contacts;
- leads;
- opportunities/pipeline state;
- CRM communication and marketing automation;
- CRM-side assignment and lifecycle state.

### Next.js website owns

- public Easy HomeSource experience;
- the permanent employee portal UI/UX and design language;
- portal navigation, responsive behavior, and interaction model;
- server-side orchestration between browser, EHS backend, and GHL;
- secure website session after EHS credential verification.

## Migration phases

### Phase A — Permanent backend bootstrap

- [x] Create isolated migration branch from corrected per-user authentication branch.
- [x] Add a production-oriented Python backend under `/backend`.
- [x] Preserve bcrypt compatibility with existing EHS employee password hashes.
- [x] Remove all default/staging employee seed credentials from the new backend design.
- [x] Add database-backed employee administration endpoints.
- [x] Add health endpoint and hardened response headers.
- [x] Add isolated Render Blueprint with auto-deploy disabled.
- [x] Add backend compile/auth CI.
- [x] Add read-only database-copy verifier.

### Phase B — Business module port

Port from the working EHS backend only after dependency review:

- [ ] quote models and persistence;
- [ ] quote pricing engine and PDF generation;
- [ ] customer records needed by quoting;
- [ ] home catalog persistence;
- [ ] on-lot home inventory and secure documents;
- [ ] property inventory and public-safe projection;
- [ ] key contacts and EHS operational settings;
- [ ] required audit/security controls.

Do not port legacy CRM ownership that is now assigned to GHL unless it is required as an integration adapter.

Do not port the old EHS frontend. All migrated functions must be presented through the current `easyhomesource-website` portal UX.

### Phase C — New database creation and copy

Create a new database named `easyhomesource_production` (or an explicitly approved equivalent).

Database copy must be performed outside the running application with MongoDB database tools or an equivalent controlled Atlas migration mechanism. The application does not contain a startup migration that copies production records.

Copy source data while the old EHS system remains online. Preserve identifiers and password hashes.

After the copy, run:

```bash
python backend/scripts/verify_database_copy.py
```

with source and destination credentials supplied only through environment variables:

- `SOURCE_MONGO_URL`
- `SOURCE_DB_NAME`
- `DEST_MONGO_URL`
- `DEST_DB_NAME`

The verifier is read-only and checks critical collection counts plus employee ID/email/password-hash preservation.

### Phase D — Website integration

Keep the existing portal screens and replace only temporary website implementations with permanent backend calls:

| Website area | Temporary behavior to remove | Permanent source |
| --- | --- | --- |
| Login | old shared/browser models | permanent EHS backend users |
| Quotes | `INITIAL_SAVED_QUOTES` / server memory | permanent `quotes` collection |
| Properties | website memory/prototype storage | permanent `properties` collection |
| Users & roles | React-only/static team mutations | `/api/auth/users` |
| Catalog/settings | browser/local-only edits | permanent backend collections |
| GHL sync button | simulated success message | actual GHL operation/result |
| Dashboard counts | hardcoded/fallback totals | source-system queries |

Backend replacement must be behaviorally transparent wherever the current portal UX is already correct. A successful migration should make the existing portal more reliable and persistent without making it feel like a different application.

### Phase E — Data synchronization window

Because the old system remains live while the new system is being built, a single early database copy is not the final cutover copy.

Before cutover:

1. take a fresh final source snapshot/copy;
2. reconcile records created or changed after the earlier migration copy;
3. rerun database verification;
4. run application-level smoke tests against the final destination data;
5. establish a short controlled write-freeze only if required for final delta reconciliation.

No data written to the old system during the migration window should silently disappear from the new platform.

## Cutover gates

Do not retire Trove or the old EHS portal until all applicable gates pass.

### Identity/security

- [ ] Existing employee email + existing personal password works on the new system.
- [ ] Wrong password is rejected generically.
- [ ] Deactivated users cannot authenticate.
- [ ] Admin/Manager/Associate permissions are verified.
- [ ] No plaintext/default employee credentials exist in the permanent repository.
- [ ] No unauthenticated internal quote/property/file endpoint is exposed.

### Data

- [ ] Critical collection counts reconcile.
- [ ] Employee IDs and bcrypt password hashes match the source copy.
- [ ] Quotes open with correct customers, prices, and totals.
- [ ] Home catalog and on-lot inventory reconcile.
- [ ] Property records reconcile.
- [ ] Secure inventory documents are present and downloadable by authorized users.

### Workflow

- [ ] Quote create/edit/save/reload works after a backend restart/deploy.
- [ ] Quote PDF uses persisted quote data.
- [ ] Property create/edit/archive/public visibility works.
- [ ] Employee user management persists through the backend.
- [ ] Website lead form creates/updates the intended GHL records and preserves consent metadata.
- [ ] GHL project/CRM displays are sourced from GHL rather than placeholder records.
- [ ] Existing new-portal workflows remain at least as fast and clear as they are before migration.

### Portal UX regression gate

- [ ] Existing portal navigation remains intact.
- [ ] Existing page hierarchy and interaction patterns remain intact unless explicitly approved.
- [ ] Desktop layouts remain visually consistent with the current portal.
- [ ] Mobile layouts remain visually consistent and usable.
- [ ] Existing loading, empty, success, and error states are preserved or improved.
- [ ] No migrated feature falls back to an old EHS frontend screen or visual pattern.
- [ ] Backend failures produce controlled portal errors rather than broken pages or fake success states.

### Public website

- [ ] Public home/catalog pages are approved.
- [ ] Land/home package pages are approved.
- [ ] Forms and phone/contact CTAs work.
- [ ] Mobile and desktop QA pass.
- [ ] Redirect/SEO/domain cutover plan from Trove is approved.

## Retirement

Retiring `ehs-staging` is the **last** backend/portal migration action, not the first. Keep the old environment available as a rollback reference until the permanent system has operated successfully through an agreed stabilization period.
