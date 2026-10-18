import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('Edge function bundle can be reproduced from canonical shared CMS sources',()=>{
  const result=spawnSync(process.execPath,['scripts/prepare-cms-function.mjs','--check'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout||'bundle check failed');
});
