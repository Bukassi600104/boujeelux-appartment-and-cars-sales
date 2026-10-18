# Dual CMS refinement release — verification record

18 October 2026. This record distinguishes implemented source, local/live-backend checks, and the final frontend deployment gate. It is not a guarantee against every defect or cyberattack.

## Implemented in the two independent apps

- Compact, branded sign-in with approved official logos, contextual faint imagery, readable validation and show/hide password controls. The apartments website navigation/footer also use compact transparent approved artwork.
- Light Chida ivory/stone/gold dashboard; separate Boujeelux forest/cream/gold dashboard. Overview and listing navigation precede the editor; opening Add starts a detached Details → Photos → Review wizard and does not create a record.
- Batch image queues with individual states/retry, labels, cover selection, ordering and removal. Browser-side decode/orientation, bounded resizing, WebP compression and adjustable exported crops preserve the original input file. Existing listing uploads use the same normalization path. Public frames retain their dimensions regardless of uploaded dimensions.
- Car stock and publication are independent. Sold/Unavailable vehicles can remain visible with an enquiry for a similar vehicle; Available soon requires deliberate incoming-stock confirmation. Apartments retain rental availability, not Sold or a new booking engine.
- Browser-local, clearable recently viewed listings; contextual, dismissible WhatsApp assistance on public pages; recorded website chat-click totals in the corresponding authenticated CMS. Counts are not unique visitors, sent messages, sales or bookings.
- Existing pages, pricing, photographs, separate brands, SEO metadata, canonicals, structured data and sitemaps preserved. Video is explicitly excluded. No new unconfirmed social profiles or search-engine submission.

## Account and client handover safeguards

- Separate fresh setup-only client identities exist for each CMS. They cannot read dashboard content before replacing both username and password and acknowledging that the credentials must be saved securely.
- Successful replacement revokes the old session, clears the browser cookie and returns to sign-in. New credentials must be entered; there is no automatic dashboard access.
- Existing developer/support identities remain intact during client review, as requested. They are normal, documented, removable accounts, not hidden access. Remove them and revoke their sessions after client signoff, not before.
- Temporary credentials are stored only in the ignored, Windows-ACL-restricted `.cms-private/CLIENT-REVIEW-CMS-ACCESS.txt` and `client-handover.json`. They are not in this report, Git, build output or browser JSON. Do not send the older initial-test credential file to the client.
- Client setup was tested without consuming the client's credential replacement. Separate designated QA identities were used for destructive authentication tests and catalogue checks.

## Verification completed before frontend release

| Check | Observed result |
| --- | --- |
| Chida complete test suite | 82 passed, 0 failed, including dashboard branding/layout and common unsaved-editor guard regressions |
| Boujeelux complete test suite | 58 passed, 0 failed, including dashboard control contrast and mobile-navigation regressions |
| TypeScript checks | Both pass |
| ESLint error checks | Both pass; this does not assert zero warnings |
| Production builds | Chida Next and Vinext pass; apartments Next passes |
| Production-only dependency advisory audits | Zero known advisories in either app at the time checked |
| Exact first-login changes through each local BFF/live Edge | Both pass: setup-only denial, both credentials replaced, signed out, old session/credentials denied, new credentials accepted |
| Fresh client setup accounts | Both sign in only to setup; dashboard content denied; setup unconsumed; sessions signed out |
| Shared database checks | RLS, browser-role/RPC denial, atomic increments, bad-site/slug rejection, invalid-session denial; transactional test writes rolled back |
| CMS/public integration | Protected/site-isolated metrics, valid click reflection, malformed/origin/oversize rejection, Sold/restock/Unavailable reflection and hidden-price redaction pass; original catalogues restored |
| Existing car site regression | Settings, SEO, stale-revision denial, draft/publish/archive, service toggles, enquiries, detail routes and sitemap pass; catalogue restored |
| Car media regression | Signature rejection, upload/read, public detail/inventory/sitemap pass; catalogue restored |
| Apartment hosted-CMS smoke against local BFF/live Edge | 14 checks pass: protected auth, upload/read, draft, publish/edit/unpublish, detail/sitemap, enquiry closure and exact restore |
| Car public HTTP crawl | 14 pages, 14 internal links, 17 fragment targets, 102 rendered image URLs pass after catalogue tests restore data |
| Chrome sign-in visuals | Official compact logos, car image panel and faint apartment backdrop render; forms fit the desktop viewport |
| Original apartment checkout | 28 changed/new source files mirrored non-destructively; SHA-256 matches, existing local state/assets/dependencies retained |

HTTP smoke tests are not a substitute for interaction testing, cross-browser coverage or measured Core Web Vitals. No actual WhatsApp message was sent. Test-created public media is not a private/draft-media facility. Do not run the old reseeding QA command on client content.

## Security review and remediations

Completed standard source scan: `e4bfbcf7-f962-46b5-a391-90c481a261ba`, baseline `ac6b5a87076eda185b88bb23b5750fa9a20d0abb`. Independent architecture, baseline and focused reviews covered the 260 in-scope text sources (plus supporting files). No surviving reportable findings were retained after supported fixes were validated.

Fixed actual streamed JSON and multipart byte limits before parsing, explicit server-side save-credentials acknowledgement, consistent supported media extensions, and hidden numeric price leakage in both new public projections and legacy public-document reads. Private prices are preserved. Shared Edge function v6 is active in the approved Supabase project; the metrics migration is `20261018125911_cms_chat_metrics.sql` (verified matching SQL fingerprint, not replayed).

**Snapshot limitation:** the security tool warned that the working tree changed during the scan and its sealed result remains bound to its original snapshot. The report is not an immutable certification of the final release commit. The fixes and final source were additionally checked with current regression tests and review; the last apartment auth change was visual and received its own regression test. The sealed report has not been edited or relabelled.

The generated report is retained locally in the Codex Security scan directory under `C:/Users/USER/.codex/state/plugins/codex-security/scans/chida-moore-automobiles/`. Tool-reported measured usage: total 28,750,980 tokens; input 28,628,391 (27,700,864 cached); output 122,589; reasoning output 32,778; six rollout threads; coverage complete. These are the tool's reported counts, not a cost estimate.

## Operational limits and follow-up

- This is source review and scoped functional/security verification, not an external penetration test, uptime commitment or promise that no vulnerabilities exist.
- Supabase breached-password protection requires the provider's paid plan in the current project and remains unavailable; no paid upgrade was authorized. MFA and a new recovery/ownership system were not added. Client platform/domain ownership and recovery procedures still require handover planning.
- Production dependency advisories were checked; historical development-toolchain advisories are not claimed fixed through forced major upgrades.
- Aggregate clicks are bounded/rate-limited best-effort counts, not bot-proof attribution. Recently viewed records stay in the visitor's own browser.
- Existing Instagram uses the supplied Boujeelux24 handle. Automated profile requests were throttled; ownership and additional handles were not independently confirmed.
- Search readiness is present, but Google indexing, ChatGPT inclusion and rankings are not guaranteed or claimed submitted.
- Public media remains intentionally public, including media uploaded while editing a draft. Draft listing content remains private until publication.

## Deployment gate

## Additional client-review refinement batch

The later client review expanded the delivery beyond the first release recorded below. Both CMSs now have branded dashboards, persistent sidebars, real-data empty states, guided listing editors, visual galleries, separate account/history Settings, Super admin/Sub-admin labels and granular grants. Car business settings use Edit → Review → Save draft → authenticated Preview → separate scoped Publish; a draft save never changes its public document. Apartment draft/published snapshots remain separate. The unsafe hero selector was removed; the approved LX 600 composition is preserved without relabelling a different car. Public gallery rendering now honors saved covers and image order.

Fresh verification for this batch: root 124/124 tests and apartment 71/71 tests pass. The final apartment optimized Next build and car Vinext release build both pass after the targeted corrections. The earlier car optimized Next build also passed; Vercel will rebuild the exact pushed source. Production dependency audits report zero advisories in both apps. Shared backend Edge v9 is ACTIVE after reviewed role/publication and detailed click-report migrations. Native PostgreSQL rollback checks cover setup/roles/capabilities/site isolation/session revocation/final-owner guards and hourly report isolation. The live snapshot-preserving handover check passed private-save, explicit publication, per-scope isolation, graph/count agreement and exact private/public restoration for both sites; it neither seeded records nor changed client credentials.

The new security diff scan `62d000f2-7719-4dc1-b831-a60ce91e5047` is complete: all 58 prepared source items were reviewed across independent reviewers and parent coverage, with no reportable findings. This is scoped source/security verification, not a guarantee against every cyber threat or a full hosted-platform penetration test. Its initial working-tree digest predates the final legacy-photo compatibility correction; current prepared inventory/source and regression evidence are identified in its report. The earlier sealed scan remains unchanged.

Confirmed QA-only artifacts were backed up in restricted, ignored `.cms-private` exports, including original media bytes, before cleanup: 16 unreferenced library entries, 13 closed synthetic enquiries and 179 QA-actor history entries were removed. Real listings/customer enquiries/accounts were preserved. Original QA media blobs remain retained as recoverable backups, unlisted from the CMS; old aggregate click totals are retained separately rather than invented as hourly history. Detailed click reporting begins at its actual migration timestamp.

Chrome verified the production-built cars login, branded dashboard, real image library, saved-state settings editor and canceled-dialog behavior. Its batch picker still reports the extension file-access permission disabled even after the user reported enabling it; the active-profile permission was requested again, without weakening security. Do not claim the actual browser batch-pick test passed. API/media normalization and distinct-file mapping regressions pass. Client handover remains pending final browser permission resolution, GitHub/source publication and deployment readback. No links have been handed over as final delivery for this expanded batch.

After the sealed scan, a separately reviewed apartment Media library was added so a media-only administrator can actually use the granted upload capability. It combines real saved photo references and uploads, never attaches a photo to a listing or publishes automatically, and retains the existing server authorization. Peer review found an overlapping-batch/manual-export race; a single keyed, globally bounded scheduler now prevents concurrent duplicate uploads and caps work at two operations across batches. Its behavioral regression passes. The new library and the small car settings lifecycle correction have focused review, TypeScript, lint and fresh full-suite verification; they are not represented as part of the sealed 58-item scan. Twenty-four changed/new apartment source files were mirrored to the original checkout with private pre-copy backups and matching SHA-256 checks; environment files, dependencies and unrelated assets were not overwritten.

### Earlier release history

Final UI QA subsequently corrected initial Team Settings effect scheduling/cancellation in both identical component copies. Focused Settings tests, TypeScript and affected-file ESLint pass (no errors; an existing internal-navigation warning remains). This does not alter account permissions or authentication. Chrome desktop dashboards and 390-pixel-wide navigation/report/settings layouts were checked without horizontal page overflow; temporary emulation was cleared. The actual batch picker remains blocked by extension permission, not an observed CMS rejection. The Windows Sites build wrapper's npm-shim lookup needed a checkout-local ignored wrapper to invoke the installed npm; application build scripts/stack were preserved.

The core release was pushed to GitHub as `a9dd8b8b956d4c4dfb93fa424a3f5e1796ca0137`. Both Vercel production deployments are READY at that source: car `dpl_5NrFhD9DiyitGSBZJAHe7hRJ5noS`, apartments `dpl_9qcQ9xbULLsfisVhkieC9LS3mZyY`. Retained public Chida Sites version6 deployed successfully as `appgdep_6ad50419af7481918ad6f8703223afcf` from that exact source.

The real hosted car settings/publication/media checks, apartment14 CMS smoke checks, both-site stock/availability/metrics/hidden-price integration checks and fresh client setup-only checks all pass. Catalogues were restored. Hosted car crawl:14 pages,14 links,17 anchors,102 image URLs; apartments:9 pages,8 links,22 images (993,417 image bytes). The retained Sites origin also serves public pages/images and denies anonymous CMS access. An initial apartment crawler request mistakenly retained HTML `&amp;` in an image query; decoding the HTML attribute correctly resolves it, with no application change.

Browser review subsequently identified incomplete Chida dashboard branding/navigation and apartment secondary-control contrast/mobile navigation. These presentation corrections have failing-then-passing regression tests and are being rebuilt/released before client handoff. A common car selector now also protects unsaved gallery/specification text on every vehicle-switch path, including Overview → Manage. Authentication, APIs and catalogue contracts are unchanged. Chrome confirmed live QA sign-in, overview and apartment wizard open/cancel (catalogue remains2). Its file-picker automation is blocked by the ChatGPT extension's local-file permission, which was not weakened. Upload/read/publish API tests pass; a real browser batch-picker/crop check remains an explicit verification limitation, not an assertion of failure or completion. Do not claim physical-mobile or cross-browser coverage from desktop viewport tests.

Client links remain held until the final visual release and hosted setup checks are verified. Test traffic is included in the best-effort aggregate click counts; those counts must not be presented as production-only visitor traffic.
