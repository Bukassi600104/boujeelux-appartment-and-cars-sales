# Approved dual CMS design

Approved by the client on 18 October 2026: independent Supabase Auth accounts and data permissions for Chida Moore and Boujeelux; mandatory first-login change of both username and password; save/secure credentials warning; sign out after changing and require a fresh login. Preserve existing designs, images, prices and page structures. Verify publishing on both websites and commit/push to the existing GitHub repository.

## Architecture

The existing applications keep their stacks. A project-scoped Supabase Edge API uses Supabase Auth to verify passwords and stores only hashes of opaque CMS session tokens. The websites act as same-origin backends-for-frontends: tokens are HttpOnly, SameSite=Strict cookies, never localStorage or browser-visible JSON. Separate accounts, site-scoped content, media and sessions prevent cross-CMS access. Privileged Supabase credentials remain inside Edge runtime, not Vercel, browser bundles or Git.

First-login sessions can only inspect their identity, change credentials or sign out. Changing credentials requires the existing password, a different username and a different strong password. Both are changed before the account becomes usable, all CMS sessions are revoked, and the user returns to login. A failed or interrupted rotation fails closed. Initial credentials are delivered in a local untracked handover file, not committed.

Content edits use optimistic revision checks; only published listings appear publicly. Media uploads are validated and site scoped. Existing local/D1 demo content is not erased; the apartment demo remains available for explicit export, not silently imported. Public enquiries remain enquiries, never automatic confirmations or proof that WhatsApp messages were sent.

## Verification

Test setup-session denial, both-credential validation, rotation, old login and old-session rejection, new login, cross-site isolation, CSRF, brute-force limits, malformed input, unpublished data isolation, upload validation and revision conflicts. Exercise real hosted backend and both local application publishing flows. Run both complete test suites and builds. Run Supabase advisors and review the patch for secrets before committing/pushing. Report deployment limitations separately from local verification.
