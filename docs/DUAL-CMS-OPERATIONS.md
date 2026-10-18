# Independent CMS operations

## Architecture and deployment

The car app remains at the repository root; Boujeelux Apartments is an independent Next.js app in `boujeelux-apartments/`. Install and build each separately, using its own lockfile. Do not combine their React/Next versions. The original apartment working folder is preserved outside this repository.

Both connect to the project-scoped Supabase Edge API `https://vcnqpzhzhttfejarkfud.supabase.co/functions/v1/dual-cms`. Its privileged Supabase key is supplied by the managed Edge runtime, never by browser code. The websites hold only site-specific HttpOnly cookies. No ChatGPT or developer email/password is a CMS login.

The user explicitly approved public production websites with private CMSs on 18 October 2026. Preserve platform protection for non-public previews where possible; production must not ask clients to use the developer's ChatGPT/Vercel credentials. The existing Sites publication initially had a custom owner-restricted audience, and Vercel protected all non-custom-domain deployments. Changing app login alone does not remove those gates. Record the actual updated hosting access and verified production links in the final test report; local tests alone do not prove external access.

Production access was updated and verified: Chida is public at `https://chida-moore-automobiles.tonyorji.chatgpt.site`, and apartments at `https://boujeelux-apartments.vercel.app`. Append `/admin/login` for the corresponding private CMS. The car Vercel mirror is `https://boujeelux-appartment-and-cars-sales.vercel.app`. Both Vercel projects deploy from the same GitHub repository's `main` branch, but the apartment project has its own root directory, install/build configuration and public canonical-origin environment variable. Do not delete the apartment's own PostCSS configuration: otherwise Next may inherit the parent application's incompatible CSS configuration.

For the client handover, prefer the car Vercel address (and its `/admin/login`): it serves correct image MIME headers. The older branded Sites host renders images in Chrome but returns a generic MIME type for some optimized WebPs; see the exact comparison and limitation in the verification report. Do not treat that strict hosted image crawl as passing.

## Client first login

Each CMS has its own temporary credentials, delivered outside Git in a private local handover file. On login the client must replace **both** username and password. They must acknowledge the reminder to save and secure their new credentials. Successful replacement revokes every session for that CMS account and returns to the login form; it never opens the dashboard automatically. The client signs in again with their new credentials. Changing one CMS does not change the other.

Passwords require at least 15 characters and at most 72 UTF-8 bytes. Use a unique password-manager-generated password or a long random passphrase. The username must be different from the temporary username. Neither old credentials nor old cookies should work after replacement.

CMS sessions expire after 8 hours (setup sessions after 15 minutes) and after 30 minutes of inactivity. Local HTTP is permitted only on loopback; client hosting must use HTTPS. Back up content before major edits. Stale revisions are rejected rather than overwriting another editor's changes.

## Media and enquiries

Uploads are limited to 3MB to fit the deployed same-origin API body limit. Optimize photos as WebP/AVIF where practical. Supported formats: JPEG, PNG, WebP, AVIF, MP4 and WebM; active SVG/HTML uploads are refused. Media is intentionally public once uploaded, including before a listing is published: never upload personal documents or confidential draft material. Site-scoped API media paths cannot access the other website's media. Old local/D1 data and source photographs are not deleted.

Enquiries are records of website requests/drafts. They are not automatic bookings, inspection confirmations, payments, or evidence that a WhatsApp message was sent. Staff must confirm arrangements with the customer.

## Recovery and maintenance

Do not turn off mandatory setup or make a setup token a dashboard token. Credential rotation locks the account before changing Auth and revokes existing sessions. If Auth/storage/network failure interrupts a rotation, the account deliberately fails closed instead of permitting partial credentials. A trusted project operator must inspect the account and use Supabase's supported administrative password reset/update capability, set `must_change=true`, increment its credential epoch and revoke all CMS sessions before reissuing temporary credentials. Never ask the client to share their chosen permanent password.

Bootstrap tokens are project-operator-issued, random, hashed, site-scoped, time-limited and single-use. A failed provisioning operation must be reconciled before issuing a fresh token; do not blindly reuse or re-enable a consumed token. No bootstrap secrets or initial passwords belong in source or GitHub.

All CMS tables have RLS enabled, with browser-role grants revoked. Their lack of public policies is intentional deny-by-default, not a missing permission to fix by granting anonymous access. Service-only invoker RPCs handle concurrency-sensitive writes; no security-definer elevation is needed. New-index informational advisor notices are expected until traffic uses them.

Security tests cover the implemented flows, not every possible cyber threat. Keep Supabase, app dependencies, HTTPS hosting and provider security controls maintained; repeat authentication/publishing tests after upgrades.

The production dependency audit reported no known advisories after the security patches. Supabase's advisor still flags disabled leaked-password protection: the managed HaveIBeenPwned feature requires Pro or higher (https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No paid plan upgrade was made or authorized. The CMS enforces length, change-of-password and throttling, but these do not replace a breached-password check or MFA. Enable the provider feature on an eligible plan before production handover if required by the client's security policy.

The car app now has one authoritative dependency lock: package-lock.json, with npm@11.9.0. The obsolete pnpm lock was removed to prevent conflicting installer selection and old security-patch resolutions. Its previous contents remain recoverable in Git history. Use npm run install:ci for the car app and npm ci in the independent apartment folder.

Migration history was reconciled after native MCP deployment assigned execution-time versions. The stored SQL for both migrations matched the whitespace-normalized local SQL fingerprints exactly. Only the two verified history version fields were aligned to the CLI-generated local files: 20261018095826 → 20261018095515 (dual_cms), 20261018102420 → 20261018102254 (dual_cms_guards). No schema or application data was replayed or deleted. Future linked CLI migrations should see these as already applied; inspect history before any db push.

Login throttling has a 30-attempt per-account-bucket ceiling per 15 minutes, with a stricter 5-attempt gateway/account-pair bucket and a site-wide ceiling. Gateway hops are only a coarse signal and can vary; the account ceiling is the reliable bound. Finite buckets and expired-row cleanup bound limiter storage. Like any application login throttling, this trades some temporary lockout risk against password guessing; it is not a substitute for provider-level abuse controls.
