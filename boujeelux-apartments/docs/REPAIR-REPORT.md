# Boujeelux local preview repair — 15 October 2026

## Outcome

Both local websites were verified with HTTP 200 responses and opened in Chrome:

- Boujeelux Apartments: http://127.0.0.1:5180/
- Chida Moore Automobiles: http://localhost:5173/

The Boujeelux development server was restarted using its existing `npm run dev` command. Chida Moore's source and running server were not changed during this repair.

## Repairs

The existing routes imported UI files that had not been created; this was not a dependency-installation or alias problem. Restored the shared header/footer, public pages, apartment gallery, enquiry form, local-demo editor and global stylesheet without adding public routes or changing the seeded property facts.

Restored three optimized, explicitly illustrative interior images. Sources and licences are recorded in `image-sources.md`; these are not photographs of the actual properties.

Added safe validation/fallback for malformed browser-saved catalogues, conservative storage budgeting and clearer upload limits. A failed write preserves the previous saved catalogue. Also corrected reverted-edit handling and a date-input bug that cleared enquiry dates when another field changed.

Added the Next.js smooth-scroll document attribute and narrowly scoped hydration compatibility for document-container attributes injected by browser extensions. Application content is not globally excluded from hydration checks.

## Verification

- `npm run build`: passed, including production compilation and TypeScript.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 18 passed, zero failures. The regression suite initially reproduced 11 failures before restoration.
- HTTP checks: all 10 existing page/preview routes and all three seeded image URLs returned 200.
- Chrome: apartment search returned the Studio only; its detail link opened; selecting a thumbnail changed the main image; requesting that apartment preselected it in the enquiry form; dates persisted and a correctly encoded WhatsApp draft was prepared.
- No WhatsApp message was sent, no reservation was made, and no production deployment or credential change occurred.
- The desktop homepage had no horizontal overflow or broken loaded images. No new browser console errors remained after the document compatibility fix.

## Boundaries

The apartment CMS remains the existing **local, browser-only demonstration**. It is not a hosted CMS, client authentication system or shared database. Those production services remain disabled. This repair does not change that architecture or configure a client account.

To restart after stopping the preview or rebooting, run `npm run dev` from each project's own directory. The tests expect Boujeelux to be running on port 5180.
