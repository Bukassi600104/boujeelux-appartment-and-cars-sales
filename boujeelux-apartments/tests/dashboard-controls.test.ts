import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('apartment dashboard controls have branded button styling and a legible sign-out action', async () => {
  const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
  assert.ok(/\.admin-workspace button:not\(\.button\)\s*\{[^}]*min-height:\s*40px/.test(css),'Style secondary dashboard controls, not browser defaults');
  assert.ok(/\.admin-nav>button\s*\{[^}]*background:\s*transparent;[^}]*color:\s*#fff/.test(css),'White sign-out text needs the forest background, not a white button');
  assert.ok(/\.admin-workspace button:focus-visible[^}]*outline:\s*3px solid/.test(css),'Keep keyboard focus visible');
});

test('mobile dashboard keeps compact branding and all navigation in a separate scrollable row', async () => {
  const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
  assert.ok(/@media\(max-width:900px\)\{\.admin-nav\{display:grid;grid-template-columns:1fr auto/.test(css),'Do not stretch the logo and navigation into a single tall clipped row');
  assert.ok(/\.admin-nav nav\{grid-column:1\/-1;grid-row:2;[^}]*overflow-x:auto/.test(css),'Keep all sections accessible on a dedicated navigation row');
});
