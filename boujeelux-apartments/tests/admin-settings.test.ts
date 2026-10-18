import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('settings is separate lower navigation and role-aware editing defaults closed',async()=>{
  const admin=await readFile(new URL('../components/admin.tsx',import.meta.url),'utf8');
  assert.match(admin,/admin-nav-secondary[\s\S]*Settings/);
  assert.match(admin,/useState<AdminRole>\('viewer'\)/);
  assert.match(admin,/canManageListings/);
  assert.match(admin,/canManageMedia/);
  assert.match(admin,/className="media-permission" disabled=\{!canManageListings\}/);
  assert.match(admin,/Replace photo<input type="file"[^>]*disabled=\{!canManageMedia\}/);
  assert.match(admin,/disabled=\{!canManageMedia\|\|apartment\.photos\.length >= 12\}/);
  assert.match(admin,/type="submit" disabled=\{!canManageListings\}/);
  assert.match(admin,/publishContent:false/);
  assert.match(admin,/canPublish=\{permissions\.publishContent\}/);
  assert.match(admin,/disabled=\{!canManageListings\|\|!canPublish\|\|changedElsewhere\}/);
});

test('settings uses constrained account and password forms without exposing secrets or raw records',async()=>{
  const source=await readFile(new URL('../components/cms-settings-panel.tsx',import.meta.url),'utf8');
  assert.match(source,/\/api\/admin\/accounts/);
  assert.match(source,/\/api\/admin\/password/);
  assert.match(source,/acknowledged:true/);
  assert.match(source,/Temporary password/);
  for(const label of ['Publish to the live website','Upload photos to the media library','Edit website settings'])assert.match(source,new RegExp(label));
  assert.match(source,/Manage \$\{listingLabel\} \(details and galleries\)/);
  assert.match(source,/listingLabel/);
  assert.match(source,/Promise\.resolve\(\)\.then/);
  assert.match(source,/let active=true/);
  assert.match(source,/return\(\)=>\{active=false;\}/);
  assert.doesNotMatch(source,/UUID|Raw JSON|secret returned/i);
});

test('history table uses human labels only',async()=>{
  const source=await readFile(new URL('../components/cms-settings-panel.tsx',import.meta.url),'utf8');
  for(const label of ['Date','Time','Item / file','Action / result','Team member'])assert.match(source,new RegExp(label));
  assert.doesNotMatch(source,/>ID<|>Payload<|>Token</);
});
