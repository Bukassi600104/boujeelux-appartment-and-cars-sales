import assert from 'node:assert/strict';
import test from 'node:test';
import {initialCatalog,parseStoredCatalog,validateApartment} from '../lib/domain';
import {chatContextForClick,createApartmentDraft,parseRecentSlugs,pushRecentSlug,validListingSlug} from '../lib/refinements';

test('legacy photos remain valid and optional labels are trimmed and bounded',()=>{
  assert.ok(parseStoredCatalog(structuredClone(initialCatalog)));
  const apartment=structuredClone(initialCatalog.records[0].draft);
  apartment.photos[0].label=' Living room ';
  assert.deepEqual(validateApartment(apartment),[]);
  apartment.photos[0].label='x'.repeat(101);
  assert.match(validateApartment(apartment).join(' '),/label/i);
});

test('chat activity accepts only bounded listing slugs or general context',()=>{
  assert.equal(validListingSlug(''),true);
  assert.equal(validListingSlug('studio-suite'),true);
  assert.equal(validListingSlug('../admin'),false);
  assert.equal(validListingSlug('x'.repeat(101)),false);
});

test('new apartment factory is detached from the catalogue',()=>{
  const before=structuredClone(initialCatalog);
  const draft=createApartmentDraft('new-id');
  assert.equal(draft.id,'new-id');
  assert.equal(draft.availability,'Ask about dates');
  assert.deepEqual(initialCatalog,before);
});

test('recent apartment history survives malformed storage and stays bounded without duplicates',()=>{
  assert.deepEqual(parseRecentSlugs('{bad'),[]);
  assert.deepEqual(parseRecentSlugs('["a",3,"b","a"]'),['a','b']);
  assert.deepEqual(pushRecentSlug(['a','b','c'],'b',3),['b','a','c']);
  assert.deepEqual(pushRecentSlug(['a','b','c'],'d',3),['d','a','b']);
});

test('delegated chat tracking accepts only WhatsApp links and known published route context',()=>{
  assert.deepEqual(chatContextForClick('/apartments/studio-suite','https://wa.me/2349000000000',['studio-suite']),{track:true,listingSlug:'studio-suite'});
  assert.deepEqual(chatContextForClick('/contact','https://wa.me/2349000000000',[]),{track:true,listingSlug:''});
  assert.deepEqual(chatContextForClick('/apartments/draft','https://wa.me/2349000000000',['studio-suite']),{track:true,listingSlug:''});
  assert.deepEqual(chatContextForClick('/contact','https://instagram.com/boujeelux',[]),{track:false,listingSlug:''});
});
