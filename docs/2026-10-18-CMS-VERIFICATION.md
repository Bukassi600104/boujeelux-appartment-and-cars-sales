# Dual CMS verification — 18 October 2026

## Scope and current result

Two independent apps and CMS accounts share only a site-scoped Supabase backend. Existing car/apartment pages, branding, photographs and original apartment folder are preserved. This report is being completed alongside final deployment verification; unverified hosting must not be treated as finished.

## Verified functionality

- Supabase Edge API v4 active in project `vcnqpzhzhttfejarkfud`, with two applied migrations and verified/reconciled local migration history.
- Shared-backend/package tests: 11/11, including an actual streamed UTF-8 byte cap. Real remote authorization/security tests repeated on v4: 7/7. A real ~4.3MB JSON request succeeded; an over-limit remote probe was connection-reset by the hosting path, so a delivered remote HTTP 413 is not claimed. The handler's local regression verifies controlled 413 and early stream cancellation.
- Real managed-Auth tests for both QA accounts covered one-time bootstrap, setup-only access, replacing both credentials, no auto-login, revoked old sessions, rejected old credentials, new login, draft privacy, revision conflicts and media signatures/isolation.
- Apartment app: final 37/37 tests, type check and clean production build passed, including canonical/Open Graph and safe lodging structured data checks. Live production-server BFF checks: 14/14, including add/draft/publish/edit/unpublish, real 404 after unpublish, sitemap updates, upload delivery and enquiry status. Repeated successfully on final local port 5180. Original catalogue restored exactly.
- Apartment first-login BFF test passed: setup redirects, dashboard/data denial before setup, HttpOnly Strict cookie, rotation clears cookie, login required, old credentials/session rejected, new login opens dashboard.
- Car final complete suite: 50/50 tests and type check passed. Both patched Vinext and final Next.js 16.3.8 webpack production builds passed. A minimal hero readability adjustment retained the image/layout and uses local side scrims with ivory/gold text, visually checked in Chrome. Real BFF publishing/price/settings/draft/empty-state/service-toggle/enquiry/media/CSRF/cookie checks passed; original content restored. Its Next production-server public routes and anonymous admin redirect passed on port 5174. The final Worker link/image crawl passed across 14 pages, 14 local routes, 17 fragment anchors and 102 rendered image URLs (5,310,655 bytes across the entire crawl, not a per-page performance metric).
- Static car asset audit: 375 image files, 56 source references, no missing source image references. Existing optimized variants and gallery assets preserved.
- Two independent client accounts provisioned. Both still require their actual client first-login change; QA tests do not consume client setup.
- Car and apartment first-login BFF tests both passed. The issued client credentials were also tested against each app's login/setup/data-denial routes without changing them. Both client accounts remain setup-only; no sessions are retained after those checks.

## Fixed defects

- Replaced developer/platform-only CMS authentication with independent client accounts and server-backed content.
- Removed browser exposure of session tokens and caller overrides of backend site/action/token fields.
- Added strict mutation-origin checks, bounded JSON inputs, setup-only authorization, revocation guards on writes/uploads and revision conflict protection.
- Added the explicit credential-save warning/acknowledgment and forced return to login after replacement.
- Removed apartment public no-index testing configuration; added robots/sitemap with private and unpublished routes excluded.
- Fixed unpublished apartment detail URLs returning HTTP 200.
- Repaired mixed package-manager installation state; retained npm lock only. Removed obsolete pnpm lock, recoverable in Git history.
- Patched critical/high production package advisories; final all-dependency audit results recorded below after the RSC patch.

## Security evidence and limits

All eight CMS tables have RLS enabled with browser-role grants revoked. All ten CMS RPCs deny anon/authenticated execution and are invoker functions. Intentional deny-all RLS produces eight informational advisor notices; performance advisor has no notices. Guarded SQL assertions passed in a transaction that was rolled back. Four revoked-session save/upload HTTP requests were refused and content/media remained unchanged. The lock observer did not confirm concurrent scheduling, so this is not claimed as an observed race-timing proof.

Supabase warns that leaked-password protection is disabled. Its managed breached-password feature requires Pro or higher; no subscription upgrade was made. See [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Long unique passwords and application throttling are enforced, but are not substitutes for breached-password checks or MFA.

Tests are targeted engineering/security checks, not an exhaustive penetration test or a guarantee against every cyber threat. Chrome verification confirmed apartment homepage/navigation/Studio filtering/details/private-login redirect and car inventory navigation/Toyota filtering/Corolla detail/cabin thumbnail changing the central image. No broken loaded car images, horizontal overflow or browser warning/error entries appeared in these desktop checks. An initial browser timeout recovered through the documented browser interface. Credential rotation was exercised by real HTTP BFF tests, not by typing new credentials in browser automation. These checks do not establish Core Web Vitals or full cross-browser compatibility. No actual WhatsApp message, booking or inspection confirmation was sent. Synthetic enquiries are labeled tests and closed. Media is intentionally public immediately after upload; never upload confidential documents.

## Final deployment, audit and Git evidence

Production-only npm audits report zero known advisories for both apps. The full dependency audits still report toolchain advisories: car 14 (8 high, 4 moderate, 2 low), apartment 5 high. Most high entries propagate the `braces` dependency (latest published 3.0.3 still affected); the car also retains older Drizzle/esbuild development tooling and low Cloudflare tooling notices. These are **not** a clean full dependency audit. No forced framework downgrade or unverified major override was applied to silence audit output. Build/lint only trusted source locally/CI; do not expose development servers publicly, and track upstream patches. See [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). React/RSC were aligned to 19.2.9, Vite patched to 8.0.16, and image-size/ws/undici plus compatible transitive dependencies patched. A production-only audit alone would have missed the RSC package because this stack labels it as a dev dependency.

Pending final patched car build, hosted deployment checks, commit and push. Initial credentials are only in the ignored local `.cms-private/CLIENT-CMS-ACCESS.txt`, never GitHub or this report. Both client accounts were independently confirmed active with `must_change=true` and zero session rows after provisioning.
