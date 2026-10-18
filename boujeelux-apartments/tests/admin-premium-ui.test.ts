import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('client dashboard uses truthful branded states and no invented listing photograph',async()=>{
  const source=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  assert.match(source,/No apartments yet/);
  assert.match(source,/<CmsClickReport\/>/);
  const report=await readFile(new URL('../components/cms-click-report.tsx',import.meta.url),'utf8');
  assert.match(report,/Loading recorded activity/);
  assert.match(source,/No cover photo/);
  assert.doesNotMatch(source,/photos\[0\]\?\.src\|\|'\/images\/boujeelux-/);
  assert.doesNotMatch(source,/audit events|media items/);
});

test('photo editor exposes client-facing cover, order, replace and remove controls without raw data fields',async()=>{
  const source=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  for(const label of ['Set as cover','Move earlier','Move later','Replace photo','Remove from draft'])assert.match(source,new RegExp(label));
  assert.doesNotMatch(source,/>Raw JSON<|>Schema<|>Configuration JSON<|JSON\.stringify\([^)]*\)<\/textarea>/);
});

test('persistent sidebar footer owns website and sign-out actions',async()=>{
  const source=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  assert.match(source,/className="admin-nav-footer"/);
  assert.match(source,/admin-nav-footer[\s\S]*View website[\s\S]*Sign out/);
  assert.doesNotMatch(source,/admin-head-actions[\s\S]*View website/);
});
