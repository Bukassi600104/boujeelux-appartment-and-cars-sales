import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('apartment sign-in opts into the compact branded backdrop instead of a plain long section',async()=>{
 const source=await readFile(new URL('../app/admin/login/page.tsx',import.meta.url),'utf8');
 assert.ok(source.includes('auth-page'));
});
