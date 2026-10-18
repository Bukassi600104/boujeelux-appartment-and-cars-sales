# Apartment photography update — 17 October 2026

## Final deliverables

- Twenty separate website WebPs: `public/images/boujeelux-01-*.webp` through `boujeelux-20-*.webp`.
- Twenty non-generative PNG masters: `asset-sources/photographic-masters/boujeelux-*.png`.
- Downloadable set: `Boujeelux_Polished_20_Website_Photos.zip` (20 separate WebPs, not a collage).
- QA-only overview: `asset-sources/photographic-masters/review-contact-sheet.jpg`.
- Per-image processing parameters, source path, dimensions and byte size: `asset-sources/photographic-masters/manifest.json`.

The original ZIP and extracted JPGs are unchanged. All originals are 512 × 910 video frames. The final images retain that exact resolution and full framing; no synthetic higher-resolution detail, extra room width, furnishings or amenities were invented.

## Editing method

The user explicitly approved non-generative corrections after initial built-in image-editing trials changed some room details. The final website images use only conservative per-image sRGB channel balance, brightness and saturation adjustment, and restrained sharpening, followed by WebP encoding. Decorative light colours and the actual furniture, bedding, finishes and fixture positions remain intact. No generative trial was selected for the website.

Reproduce the final set with `node scripts/prepare-property-photos.mjs`. Exact numerical corrections are in the script and manifest. Built-in image trial prompts and QA are retained separately under `asset-sources/imagegen-candidates/` and `asset-sources/polished-masters/`; those are unused candidates, not the authoritative final set.

Website total: 1,019,822 bytes for all 20 WebPs; largest image 83,136 bytes. Next Image supplies responsive sizes and lazy loading outside priority views.

## Integration and scope

- Existing homepage, apartment cards, detail galleries and approach imagery now use supplied property photographs.
- All 20 are in a property-wide gallery at `/apartments#property-gallery`, with room-category filters, horizontal browsing and a native modal full-frame viewer.
- Existing colours, routes, rates, enquiry flow and publication model remain unchanged.
- The source ZIP explicitly labels photo 05 as the studio. Photos 01 and 02 are matching views of the first living area, used with a visible “Property view · confirm exact unit” label in the residence card, hero and detail view because that unit mapping is unconfirmed. Other room-to-unit assignments also remain unconfirmed, so they appear in the general property collection rather than being asserted as part of a specific unit. The gallery asks visitors to confirm included rooms/facilities with the team.
- Legacy stock-only galleries on the two seeded records are refreshed when saved local content loads. Custom uploaded galleries, saved text/prices, publication state and revision numbers are preserved. The refresh does not reset browser data.
- This is a local update. Boujeelux's existing browser-only demo CMS is unchanged; no production CMS or hosted deployment was created.

## Verification

Automated coverage includes separate decodable assets with original proportions and bounded file weights, all 20 gallery entries exposed by the existing apartments route, and safe legacy-image migration without overwriting custom CMS uploads or saved listing edits. Full route, domain and enquiry regression checks are also run.

Chrome verification: category filtering, enlarged portrait viewer, filtered first/last wraparound with left/right arrow keys, Escape to close, and reset to the first photo after switching categories. All 20 raw asset URLs and Next's responsive image endpoint returned HTTP 200. Desktop document width equals viewport width, with no broken loaded images. A fresh reload produced no new console errors. The downloadable ZIP was hash-checked against all 20 website WebPs.

The default Turbopack preview was extremely slow on this filesystem. The retained local preview uses the documented Webpack development flag (`npm run dev -- --webpack`) on the same `127.0.0.1:5180` origin; no framework or public route was changed.

Final verification: production build (including TypeScript) passed; all 22 automated tests passed. Repository-wide and targeted lint attempts remained running without a result and were stopped; a clean lint result is not claimed.
