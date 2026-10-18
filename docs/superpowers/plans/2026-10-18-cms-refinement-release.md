# Dual CMS Refinement Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement the client-approved CMS/public refinements in both independent apps, verify security and publishing end to end, push GitHub and verify production before providing client links.

**Architecture:** Preserve the existing separate Vinext/Next car app and nested independent Next apartment app, their managed Supabase backend and exact first-login security. Independent app specialists implement their own UI/domain scopes concurrently; backend changes are site-scoped and backward compatible. Root coordinates official assets, integration review, real tests and publication.

**Tech Stack:** Existing React/Next/Vinext, plain existing CSS, node:test/tsx, Supabase Postgres/Auth/Storage/Edge. No framework replacement or new paid services.

**Spec:** ../../2026-10-18-CMS-REFINEMENTS.md, approved voice discussion and displayed dashboard mockups.

## Global Constraints

- User explicitly requested immediate implementation of the agreed batch on 18 October, after reviewing the written change list and mockups. Preserve the previously requested specialist-agent approach. Do not reopen design intake.
- No video/tour/hero-player/CMS-tour fields in this delivery.
- No client login reset, no temporary credential reprovisioning, no data/photograph replacement with mockup content, no destructive Git operations.
- Keep first-login change of BOTH credentials, save acknowledgment, revocation and return-to-login. No client/developer credentials in source, logs or browser JSON.
- Separate brands/accounts/catalogues/media; no shared public landing page.
- App specialists do not edit shared backend/migrations or each other's app; root alone integrates, commits, pushes and deploys.
- No completed client links before implementation, tests, targeted security review, push and production readiness are confirmed.

## Review Focus

- An abandoned add-listing wizard must not insert a record or mutate revision.
- Legacy stored photos lack new label fields; neither existing catalogue may become invalid.
- A failed/retried batch upload must not duplicate a gallery item or silently change cover/order.
- Browser storage may be malformed, full or unavailable; public navigation must still work.
- Anonymous event endpoints must not permit cross-site writes, user-supplied counts, private listing disclosure or a denial-of-service path.

## Task 1: Backward-compatible backend contracts and honest activity metrics

**Owner:** Debugging agent. **Files:** `shared-cms/{core,validation,repository}.mjs`, `supabase/functions/dual-cms/index.ts` only if necessary, new migration under `supabase/migrations/`, `tests/dual-cms.test.mjs` and focused new tests.

**Interfaces:** Car availability accepts `Unavailable` in addition to the existing enum. Car `restockExpected?: boolean` defaults false for old catalogues. Apartment photo `label?: string` is optional, max 100 characters, and must not reject old photos. No tour fields. For activity, add `trackChat` public action accepting only a bounded published `listingSlug` or empty general context; site derives from the app BFF. Counts are server-incremented aggregate chat-button actions, not unique people/messages/bookings. Add authenticated `metrics` action returning `{total:number, byListing:Array<{listingSlug:string,count:number}>}`. If a new table/RPC is used it is deny-all RLS/browser grants revoked and service-only invoker execution, consistent with existing backend; document SQL and never deploy unreviewed.

- [ ] Write and run RED tests for legacy catalogues, wrong restock types, optional labels, publication/stock independence, setup denial and cross-site replay on metrics.
- [ ] Write RED tests for anonymous event validation, published-only listing identifiers, supplied-count rejection, bounded/rate-limited bodies and aggregate site isolation.
- [ ] Implement minimal backward-compatible contracts and aggregate repository/action logic; never store browser identities or full IP addresses for these metrics.
- [ ] GREEN focused backend suite, full root suite, syntax/reproducibility checks. Return migration and deployment instructions to root; do not run remote writes/deploy or touch credentials/Git.

## Task 2: Chida client-facing CMS and public refinements

**Owner:** UI/UX designer. **Files:** `components/cms-auth.tsx`, `components/cms-dashboard.tsx` and focused extracted CMS components/helpers, root `lib/cms/model.ts`, `lib/vehicles.ts` as needed, `components/vehicle-card.tsx`, `app/vehicles/[slug]/page.tsx`, root public layout/client components/CSS, tests. Own root app BFF `/api/chat-clicks` and `/api/admin/metrics` using the backend interfaces above; do not edit shared backend.

**Interfaces:** Detached wizard state persisted only on explicit Save draft/Publish using existing revision-protected content BFF. `restockExpected` optional false; `Unavailable` supported. Media uses existing single-file secure endpoint through a real batch queue. Use actual browser image decoding/canvas compression/orientation and resize (no claimed server transformation), output max long edge 1920, no upscale, reject grossly oversized decoded input, warn low-resolution and ensure output <=3 MB. Crop preview may bake an adjusted crop into a new optimized file, preserving existing originals; don't silently stretch. Fixed display frame geometry remains independent of uploaded dimensions. Labels/cover/order persist in the existing gallery contract.

- [ ] RED tests: wizard open/cancel has zero persistence, save creates exactly one record, publication explicit; media order/cover/label/retry; malformed history; once/session dismissal; stock/publication separation; setup auth regressions and metrics BFF origin/site restrictions.
- [ ] Implement approved light ivory/stone/gold sidebar/overview/list/wizard dashboard, not a JSON editor or a long immediate-create form. Preserve website settings/enquiries/activity/media/backup functions.
- [ ] Implement compact branded login/credential forms with accessible visibility toggles, validation and existing exact rotation/sign-out behavior.
- [ ] Implement real image normalization and editable batch previews. Show actual per-file status/progress, not fabricated completion.
- [ ] Public available vehicles have no Available badge. Sold/Unavailable remain published unless deliberately archived; source-similar enquiry stays available. Available soon appears only when `restockExpected=true`.
- [ ] Browser-local recently viewed row excludes current/unpublished records, is bounded and clearable. Public-only WhatsApp button/prompt is dismissible once/session, contextual, nonblocking and never claims online status. Track actual chat clicks independently of whether logging succeeds; no auto-open/send.
- [ ] GREEN focused tests, full root tests, typecheck, Vinext/Next compatibility builds and desktop/mobile/keyboard QA; report exact checks and any limitations. No Git/deploy/credential changes.

## Task 3: Independent apartment CMS and public refinements

**Owner:** Workflow manager. **Files:** nested `boujeelux-apartments/components/{admin,catalog,auth-forms,public-pages,site}.tsx`, focused extracted helpers/components, `lib/domain.ts`, public/admin layouts, CSS, tests; matching app BFF chat-clicks/metrics routes. Root supplies production brand asset paths. No tour/video additions.

**Interfaces:** Optional `Photo.label`, legacy compatibility, detached apartment factory and explicit final `createDraft(apartment)` instead of immediate `add()` persistence. Existing rental availability enum stays unchanged. Use backend `trackChat` and `metrics` with site hardwired to `boujeelux`; never caller-controlled. Keep original real property photos and scope warnings. New normalized uploads follow Task 2's actual image-processing limits, implemented inside this independent app, not a cross-React shared component import.

- [ ] RED tests: legacy unlabeled photos, wizard cancel/save/publish, batch partial failures, history storage failures, reminder route/session gating, first-login rotation regressions and BFF permissions.
- [ ] Implement approved forest-sidebar/cream/gold structured dashboard, compact branded auth forms, guided transient listing/photos/review workflow and real image preprocessing.
- [ ] Implement apartment-specific recently viewed and public WhatsApp reminder, rental availability controls, truthful metrics; no Sold badge or booking engine.
- [ ] Use official compact root-supplied logo assets in CMS and public navigation/footer, enforcing size limits. Refine public spacing/surface hierarchy subtly without changing approved imagery, pages or branding.
- [ ] GREEN focused/full nested tests, typecheck/build, browser desktop/mobile/keyboard/CRUD checks. Original external apartment copy remains preserved; root mirrors verified final source. No Git/deploy/credential changes.

## Task 4: Official logos, integration, security and production handoff

**Owner:** Root. **Files:** production assets in each app's `public/brand`, verification scripts/report, plan/ledger; integration corrections only after observed failing tests.

- [ ] Prepare compact official Boujee Lux individual lockup/emblem from supplied JPEG (not whole board), transparent where appropriate; visually verify lettering/artwork. Keep existing official Chida assets. No mockup raster is shipped as an app dashboard or property photograph.
- [ ] Review all three scopes and shared interfaces. Apply reviewed migration/Edge changes only to the approved Supabase project; preserve all client accounts and current catalogues.
- [ ] Run both complete suites/typechecks/production builds plus targeted security review: anonymous/setup denial, auth rotation/revocation, CSRF, site isolation, XSS/URLs, media signatures/byte limits, event abuse, draft privacy and revision conflicts. Use separate QA identities; never rotate real client credentials for a test.
- [ ] Real BFF tests for add/edit/draft/publish/unpublish/media across both apps; restore catalogue after tests, disable QA accounts and revoke QA sessions. Verify public link/image crawl and robots/sitemap/canonical/noindex behavior.
- [ ] Browser-test both production candidates: navigation, mobile layout, login visibility/feedback, transient wizard, image views, stock labels, recent history and reminder dismissal; inspect console for errors.
- [ ] Audit known production/toolchain dependency notices honestly; no exhaustive cyber-safety guarantee and no unauthorized paid upgrade.
- [ ] Commit reviewed source, secret-scan staged files, push requested GitHub main without force, verify both Vercel deployments READY and Chida Sites if retained. Recheck live routes/CMS guards/media and publishing behavior before client handoff.
- [ ] Provide final report and only then provide both public/CMS links, with actual remaining limitations clearly stated.

## Execution ledger

- Preparation complete: approved mockups and written refinement scope; user explicitly requested immediate coding. Only documentation existed before this plan.
- Video excluded and propagated to both app/backend specialists.
- Existing Instagram handle is Boujeelux24. Additional profiles are deferred, not guessed. The public profile's automated fetch was throttled; do not claim verified ownership or that every external service was reachable.
