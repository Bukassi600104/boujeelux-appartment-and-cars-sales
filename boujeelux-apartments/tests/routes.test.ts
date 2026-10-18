import assert from 'node:assert/strict';
import test from 'node:test';

// Integration contract: run the local preview before `npm test`.
const origin = 'http://127.0.0.1:5180';
for (const path of ['/', '/apartments', '/apartments/three-bedroom-residence', '/apartments/studio-suite', '/our-approach', '/contact', '/enquire', '/privacy', '/admin', '/admin/preview/residence']) {
  test(`Boujeelux renders ${path} without a missing-module build error`, async () => {
    const response = await fetch(origin + path, {signal: AbortSignal.timeout(60000)});
    const html = await response.text();
    assert.equal(response.status, 200, `${path}: ${html.slice(0, 350)}`);
    assert.match(html, /<h1[\s>]/, `${path}: meaningful page heading`);
    assert.doesNotMatch(html, /Module not found: Can't resolve/, `${path}: module resolution`);
  });
}

test('Boujeelux serves every seeded illustrative room image', async () => {
  for (const path of ['/images/living.webp', '/images/bedroom.webp', '/images/detail.webp']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get('content-type') ?? '', /^image\//, path);
    assert.ok((await response.arrayBuffer()).byteLength > 0, path);
  }
});
