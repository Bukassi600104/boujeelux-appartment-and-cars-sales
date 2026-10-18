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
| Chida complete test suite | 80 passed, 0 failed |
| Boujeelux complete test suite | 56 passed, 0 failed |
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

At the time this source record was prepared, the shared backend is deployed, but the new frontend GitHub push, both Vercel production builds, the retained Chida Sites deployment and hosted regression checks are the remaining release gate. Client links are held until those checks complete. The deployment evidence will be appended without changing or overstating the sealed security report.
