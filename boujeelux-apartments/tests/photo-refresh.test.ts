import assert from 'node:assert/strict';
import test from 'node:test';
import {initialCatalog,parseStoredCatalog} from '../lib/domain';

test('refreshing legacy placeholder galleries preserves saved listing edits', () => {
  const saved=structuredClone(initialCatalog);
  saved.records[0].version=7;
  saved.records[0].draft.name='My saved residence name';
  saved.records[0].draft.rate.amount='140000';
  for(const record of saved.records){
    const photos=[{src:'/images/living.webp',alt:'Illustrative room',illustrative:true}];
    record.draft.photos=structuredClone(photos);
    if(record.published)record.published.photos=structuredClone(photos);
  }
  const refreshed=parseStoredCatalog(saved)!;
  assert.equal(refreshed.records[0].draft.name,'My saved residence name');
  assert.equal(refreshed.records[0].draft.rate.amount,'140000');
  assert.equal(refreshed.records[0].version,7);
  assert.equal(refreshed.records[0].draft.photos[0].src,'/images/boujeelux-01-living-tv-and-seating.webp');
  assert.equal(refreshed.records[0].published?.photos[0].illustrative,false);
  assert.equal((refreshed.records[0].draft.photos[0] as {scope?:string}).scope,'property-wide');
  assert.equal(refreshed.records[1].draft.photos[0].src,'/images/boujeelux-05-studio-lounge-overview.webp');
  assert.equal(saved.records[0].draft.photos[0].src,'/images/living.webp');
});

test('a custom CMS photo gallery is never replaced by the photography refresh', () => {
  const saved=structuredClone(initialCatalog);
  saved.records[0].draft.photos=[{src:'data:image/webp;base64,AAAA',alt:'My uploaded photo',illustrative:false}];
  saved.records[0].published=null;
  const refreshed=parseStoredCatalog(saved)!;
  assert.deepEqual(refreshed.records[0].draft.photos,saved.records[0].draft.photos);
  assert.equal(refreshed.records[0].published,null);
});

test('the apartments page exposes all 20 separate property photos for viewing', async () => {
  const response=await fetch('http://127.0.0.1:5180/apartments',{signal:AbortSignal.timeout(90000)});
  const html=await response.text();
  assert.equal(response.status,200);
  assert.equal((html.match(/data-property-photo="\d+"/g)??[]).length,20);
  assert.match(html,/id="property-gallery"/);
});
