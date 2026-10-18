import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('root lint leaves generated output and independent apartment app to their own checks',async()=>{
 const source=await readFile(new URL('../eslint.config.mjs',import.meta.url),'utf8');
 assert.ok(source.includes('"dist/**"'));
 assert.ok(source.includes('"boujeelux-apartments/**"'));
});
