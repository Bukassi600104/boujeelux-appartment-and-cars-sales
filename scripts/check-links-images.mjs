import assert from 'node:assert/strict';
const base = 'http://localhost:5173';
const routes = ['/', '/inventory', '/about', '/contact', '/sourcing', '/inspection'];
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
routes.push(...[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname).filter(p => p.startsWith('/vehicles/')));
const links = new Set();
const images = new Set();
let checkedAnchors = 0;
for (const route of routes) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    assert.ok(href && href !== '#' && !href.startsWith('javascript:'), `${route}: placeholder link`);
    if (href.startsWith('/')) links.add(new URL(href, base).pathname);
    if (href.startsWith('#')) { assert.ok(html.includes(`id="${href.slice(1)}"`), `${route}: missing anchor ${href}`); checkedAnchors++; }
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/g)) {
    for (const attr of tag[0].matchAll(/\b(?:src|srcSet)="([^"]*)"/gi)) {
      for (const candidate of attr[1].split(',')) { const url = candidate.trim().split(/\s+/)[0]; if (url.startsWith('/')) images.add(url); }
    }
    assert.match(tag[0], /\balt="/, `${route}: image without alt`);
  }
}
for (const route of links) assert.equal((await fetch(base + route)).status, 200, `Broken local link ${route}`);
let imageBytes = 0;
const queue = [...images];
await Promise.all(Array.from({length: 4}, async () => {
  while (queue.length) {
    const url = queue.pop();
    const response = await fetch(base + url);
    assert.equal(response.status, 200, `Broken image ${url}`);
    assert.match(response.headers.get('content-type') ?? '', /^image\//, url);
    const bytes = await response.arrayBuffer();
    assert.ok(bytes.byteLength, `Empty image ${url}`);
    imageBytes += bytes.byteLength;
  }
}));
console.log(JSON.stringify({passed:true, pages:routes.length, localLinks:links.size, fragmentAnchors:checkedAnchors, renderedImageUrls:images.size, imageBytes, note:'HTTP checks; not a replacement for browser interaction or Core Web Vitals'}, null, 2));
