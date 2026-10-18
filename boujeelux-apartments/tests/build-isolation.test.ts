import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

test('apartment app owns a plain-CSS PostCSS configuration',async()=>{
  const source=await readFile(new URL('../postcss.config.mjs',import.meta.url),'utf8');
  assert.match(source,/plugins\s*:\s*\{\s*\}/);
  assert.doesNotMatch(source,/tailwind/i);
});
