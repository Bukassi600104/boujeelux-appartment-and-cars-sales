import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

test('legacy QA helper cannot seed or overwrite production content', () => {
  const result=spawnSync(process.execPath,['scripts/dual-cms-qa.mjs','run'],{encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.ok(/retired/i.test(result.stderr),'Refuse the legacy command before touching accounts or content');
});

test('an uninitialized private catalogue opens an empty manager, not a seed or service error', async () => {
  const source=await readFile(new URL('../lib/cms/store.ts',import.meta.url),'utf8');
  assert.ok(source.includes('emptyContent()'),'Use company settings with an empty vehicle array');
  assert.ok(!source.includes('CMS content has not been initialized.'),'Fresh setup is not an error');
});
