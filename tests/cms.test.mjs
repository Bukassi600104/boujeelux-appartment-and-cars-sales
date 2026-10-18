import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vehicles } from '../lib/vehicles.ts';
let cms;
try { cms = await import('../lib/cms/model.ts'); } catch { cms = {}; }
test('CMS validates price and rejects unsafe media URLs', () => {
  assert.equal(typeof cms.validateContent, 'function', 'Missing CMS validation');
  assert.throws(() => cms.validateContent({ vehicles: [{slug:'car',priceValue:-1,image:'javascript:alert(1)'}],settings:{} }));
});
test('CMS publication excludes drafts and archived stock', () => {
  assert.equal(typeof cms.publicVehicles, 'function', 'Missing publication filter');
  assert.deepEqual(cms.publicVehicles([{slug:'a',status:'published'},{slug:'b',status:'draft'},{slug:'c',status:'archived'}]).map(v=>v.slug), ['a']);
});
test('CMS admin denies arbitrary identity and defaults closed in production', () => {
  assert.equal(typeof cms.isAdmin, 'function', 'Missing admin authorization');
  assert.equal(cms.isAdmin({email:'attacker@test.com',userId:'x'}, '', false), false);
  assert.equal(cms.isAdmin({email:'owner@test.com',userId:'a'}, 'owner@test.com', false), true);
  assert.equal(cms.isAdmin({email:'seedy@sites.test',userId:'local_seedy'}, '', true), true);
  assert.equal(cms.isAdmin(null, 'owner@test.com', false), false);
});
test('CMS enforces same-origin writes', () => {
  assert.equal(typeof cms.sameOrigin, 'function', 'Missing origin validation');
  assert.equal(cms.sameOrigin('https://evil.test', 'http://localhost:5173'), false);
  assert.equal(cms.sameOrigin('http://localhost:5173','http://localhost:5173'), true);
});
test('CMS keeps videos out of image fields and images out of video fields', () => {
  assert.equal(typeof cms.imageUrl?.safeParse, 'function');
  assert.equal(typeof cms.videoUrl?.safeParse, 'function');
  assert.equal(cms.imageUrl.safeParse('/api/media/car.webp').success, true);
  assert.equal(cms.imageUrl.safeParse('/api/media/car.mp4').success, false);
  assert.equal(cms.videoUrl.safeParse('/api/media/car.mp4').success, true);
  assert.equal(cms.videoUrl.safeParse('/api/media/car.webp').success, false);
});
test('CMS optional image overrides can be cleared', () => {
  const result = cms.vehicleSchema.safeParse({...cms.cmsVehicle(vehicles[0]), featuredImage:'', cutout:''});
  assert.equal(result.success, true);
  assert.equal(result.data.featuredImage, undefined);
});
test('Local CMS testing is restricted to actual loopback hostnames', () => {
  assert.equal(typeof cms.isLocalTestHost, 'function');
  for (const host of ['localhost:5173','127.0.0.1:5173','[::1]:5173']) assert.equal(cms.isLocalTestHost(host, true), true);
  for (const host of ['example.test','localhost.evil.test','[2001:db8::1]:5173']) assert.equal(cms.isLocalTestHost(host, true), false);
  assert.equal(cms.isLocalTestHost('localhost:5173', false), false);
});
test('CMS credentials require a safe username and a long UTF-8 password', () => {
  assert.deepEqual(cms.validateCredentials('owner.name', 'correct horse battery staple'), []);
  assert.ok(cms.validateCredentials('bad name', 'correct horse battery staple').length);
  assert.ok(cms.validateCredentials('1owner', 'correct horse battery staple').length);
  assert.ok(cms.validateCredentials('owner', 'short password').length);
  assert.ok(cms.validateCredentials('owner', '😀'.repeat(19)).length, 'password bytes, not just characters, are capped');
});
test('missing persisted content stays empty instead of showing seeded cars', () => {
  const seed={vehicles:[{slug:'seed',status:'published'}],settings:{}};
  assert.deepEqual(cms.publicSnapshot({content:null,revision:0,updatedAt:null},seed).vehicles,[]);
  const live=cms.publicSnapshot({content:{vehicles:[{slug:'live',status:'published'},{slug:'draft',status:'draft'}],settings:{}},revision:3,updatedAt:'now'},seed);
  assert.deepEqual(live.vehicles.map(v=>v.slug),['live']);
  assert.equal(live.revision,3);
});
