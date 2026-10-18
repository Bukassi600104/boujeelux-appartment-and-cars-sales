import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("inspection preview falls back to the vehicle lead image when no cinematic scene exists", async () => {
  const component = await source("components/inspection-request.tsx");
  assert.match(component, /const featuredScene\s*=\s*featuredScenes\[slug\]/);
  assert.match(component, /vehicle\.featuredImage\s*\?\?\s*featuredScene\?\.src\s*\?\?\s*vehicle\.image/);
});

test("inventory cards expose one explicit details link instead of an overlapping full-card link", async () => {
  const component = await source("components/vehicle-card.tsx");
  assert.match(component, /variant\s*===\s*["']collection["']\s*&&\s*<a className=["']card-link["']/);
});

test("vehicle cards fall back to a gallery image when a CMS vehicle has no mapped cabin preview", async () => {
  const component = await source("components/vehicle-card.tsx");
  assert.match(component, /cabinPreviews\[vehicle\.slug\]\s*\?\?/);
  assert.match(component, /vehicle\.gallery/);
});

test("public enquiry actions use the shared recorder and keep encoded WhatsApp drafts", async () => {
  const paths = ["components/contact-enquiry.tsx", "components/inspection-request.tsx", "components/sourcing-form.tsx"];
  for (const path of paths) {
    const component = await source(path);
    assert.match(component, /encodeURIComponent\(/, `${path} must encode user-authored draft text`);
    assert.match(component, /import\s*\{\s*EnquiryLink\s*\}/, `${path} must use the shared enquiry recorder`);
    assert.match(component, /<EnquiryLink/, `${path} must render the shared enquiry recorder`);
  }
  const shared = await source("components/enquiry-link.tsx");
  assert.match(shared, /fetch\(["']\/api\/enquiries["']/);
  assert.match(shared, /rel=["']noopener noreferrer["']/);
  assert.match(shared, /window\.open\(["']about:blank["'],["']_blank["']\)/);
});

test("inspection preview uses SafeImage and honors a CMS featured image", async () => {
  const component = await source("components/inspection-request.tsx");
  assert.match(component, /import\s*\{\s*SafeImage\s*\}/);
  assert.match(component, /vehicle\.featuredImage\s*\?\?/);
  assert.match(component, /<SafeImage/);
});

test("public pages provide a main-content target", async () => {
  const pages = ["about", "contact", "inspection", "inventory", "sourcing"];
  for (const page of pages) {
    const component = await source(`app/${page}/page.tsx`);
    assert.match(component, /id=["']main-content["']/, `${page} page must expose the main-content target`);
  }
});

test("public content pages read published CMS content instead of static vehicle data", async () => {
  for (const page of ["inventory", "about", "contact"]) {
    const component = await source(`app/${page}/page.tsx`);
    assert.match(component, /getPublicContent/);
    assert.match(component, /export default async function/);
    assert.doesNotMatch(component, /import\s*\{\s*(?:contact|vehicles)\s*\}\s*from\s*["']@\/lib\/vehicles["']/);
  }
});

test("about and contact heroes receive current CMS settings from their pages", async () => {
  const about = await source("app/about/page.tsx");
  const contact = await source("app/contact/page.tsx");
  const heroes = await source("components/service-heroes.tsx");
  assert.match(about, /<AboutHero\s+title=\{settings\.aboutTitle\}\s+introduction=\{settings\.aboutText\}/);
  assert.match(contact, /<ContactHero\s+contact=\{contact\}/);
  assert.doesNotMatch(heroes, /import\s*\{\s*contact\s*\}\s*from\s*["']@\/lib\/vehicles["']/);
});

test("inventory make filters are derived from published vehicles", async () => {
  const component = await source("components/inventory-list.tsx");
  assert.match(component, /new Set\(vehicles\.map\(vehicle\s*=>\s*vehicle\.make\)\)/);
  assert.doesNotMatch(component, /const filters\s*=\s*\[[^\]]*Lexus/);
});

test("inspection workflow handles unavailable service, empty stock, and past dates", async () => {
  const component = await source("components/inspection-request.tsx");
  assert.match(component, /!settings\.inspectionEnabled/);
  assert.match(component, /vehicles\.length\s*===\s*0/);
  assert.match(component, /timeZone:\s*["']Africa\/Lagos["']/);
  assert.match(component, /min=\{today/);
});

test("sourcing workflow respects the CMS service toggle", async () => {
  const component = await source("components/sourcing-form.tsx");
  assert.match(component, /!settings\.sourcingEnabled/);
});
test('homepage About copy is controlled by the same CMS settings as the About page', async () => {
  const route = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(route,/<HomeView snapshot=\{await getPublicContent\(\)\}/);
  const home = await readFile(new URL('../components/home-view.tsx', import.meta.url), 'utf8');
  assert.match(home, /<h2>\{settings\.aboutTitle\}<\/h2>/);
  assert.match(home, /<p>\{settings\.aboutText\}<\/p>/);
});
