import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const { getSiteUrl, pageMetadata } = await import("../lib/seo.ts");

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("SEO utilities declare the hosted canonical origin and configurable override", async () => {
  const seo = await source("lib/seo.ts");
  assert.match(seo, /https:\/\/chida-moore-automobiles\.tonyorji\.chatgpt\.site/);
  assert.match(seo, /NEXT_PUBLIC_SITE_URL/);
  assert.match(seo, /SITE_URL/);
  assert.match(seo, /settings\?\.canonicalUrl/);
  assert.match(seo, /settings\?\.siteUrl/);
  assert.match(seo, /new URL\(/);
});

test("sitemap exposes public routes and vehicle detail URLs without synthetic claims", async () => {
  const seo = await source("lib/seo.ts");
  for (const route of ["/inventory", "/sourcing", "/inspection", "/about", "/contact", "/vehicles/"]) {
    assert.ok(seo.includes(route), `sitemap source must include ${route}`);
  }
  assert.doesNotMatch(seo, /rating|reviewCount|mileage|address/i);
});

test("sitemap route reads published CMS content and uses short dynamic caching", async () => {
  const route = await source("app/sitemap.xml/route.ts");
  assert.match(route, /getPublicContent\(\)/);
  assert.doesNotMatch(route, /seedContent/);
  assert.match(route, /status:\s*503/);
  assert.match(route, /updatedAt:\s*content\.updatedAt/);
  assert.match(route, /getPublicSiteUrl\(content\.settings\)/);
  assert.match(route, /force-dynamic/);
  assert.match(route, /application\/xml/);
  assert.match(route, /s-maxage=60/);
  assert.doesNotMatch(route, /stale-while-revalidate/);
});

test("robots allows public crawling and protects admin and API paths", async () => {
  const seo = await source("lib/seo.ts");
  const route = await source("app/robots.txt/route.ts");
  assert.match(seo, /User-agent: \*/);
  assert.match(seo, /Allow: \//);
  assert.match(seo, /Disallow: \/admin/);
  assert.match(seo, /Disallow: \/api/);
  assert.match(seo, /\/sitemap\.xml/);
  assert.match(route, /getPublicContent\(\)/);
  assert.match(route, /getPublicSiteUrl\(content\.settings\)/);
  assert.match(route, /force-dynamic/);
  assert.match(route, /s-maxage=60/);
  assert.match(route, /text\/plain/);
});

test("metadata helper emits page-specific canonical, Open Graph and Twitter fields", () => {
  const base = getSiteUrl("https://example.test/custom/path");
  const metadata = pageMetadata("/inventory", "Inventory title", "Inventory description", "/hero.webp", base);
  assert.equal(metadata.alternates?.canonical, "https://example.test/inventory");
  assert.equal(metadata.openGraph?.url, "https://example.test/inventory");
  assert.equal(metadata.openGraph?.title, "Inventory title");
  assert.deepEqual(metadata.twitter?.images, ["https://example.test/hero.webp"]);
  assert.equal(metadata.twitter?.card, "summary_large_image");
});

test("JSON-LD helpers stay factual and omit fabricated reputation or location claims", async () => {
  const seo = await source("lib/seo.ts");
  assert.match(seo, /function organizationJsonLd\(/);
  assert.match(seo, /function vehicleJsonLd\(/);
  assert.match(seo, /priceCurrency:\s*["']NGN["']/);
  assert.match(seo, /hasPrice/);
  assert.doesNotMatch(seo, /aggregateRating|reviewCount|mileageFromOdometer|PostalAddress/);
});
test("vehicle metadata passes the CMS domain into all social and canonical fields", async () => {
  const route = await source("app/vehicles/[slug]/page.tsx");
  assert.match(route, /vehicle\.featuredImage\?\?vehicle\.image,getPublicSiteUrl\(settings\)/);
});
