import assert from 'node:assert/strict';
import test from 'node:test';
import {initialCatalog, saveDraft, publishDraft, validateEnquiry, isLocalDemo, whatsappLink} from '../lib/domain';
import * as domain from '../lib/domain';

test('saving a draft does not publish it; publication is explicit', () => {
  const original = structuredClone(initialCatalog);
  const draft = {...original.records[0].draft, name: 'Updated residence'};
  const saved = saveDraft(original, draft, 1);
  assert.equal(original.records[0].version, 1);
  assert.equal(saved.records[0].version, 2);
  assert.equal(saved.records[0].published?.name, 'The Three-Bedroom Residence');
  const published = publishDraft(saved, 'residence', 2);
  assert.equal(published.records[0].published?.name, 'Updated residence');
});

test('stale edits cannot overwrite another local edit', () => {
  const original = structuredClone(initialCatalog);
  const saved = saveDraft(original, {...original.records[0].draft, name: 'First edit'}, 1);
  assert.throws(() => saveDraft(saved, {...original.records[0].draft, name: 'Stale edit'}, 1), /changed/);
});

test('enquiries reject reversed dates and excessive guest counts', () => {
  const errors = validateEnquiry({name:'',apartment:'The Three-Bedroom Residence',arrival:'2026-10-20',departure:'2026-10-19',guests:'7',duration:'Daily',purpose:'Normal stay',notes:''}, 6, '2026-10-15');
  assert.ok(errors.some(e => e.includes('Departure')));
  assert.ok(errors.some(e => e.includes('capacity')));
});

test('demo edits stay limited to development on loopback', () => {
  assert.equal(isLocalDemo('production', 'true', 'localhost:5180'), false);
  assert.equal(isLocalDemo('development', 'true', 'example.com'), false);
  assert.equal(isLocalDemo('development', 'true', '127.0.0.1:5180'), true);
});

test('WhatsApp drafts encode user text and reject invalid recipients', () => {
  assert.equal(whatsappLink('2349118781995', 'Arrival & stay?'), 'https://wa.me/2349118781995?text=Arrival%20%26%20stay%3F');
  assert.equal(whatsappLink('javascript:alert(1)', 'Hello'), null);
});

test('malformed persisted catalogues are rejected before they can crash a page', () => {
  assert.equal(typeof domain.parseStoredCatalog, 'function');
  assert.equal(domain.parseStoredCatalog({records:[{id:'broken',version:1,draft:{photos:[]}}]}), null);
  assert.equal(domain.parseStoredCatalog({...initialCatalog, records:initialCatalog.records.map(r => ({...r, version:-1}))}), null);
  assert.equal(domain.parseStoredCatalog(initialCatalog)?.records[0].draft.name, 'The Three-Bedroom Residence');
});

test('oversized catalogue writes fail before replacing saved browser content', () => {
  assert.equal(typeof domain.catalogStorageText, 'function');
  const oversized = structuredClone(initialCatalog);
  oversized.records[0].draft.photos[0].src = 'data:image/webp;base64,' + 'A'.repeat(3 * 1024 * 1024);
  assert.throws(() => domain.catalogStorageText(oversized), /storage|limit/i);
  assert.equal(JSON.parse(domain.catalogStorageText(initialCatalog)).records.length, 2);
});
