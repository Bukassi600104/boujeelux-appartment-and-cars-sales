import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../components/cms-website-settings.tsx',import.meta.url),'utf8').catch(()=> '');

test('website settings follows edit, review, save draft, preview and publish stages',()=>{
  for(const copy of ['Edit website content','Review changes','Save draft','Preview saved draft','Publish to website'])assert.match(source,new RegExp(copy));
  assert.match(source,/setMode\('review'\)/);
  assert.match(source,/onSaveDraft/);
  assert.match(source,/onPreview/);
  assert.match(source,/onPublish/);
});

test('publication and editing are separately permission gated',()=>{
  assert.match(source,/canEdit/);
  assert.match(source,/canPublish/);
  assert.match(source,/disabled=\{dirty\|\|saving\}/);
  assert.match(source,/disabled=\{dirty\|\|publishing\|\|!canPublish\|\|!publishReady\}/);
});

test('website settings validates client facing fields without raw data editing',()=>{
  assert.match(source,/settingsSchema\.safeParse/);
  assert.doesNotMatch(source,/Featured vehicle slug/);
  for(const label of ['displayed number','call number','WhatsApp','Email addresses','Instagram profile link'])assert.match(source,new RegExp(label));
  assert.match(source,/event\.key==='Escape'/);
  assert.doesNotMatch(source,/JSON\.stringify\(settings|Raw JSON|schema editor/i);
});
