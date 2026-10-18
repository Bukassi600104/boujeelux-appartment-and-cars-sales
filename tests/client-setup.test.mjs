import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { setupRecords } from '../scripts/lib/client-setup.mjs';

test('review setup creates separate independent initial credentials without reusing developer identities', () => {
  const records = setupRecords('client');
  assert.deepEqual(records.map(x => x.site), ['chida', 'boujeelux']);
  assert.deepEqual(records.map(x => x.username), ['chida-client', 'boujeelux-client']);
  assert.equal(new Set(records.flatMap(x => [x.password, x.bootstrapToken])).size, 4);
  for (const x of records) {
    assert.match(x.password, /^[A-Za-z0-9_-]{32}$/);
    assert.match(x.bootstrapToken, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(x.hash, createHash('sha256').update(x.bootstrapToken).digest('hex'));
    assert.equal(x.provisioned, undefined);
  }
});

test('account purpose cannot inject arbitrary usernames or replace supported identity scopes', () => {
  assert.throws(() => setupRecords('../developer'), /purpose/);
  assert.notEqual(setupRecords('client')[0].password, setupRecords('client')[0].password);
});
