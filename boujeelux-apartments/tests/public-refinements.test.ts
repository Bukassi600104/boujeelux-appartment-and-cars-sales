import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('recent cards expose photo, rate, availability and public apartment links',async()=>{
  const source=await readFile(new URL('../components/public-refinements.tsx',import.meta.url),'utf8');
  assert.match(source,/<Image src=\{a\.photos\[0\]\.src\}/);
  assert.match(source,/rateLabel\(a\.rate\)/);
  assert.match(source,/a\.availability/);
  assert.match(source,/href=\{`\/apartments\/\$\{a\.slug\}`\}/);
  assert.doesNotMatch(source,/availability!=='Unavailable'/);
});

test('recent history uses a browser storage subscription instead of effect-driven state',async()=>{
  const source=await readFile(new URL('../components/public-refinements.tsx',import.meta.url),'utf8');
  assert.match(source,/useSyncExternalStore/);
  assert.match(source,/localStorage/);
});

test('one delegated public listener observes WhatsApp links without intercepting navigation',async()=>{
  const source=await readFile(new URL('../components/public-refinements.tsx',import.meta.url),'utf8');
  assert.match(source,/document\.addEventListener\('click'/);
  assert.match(source,/chatContextForClick/);
  assert.doesNotMatch(source,/onClick=\{record\}/);
  assert.doesNotMatch(source,/preventDefault\(/);
});
