import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {lodgingBusinessJsonLd,publicPageMetadata} from '../lib/seo';

const root=new URL('../',import.meta.url);

test('public metadata is indexable and has the configured production base',async()=>{
  const source=await readFile(new URL('app/layout.tsx',root),'utf8');
  const helper=await readFile(new URL('lib/seo.ts',root),'utf8');
  assert.match(helper,/NEXT_PUBLIC_SITE_URL/);
  assert.match(helper,/SITE_URL/);
  assert.match(helper,/https:\/\/boujeelux-apartments-bukassi-gmailcoms-projects\.vercel\.app/);
  assert.match(source,/metadataBase:new URL\(siteUrl\(\)\)/);
  assert.match(source,/robots:\{index:true,follow:true\}/);
});

test('robots excludes private and API routes and advertises the sitemap',async()=>{
  const source=await readFile(new URL('app/robots.ts',root),'utf8');
  assert.match(source,/['"]\/admin['"]/);
  assert.match(source,/['"]\/api['"]/);
  assert.match(source,/sitemap\.xml/);
});

test('sitemap contains public pages and only published apartment URLs',async()=>{
  const source=await readFile(new URL('app/sitemap.ts',root),'utf8');
  for(const path of ['/apartments','/enquire','/contact','/our-approach','/privacy'])assert.match(source,new RegExp(path.replace('/','\\/')));
  assert.match(source,/record\.published/);
  assert.doesNotMatch(source,/record\.draft\.slug/);
});

test('unpublished apartment detail URLs return a real server 404',async()=>{
  const source=await readFile(new URL('app/(public)/apartments/[slug]/page.tsx',root),'utf8');
  assert.match(source,/notFound\(\)/);
  assert.match(source,/record\.published\?\.slug===slug/);
});

test('public page metadata emits canonical and Open Graph URLs',()=>{
  const metadata=publicPageMetadata('Our apartments','Published stays.','/apartments');
  assert.equal(metadata.alternates?.canonical,'/apartments');
  assert.equal(metadata.openGraph?.url,'/apartments');
  assert.equal(metadata.openGraph?.description,'Published stays.');
});

test('every static public route declares its own canonical metadata',async()=>{
  const routes=[['page.tsx','/'],['apartments/page.tsx','/apartments'],['contact/page.tsx','/contact'],['enquire/page.tsx','/enquire'],['our-approach/page.tsx','/our-approach'],['privacy/page.tsx','/privacy']];
  for(const [file,path] of routes){const source=await readFile(new URL(`app/(public)/${file}`,root),'utf8');assert.match(source,new RegExp(`publicPageMetadata\\([\\s\\S]*['\"]${path.replaceAll('/','\\/')}['\"]\\)`),file);}
});

test('apartment metadata uses published content and its cover image',async()=>{
  const source=await readFile(new URL('app/(public)/apartments/[slug]/page.tsx',root),'utf8');
  assert.match(source,/generateMetadata/);
  assert.match(source,/record\.published\?\.slug===slug/);
  assert.match(source,/apartment\.photos\[0\]/);
  assert.match(source,/`\/apartments\/\$\{apartment\.slug\}`/);
  assert.doesNotMatch(source,/record\.draft/);
});

test('lodging structured data contains only confirmed identity and location fields',()=>{
  const data=lodgingBusinessJsonLd() as Record<string,unknown>;
  assert.deepEqual(data['@type'],['Organization','LodgingBusiness']);
  assert.equal(data.name,'Boujee Lux');
  assert.deepEqual(Object.keys(data).sort(),['@context','@type','address','name','url']);
  assert.deepEqual(Object.keys(data.address as object).sort(),['@type','addressLocality','addressRegion']);
});
