import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('hosted CMS describes actual live publishing and normalized storage accurately', async () => {
  const source=await readFile(new URL('../components/admin.tsx', import.meta.url),'utf8');
  assert.doesNotMatch(source,/Publish locally|Unpublish locally|local browser only|browser’s demo|browser’s combined storage limit|Private local draft/);
  assert.match(source,/Publish to website/);
  assert.match(source,/changes the public website/);
});
