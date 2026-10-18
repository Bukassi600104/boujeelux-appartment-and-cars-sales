import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('static WebP assets declare their image MIME type without changing API or page headers',async()=>{
 const rules=await readFile(new URL('../public/_headers',import.meta.url),'utf8');
 assert.match(rules,/^\/\*\.webp\r?\n[ \t]+Content-Type: image\/webp\s*$/m);
 assert.doesNotMatch(rules,/^\/\*(?:\r?\n|\s+$)/m);
});
