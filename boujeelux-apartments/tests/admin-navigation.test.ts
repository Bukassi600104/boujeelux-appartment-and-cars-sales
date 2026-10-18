import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('dashboard defaults to overview and edits only after an explicit manage action',async()=>{
  const source=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  assert.match(source,/useState<View>\('overview'\)/);
  assert.match(source,/Manage apartment/);
  assert.match(source,/view==='editor'/);
  assert.match(source,/Back to apartments/);
  assert.doesNotMatch(source,/href="#(?:overview|apartments|activity)"/);
});

test('dirty edits guard navigation back to listings',async()=>{
  const source=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  assert.match(source,/if\(dirty\).*Save or reload/s);
  assert.match(source,/setView\('apartments'\)/);
});

test('activity navigation shows the truthful WhatsApp click report and bounded role labels',async()=>{
  const source=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  assert.match(source,/WhatsApp clicks/);
  assert.match(source,/<CmsClickReport\/>/);
  assert.doesNotMatch(source,/AdminOperations/);
  assert.match(source,/role==='owner'\?'Super admin':'Sub-admin'/);
  assert.match(source,/role==='viewer'\?' · read only'/);
});
