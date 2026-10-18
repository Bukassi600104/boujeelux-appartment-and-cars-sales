import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {hostedCatalog,initialCatalog} from '../lib/domain';

test('missing hosted content remains a genuinely empty catalogue',()=>{
  assert.deepEqual(hostedCatalog(null),{records:[]});
  assert.deepEqual(hostedCatalog(undefined),{records:[]});
  assert.notDeepEqual(hostedCatalog(null),initialCatalog);
});

test('hosted empty and populated catalogues persist without reseeding',()=>{
  assert.deepEqual(hostedCatalog({records:[]}),{records:[]});
  const saved=structuredClone(initialCatalog);
  assert.deepEqual(hostedCatalog(saved),saved);
});

test('production public, admin, preview and reload paths never fall back to business seed content',async()=>{
  const files=['../lib/cms-server.ts','../components/catalog.tsx','../app/admin/page.tsx','../app/admin/preview/[id]/page.tsx'];
  for(const file of files){
    const source=await readFile(new URL(file,import.meta.url),'utf8');
    assert.doesNotMatch(source,/structuredClone\(initialCatalog\)|initial=initialCatalog/);
  }
});
