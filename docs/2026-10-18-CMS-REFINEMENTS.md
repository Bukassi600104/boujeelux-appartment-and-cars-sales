# CMS and website refinement change list

18 October 2026 — voice-review notes. These are requirements and visual review decisions, not a claim that the changes are implemented. Keep the existing first-login security flow and two independent apps/CMS accounts intact.

## Applies separately to both brands

- Branded login pages: faint relevant vehicle/property imagery, compact premium form, readable contrast, show/hide password, helpful validation and accessible feedback. Preserve mandatory replacement of both credentials, save-credentials acknowledgment, session revocation and return to login without automatic dashboard access.
- Structured dashboard: clear overview and navigation to listings, media, enquiries, website settings and activity. Do not land directly in a long all-in-one editor. No invented revenue, visitor counts or live analytics.
- Guided add-listing wizard: details, photos, review. Starting a wizard must not immediately add a listing to the catalogue. Persist a listing only through an explicit save-draft/publish action; publishing must be deliberate.
- Guided image handling: allow selecting multiple files, with a separate preview/progress/error/retry per photo. Label exterior/interior views for vehicles and room/property views for apartments; client confirms labels. Choose a cover, reorder, replace and remove photos without editing gallery JSON.
- Enforce approved image frames and proportions in each website. Uploaded dimensions must not change card/section geometry. Correct orientation, generate resized/compressed variants, never stretch, provide adjustable crop/fit previews and warn on inadequate quality. Do not promise that compression can recover missing detail. Keep existing secure file validation. Draft-listing privacy is distinct from the current intentionally public media library.
- Recently viewed listings: compact row below details, exclude current listing, use history from that browser only, allow clearing history, respect publication and current stock/availability. Vehicle history on Chida; apartment history on Boujeelux. This is distinct from recommendations and aggregate dashboard analytics.
- Public WhatsApp assistance: discreet floating button, gentle delayed reminder once per visit, dismissible prompt, mobile-safe placement, no obstruction of content/navigation. Use the relevant site's contact and a reviewable message naming the current listing. No automatic sending, false online claims or public chat reminder inside CMS pages.
- Optional click metrics: count labelled chat-button interactions per listing/time period if included; never equate clicks or saved enquiry briefs with sent WhatsApp messages, completed conversations, sales or bookings.
- Use only approved official brand artwork, no invented replacement logos or whole logo presentation sheets. Keep navigation/sidebar and footer versions proportionate and compact; use transparent assets appropriate to the background when preparing production assets.

## Chida-specific stock controls

- Make stock controls obvious in the dashboard: available, sold, unavailable; preserve existing reserved handling where relevant.
- Available vehicles do not need a public Available badge.
- Sold/unavailable vehicles may remain published with photographs/details visible and a small truthful badge. Stock state and publication/archive state must be separate.
- Keep an enquiry route for sourcing a similar vehicle. Default supporting wording can indicate that similar vehicles can be sourced; it must not imply this exact sold vehicle is still available.
- Show Available soon only after the administrator confirms incoming stock. This is separate from Sold; never imply restocking automatically.

## Boujeelux-specific availability

- Use rental/guest enquiry wording and apartment availability controls, not Sold badges.
- Do not interpret this discussion as approval for an automatic reservation engine, payment flow, live occupancy calendar or confirmed booking claims. Arrangements remain subject to team confirmation.

## Visual review decisions

- Apartment dashboard direction approved: forest-green navigation, light cream/paper content, restrained gold accents and well-organized listing/gallery sections. Preserve that direction while replacing the placeholder wordmark with the official logo.
- Initial dark Chida dashboard rejected. Revise to light ivory/stone surfaces, restrained gold, readable ink typography, compact editorial structure and less repetitive decorative card/button treatment. Revised visual requires review; do not copy the apartment's forest-green branding.
- Dashboard images are labelled concept/sample data, not screenshots of the live CMS. Illustrative photos/statuses are not changes to the actual catalogue.
- Official Chida transparent artwork is in the existing public brand folder.
- Official apartment artwork supplied during this review: `C:/Users/USER/Downloads/BoujeeLux logo 1.jpeg`. It is a logo presentation sheet, not a ready-to-use single transparent asset. Select the appropriate individual approved lockup/emblem; never display the entire sheet as the website logo.

## Explicitly excluded

- The user withdrew the apartment video/tour proposal. Do not add a homepage video section, hero video, autoplay, tour CMS fields or a video-upload feature for this delivery. Revisit only if the client later requests it.
- Additional social profiles may wait for client-confirmed handles. Audit existing Instagram links against the supplied Boujeelux24 handle; do not guess or add unverified Facebook, X, TikTok or other profiles.

## Delivery authorization and handoff gate

- The user explicitly authorized implementing the agreed refinement batch, preserving separate sites/CMSs, then debugging, security review, GitHub push and production deployment verification.
- Do not hand over website/CMS links as the completed delivery until the implemented batch passes end-to-end checks and production deployments are verified. Mockups and partial implementations are not the delivery.

## Search readiness checkpoint

- User clarified that technical search readiness is required, not search-engine submission in this change list.
- Rechecked both production homepages, robots files and sitemaps: HTTP 200; public homepage no-index absent; public crawler access permitted, CMS/API routes disallowed; canonical tags and two structured-data blocks present on each homepage.
- Car canonical/sitemap domain remains its existing branded Sites address; its Vercel address is a mirror. Apartments uses its production Vercel origin. Keep each site's canonical origin consistent; revisit when client domains are selected.
- No claim of confirmed Google indexing, ChatGPT inclusion, search ranking or completed Search Console submission. Do not create search accounts or submit properties as part of merely recording these notes.

## Implementation boundary

No new application code, schema, production configuration or catalogue content has been changed during this voice review. This document records the agreed scope and outstanding visual review before implementation. Existing accounts, client-selected credentials and published inventory must not be reset during the redesign.

## Subsequent authorized implementation

The boundary above records the original planning checkpoint, not the later implementation status. The user subsequently authorized immediate coding, separate client setup identities while retaining existing support access, testing, GitHub push and production deployment. See `2026-10-18-CMS-RELEASE-REPORT.md` for observed verification and release gates. Video remains excluded.
