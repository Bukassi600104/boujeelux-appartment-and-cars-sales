import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';

for (const name of ['boujeelux-nav-transparent.png','boujeelux-footer-transparent.png']) {
  test(`apartment official ${name} ships as a small alpha-enabled PNG`,()=>{
    const file=new URL(`../boujeelux-apartments/public/brand/${name}`,import.meta.url);
    assert.ok(existsSync(file),'The individual official logo asset must be present, not the full presentation sheet');
    const bytes=readFileSync(file);
    assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
    assert.ok(bytes.length<180_000,'Compact logos must not ship full-resolution presentation sheets');
    assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(16)<=512);
    assert.ok(bytes.readUInt32BE(20)>0&&bytes.readUInt32BE(20)<=512);
    assert.ok([4,6].includes(bytes[25]),'Logo encoding must preserve an alpha channel');
  });
}
