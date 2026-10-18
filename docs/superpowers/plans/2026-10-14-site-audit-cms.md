# Website audit and connected CMS implementation plan

> **For agentic workers:** Implement bounded tasks inline with test-first checks. Public workflow, image and SEO audits run independently with the user's existing specialist agents.

**Goal:** Preserve the approved premium site while making its inventory, content, media and enquiry workflow manageable through a protected persistent CMS.

**Architecture:** Existing Vinext/React and Sites remain. D1 stores one versioned content snapshot plus audit/enquiry records; R2 stores uploads. Public server pages and client content providers read the same published snapshot. Hosted CMS access is email-allowlisted ChatGPT identity; local-only access uses the existing loopback mock identity and is never enabled in production.

**Tech Stack:** Existing React, Vinext, Zod, Drizzle, D1, R2, Node test runner.

## Global constraints

- No redesign, new public marketing pages, deployment or provider migration.
- Never invent vehicle specifications, mileage, guarantees or ratings.
- Preserve all source photographs. Uploaded media must have type/size checks.
- Inspection requests remain requests, not confirmed appointments.
- No admin credentials in browser code; production access fails closed until configured.

## Tasks and verification

- [ ] Write failing validation/access/publication tests; implement `lib/cms/model.ts`.
- [ ] Add schema/migration and persistent CMS store, protected APIs, media upload/serve and audit history.
- [ ] Add `/admin` dashboard for add/edit/draft/archive vehicles, prices/specs/galleries/video, home/about/contact settings, enquiry status and backup export.
- [ ] Wire homepage, inventory, details, enquiry selectors/contact links and SEO to the published CMS snapshot.
- [ ] Run real CMS save → public response → persistence/reload → restore test, reject anonymous/invalid/cross-origin writes.
- [ ] Audit every route, image variant and local link; check gallery/carousel/filter/forms plus 404.
- [ ] Add canonical metadata, structured data, sitemap/robots, responsive image fallback, accessibility/motion refinements.
- [ ] Run full test suite, TypeScript, lint, production build, HTTP checks and supported browser QA; document limits.

## Review focus

Draft/archived vehicles never leak publicly; stale writes return conflict; missing image derivatives fall back; empty inventory does not crash; published mutations require admin identity and same-origin request.
